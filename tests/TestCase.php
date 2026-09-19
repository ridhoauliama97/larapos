<?php

namespace Tests;

use App\Support\BotGuard;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Crypt;
use Spatie\LaravelPdf\Facades\Pdf;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // PDF generation is stubbed so tests never depend on a live Gotenberg engine
        Pdf::fake();
    }

    protected function botGuardPayload(): array
    {
        $payload = BotGuard::payload();

        return [
            $payload['honeypot_field'] => '',
            $payload['token_field'] => Crypt::encryptString(json_encode([
                'iat' => now()->subSeconds(max(3, config('security.bot_guard.min_submit_seconds', 2) + 1))->timestamp,
                'nonce' => 'test-nonce',
            ], JSON_THROW_ON_ERROR)),
        ];
    }

    protected function recentlyConfirmedSession(): array
    {
        return [
            'auth.password_confirmed_at' => time(),
        ];
    }
}
