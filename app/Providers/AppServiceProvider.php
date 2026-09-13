<?php

namespace App\Providers;

use App\Models\Payable;
use App\Models\Receivable;
use App\Models\StockMutation;
use App\Models\Transaction;
use App\Observers\PayableObserver;
use App\Observers\ReceivableObserver;
use App\Observers\StockMutationObserver;
use App\Observers\TransactionObserver;
use App\Services\NotificationService;
use App\Support\ProductionSecurityBaseline;
use Illuminate\Auth\Events\Failed;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(env('API_RATE_LIMIT_PER_MINUTE', 120))
                ->by($request->user()?->id ?: $request->ip());
        });

        // API documentation (Scramble) is public — open source project, docs should be viewable
        // by anyone. Protect via SCRAMBLE_DOCS_TOKEN env if desired (RestrictedDocsAccess).
        Gate::define('viewApiDocs', fn () => true);

        Transaction::observe(TransactionObserver::class);
        StockMutation::observe(StockMutationObserver::class);
        Receivable::observe(ReceivableObserver::class);
        Payable::observe(PayableObserver::class);

        Event::listen(Failed::class, function (Failed $event) {
            $email = $event->credentials['email'] ?? 'unknown';
            $ip = request()->ip();

            // Throttle per email + IP so brute-force attempts cannot flood the
            // notifications table with one alert per super-admin per attempt.
            if (! Cache::add("login-failed-notified:{$email}:{$ip}", true, now()->addMinutes(5))) {
                return;
            }

            app(NotificationService::class)->notifySuperAdmins([
                'type' => 'security',
                'title' => 'Percobaan login gagal',
                'message' => $email.' dari IP '.$ip,
                'url' => route('audit-logs.index'),
                'meta' => [],
            ]);
        });

        $issues = ProductionSecurityBaseline::issues();

        if ($issues !== []) {
            Log::warning('Production security baseline check failed.', [
                'issues' => $issues,
            ]);
        }
    }
}
