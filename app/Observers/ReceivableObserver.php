<?php

namespace App\Observers;

use App\Models\Receivable;
use App\Services\NotificationService;

class ReceivableObserver
{
    /**
     * Handle the Receivable "created" event.
     */
    public function created(Receivable $receivable): void
    {
        $receivable->loadMissing('customer');

        app(NotificationService::class)->notifyPermission('receivables-access', [
            'type' => 'receivable',
            'title' => 'Piutang baru '.$receivable->invoice,
            'message' => ($receivable->customer?->name ?? 'Umum').' - total '.$receivable->total,
            'url' => route('receivables.index'),
            'meta' => ['receivable_id' => $receivable->id],
        ]);
    }
}
