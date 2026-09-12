<?php

namespace App\Services;

use App\Models\GoodsReceiving;
use App\Models\GoodsReceivingItem;
use App\Models\Payable;
use App\Models\ProductBatch;
use App\Models\ProductWarehouse;
use App\Models\PurchaseOrder;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class GoodsReceivingService
{
    public function __construct(
        private readonly StockMutationService $stockMutationService,
        private readonly AuditLogService $auditLogService
    ) {}

    public function generateDocumentNumber(): string
    {
        $prefix = 'GR-'.now()->format('Ymd').'-';
        $last = GoodsReceiving::where('document_number', 'like', $prefix.'%')
            ->orderByDesc('document_number')
            ->value('document_number');

        $next = $last ? (int) Str::afterLast($last, '-') + 1 : 1;

        return $prefix.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    public function receive(PurchaseOrder $order, array $items, ?string $notes, int $userId): GoodsReceiving
    {
        // ponytail: retry only on document_number unique collisions (concurrent receipts pick the same next number)
        return retry(3, function () use ($order, $items, $notes, $userId) {
            return DB::transaction(function () use ($order, $items, $notes, $userId) {
                // ponytail: lock the order + its items so concurrent receipts cannot double-consume the same PO item
                $order = PurchaseOrder::with('items')->whereKey($order->id)->lockForUpdate()->firstOrFail();

                if (! in_array($order->status, ['ordered', 'partial_received'])) {
                    throw ValidationException::withMessages([
                        'purchase_order_id' => 'Hanya PO berstatus ordered/partial yang dapat diterima.',
                    ]);
                }

                $receiving = GoodsReceiving::create([
                    'purchase_order_id' => $order->id,
                    'supplier_id' => $order->supplier_id,
                    'warehouse_id' => $order->warehouse_id,
                    'document_number' => $this->generateDocumentNumber(),
                    'notes' => $notes,
                    'received_by' => $userId,
                    'received_at' => now(),
                ]);

                foreach ($items as $item) {
                    $poItem = $order->items->firstWhere('id', $item['purchase_order_item_id']);
                    if (! $poItem) {
                        throw ValidationException::withMessages([
                            'items' => 'Item tidak ditemukan di PO.',
                        ]);
                    }
                    $qtyReceived = (int) $item['qty_received'];

                    $outstanding = $poItem->qty_ordered - $poItem->qty_received;
                    if ($qtyReceived > $outstanding) {
                        throw ValidationException::withMessages([
                            'items' => "Qty diterima melebihi sisa item {$poItem->product_id}.",
                        ]);
                    }

                    GoodsReceivingItem::create([
                        'goods_receiving_id' => $receiving->id,
                        'purchase_order_item_id' => $poItem->id,
                        'product_id' => $poItem->product_id,
                        'qty_received' => $qtyReceived,
                        'notes' => $item['notes'] ?? null,
                    ]);

                    $poItem->increment('qty_received', $qtyReceived);

                    $product = $poItem->product;
                    $stockBefore = (int) $product->stock;
                    // Increment legacy stock
                    $product->increment('stock', $qtyReceived);
                    // Increment warehouse pivot stock
                    if ($order->warehouse_id) {
                        ProductWarehouse::firstOrCreate(
                            ['product_id' => $product->id, 'warehouse_id' => $order->warehouse_id],
                            ['stock' => 0]
                        )->increment('stock', $qtyReceived);
                    }

                    // Create batch record
                    if (! empty($item['batch_number']) && $order->warehouse_id) {
                        ProductBatch::create([
                            'product_id' => $product->id,
                            'warehouse_id' => $order->warehouse_id,
                            'batch_number' => $item['batch_number'],
                            'expired_at' => $item['expired_at'] ?? null,
                            'received_at' => now(),
                            'stock' => $qtyReceived,
                        ]);
                    }

                    $this->stockMutationService->recordPurchaseInbound(
                        product: $product,
                        goodsReceiving: $receiving,
                        qty: $qtyReceived,
                        stockBefore: $stockBefore,
                        stockAfter: (int) $product->stock,
                        notes: 'Penerimaan dari PO '.$order->document_number,
                        userId: $userId,
                    );
                }

                $this->updateOrderStatus($order);

                if ($receiving->supplier_id) {
                    $this->createOrUpdatePayable($order, $receiving, $userId);
                }

                $this->auditLogService->log(
                    event: 'goods_receiving.created',
                    module: 'purchase',
                    auditable: $receiving,
                    description: 'Barang diterima dari PO '.$order->document_number,
                    after: [
                        'document_number' => $receiving->document_number,
                        'purchase_order_id' => $order->id,
                        'total_items' => count($items),
                    ],
                    meta: ['goods_receiving_id' => $receiving->id],
                );

                return $receiving;
            });
        }, 0, function ($e) {
            return $e instanceof QueryException && str_contains($e->getMessage(), 'document_number');
        });
    }

    private function updateOrderStatus(PurchaseOrder $order): void
    {
        $allFullyReceived = $order->items()->whereColumn('qty_received', '<', 'qty_ordered')->doesntExist();

        $status = $allFullyReceived ? 'completed' : 'partial_received';
        $updates = ['status' => $status];

        if ($status === 'completed') {
            $updates['completed_at'] = now();
        }

        $order->update($updates);
    }

    private function createOrUpdatePayable(PurchaseOrder $order, GoodsReceiving $receiving, int $userId): void
    {
        // ponytail: total is the sum across ALL receivings of this PO so partial receipts accumulate.
        $total = (float) DB::table('goods_receiving_items')
            ->join('goods_receivings', 'goods_receivings.id', '=', 'goods_receiving_items.goods_receiving_id')
            ->leftJoin('purchase_order_items', 'purchase_order_items.id', '=', 'goods_receiving_items.purchase_order_item_id')
            ->where('goods_receivings.purchase_order_id', $order->id)
            ->sum(DB::raw('goods_receiving_items.qty_received * COALESCE(purchase_order_items.unit_price, 0)'));

        $payable = Payable::firstOrNew(['purchase_order_id' => $order->id]);
        $wasNew = ! $payable->exists;

        // Fallback only for a first-time payable, otherwise later receivings would double-count ordered qty.
        if ($wasNew && $total <= 0) {
            $total = (float) $order->items()->sum(DB::raw('qty_ordered * unit_price'));
        }

        $payable->fill([
            'supplier_id' => $order->supplier_id,
            'document_number' => $receiving->document_number,
            'total' => $total,
            'note' => 'Otomatis dari penerimaan PO '.$order->document_number,
        ]);

        if ($wasNew) {
            $payable->paid = 0;
            $payable->due_date = now()->addDays(30);
            $payable->status = 'unpaid';
        } else {
            // Preserve existing paid/due_date and only derive the status from the new total.
            $paid = (float) $payable->paid;
            $payable->status = $paid <= 0 ? 'unpaid' : ($paid >= $total ? 'paid' : 'partial');
        }

        $payable->save();

        if ($wasNew) {
            $this->auditLogService->log(
                event: 'payable.created_from_receiving',
                module: 'payable',
                auditable: $payable,
                description: 'Hutang otomatis dari penerimaan PO '.$order->document_number,
                after: [
                    'payable_id' => $payable->id,
                    'supplier_id' => $payable->supplier_id,
                    'total' => $payable->total,
                    'document_number' => $payable->document_number,
                    'purchase_order_id' => $order->id,
                ],
                meta: ['goods_receiving_id' => $receiving->id],
            );
        }
    }
}
