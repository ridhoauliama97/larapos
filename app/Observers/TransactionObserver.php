<?php

namespace App\Observers;

use App\Models\Transaction;
use App\Services\NotificationService;
use Illuminate\Support\Facades\DB;

class TransactionObserver
{
    /**
     * Handle the Transaction "created" event.
     */
    public function created(Transaction $transaction): void
    {
        // Defer until the surrounding checkout transaction commits so line items
        // and stock mutations are visible to the notification logic.
        $notify = function () use ($transaction): void {
            $transaction->load('details.product');

            $service = app(NotificationService::class);

            $service->notifyPermission('reports-access', [
                'type' => 'transaction',
                'title' => 'Transaksi baru '.$transaction->invoice,
                'message' => 'Total '.$transaction->grand_total,
                'url' => route('transactions.history'),
                'meta' => [
                    'transaction_id' => $transaction->id,
                    'invoice' => $transaction->invoice,
                ],
            ], $transaction->cashier_id);

            foreach ($transaction->details->pluck('product')->filter()->unique('id') as $product) {
                $service->checkLowStock($product);
            }
        };

        if (DB::transactionLevel() > 0) {
            DB::afterCommit($notify);
        } else {
            $notify();
        }
    }
}
