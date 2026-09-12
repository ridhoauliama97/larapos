<?php

namespace App\Support;

class PhoneNumber
{
    /**
     * Strip non-digit characters while keeping the leading "0" intact.
     * The WhatsApp service converts "0…" numbers to "62…" itself.
     */
    public static function normalize(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $digits = preg_replace('/[^0-9]/', '', $value);

        return $digits === '' ? null : $digits;
    }
}
