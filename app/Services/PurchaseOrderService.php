<?php

namespace App\Services;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PurchaseOrderService
{
    public function __construct(
        private readonly AuditLogService $auditLogService
    ) {}

    public function generateDocumentNumber(): string
    {
        $prefix = 'PO-'.now()->format('Ymd').'-';
        $last = PurchaseOrder::where('document_number', 'like', $prefix.'%')
            ->orderByDesc('document_number')
            ->value('document_number');

        $next = $last ? (int) Str::afterLast($last, '-') + 1 : 1;

        return $prefix.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    public function createOrder(array $data, array $items, int $userId): PurchaseOrder
    {
        return DB::transaction(function () use ($data, $items, $userId) {
            $order = PurchaseOrder::create([
                'supplier_id' => $data['supplier_id'] ?? null,
                'warehouse_id' => $data['warehouse_id'] ?? null,
                'document_number' => $data['document_number'] ?? $this->generateDocumentNumber(),
                'status' => 'draft',
                'notes' => $data['notes'] ?? null,
                'created_by' => $userId,
            ]);

            foreach ($items as $item) {
                PurchaseOrderItem::create([
                    'purchase_order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'qty_ordered' => $item['qty_ordered'],
                    'qty_received' => 0,
                    'unit_price' => $item['unit_price'],
                ]);
            }

            $this->auditLogService->log(
                event: 'purchase_order.created',
                module: 'purchase',
                auditable: $order,
                description: 'Purchase order '.$order->document_number.' dibuat.',
                after: [
                    'document_number' => $order->document_number,
                    'supplier_id' => $order->supplier_id,
                    'status' => 'draft',
                    'total_items' => count($items),
                ],
                meta: ['purchase_order_id' => $order->id],
            );

            return $order;
        });
    }

    public function placeOrder(PurchaseOrder $order): void
    {
        DB::transaction(function () use ($order) {
            // ponytail: lock + re-check inside the transaction so a concurrent place/cancel cannot race.
            $order = PurchaseOrder::whereKey($order->id)->lockForUpdate()->firstOrFail();

            if ($order->status !== 'draft') {
                throw ValidationException::withMessages(['status' => 'PO tidak dapat dipesan.']);
            }

            $before = $order->replicate();

            $order->update([
                'status' => 'ordered',
                'ordered_at' => now(),
            ]);

            $this->auditLogService->log(
                event: 'purchase_order.ordered',
                module: 'purchase',
                auditable: $order,
                description: 'Purchase order '.$order->document_number.' dipesan ke supplier.',
                before: ['status' => $before->status],
                after: ['status' => 'ordered'],
                meta: ['purchase_order_id' => $order->id],
            );
        });
    }

    public function cancelOrder(PurchaseOrder $order): void
    {
        DB::transaction(function () use ($order) {
            // ponytail: lock + re-check inside the transaction so a concurrent cancel/receive cannot race.
            $order = PurchaseOrder::whereKey($order->id)->lockForUpdate()->firstOrFail();

            if (! in_array($order->status, ['draft', 'ordered', 'partial_received'])) {
                throw ValidationException::withMessages(['status' => 'PO tidak dapat dibatalkan.']);
            }

            $before = $order->replicate();

            $order->update([
                'status' => 'cancelled',
            ]);

            $this->auditLogService->log(
                event: 'purchase_order.cancelled',
                module: 'purchase',
                auditable: $order,
                description: 'Purchase order '.$order->document_number.' dibatalkan.',
                before: ['status' => $before->status],
                after: ['status' => 'cancelled'],
                meta: ['purchase_order_id' => $order->id],
            );
        });
    }
}
