<?php

namespace App\Observers;

use App\Models\Payable;
use App\Services\NotificationService;

class PayableObserver
{
    /**
     * Handle the Payable "created" event.
     */
    public function created(Payable $payable): void
    {
        $payable->loadMissing('supplier');

        app(NotificationService::class)->notifyPermission('payables-access', [
            'type' => 'payable',
            'title' => 'Hutang baru '.$payable->document_number,
            'message' => ($payable->supplier?->name ?? 'Supplier').' - total '.$payable->total,
            'url' => route('payables.index'),
            'meta' => ['payable_id' => $payable->id],
        ]);
    }
}
