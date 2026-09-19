<?php

namespace App\Support;

class ProductionSecurityBaseline
{
    /**
     * @return array<int, array{key: string, message: string}>
     */
    public static function issues(): array
    {
        if (config('app.env') !== 'production') {
            return [];
        }

        $issues = [];

        if (config('app.debug')) {
            $issues[] = [
                'key' => 'app_debug',
                'message' => 'APP_DEBUG masih aktif. Nonaktifkan debug di production.',
            ];
        }

        // APP_URL HTTPS + secure cookie go together: they are only satisfiable
        // behind TLS. Skip both when the deployment explicitly opts out
        // (SECURITY_BASELINE_ALLOW_HTTP=true) for local/LAN HTTP testing.
        $allowHttp = filter_var(config('security.baseline.allow_http'), FILTER_VALIDATE_BOOL);

        if (! $allowHttp) {
            $appUrl = (string) config('app.url');

            if (blank($appUrl) || ! str_starts_with($appUrl, 'https://')) {
                $issues[] = [
                    'key' => 'app_url_https',
                    'message' => 'APP_URL harus menggunakan HTTPS yang valid di production.',
                ];
            }

            if (config('session.secure') !== true) {
                $issues[] = [
                    'key' => 'session_secure_cookie',
                    'message' => 'SESSION_SECURE_COOKIE harus bernilai true di production.',
                ];
            }
        }

        return $issues;
    }

    public static function hasIssues(): bool
    {
        return self::issues() !== [];
    }
}
