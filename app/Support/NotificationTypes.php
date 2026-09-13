<?php

namespace App\Support;

use App\Models\User;

final class NotificationTypes
{
    /**
     * Every system notification type that can be toggled per user.
     *
     * @var array<int, string>
     */
    public const TYPES = [
        'transaction',
        'low_stock',
        'stock_mutation',
        'stock_transfer',
        'receivable',
        'payable',
        'security',
    ];

    /**
     * All types enabled — used for users without stored preferences.
     *
     * @return array<string, bool>
     */
    public static function defaults(): array
    {
        return array_fill_keys(self::TYPES, true);
    }

    /**
     * Effective preferences for a user, filling missing keys as enabled.
     *
     * @return array<string, bool>
     */
    public static function forUser(User $user): array
    {
        $stored = $user->notification_preferences ?? [];
        $preferences = [];

        foreach (self::TYPES as $type) {
            $preferences[$type] = ($stored[$type] ?? true) !== false;
        }

        return $preferences;
    }
}
