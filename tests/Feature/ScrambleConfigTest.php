<?php

namespace Tests\Feature;

use Illuminate\Support\Arr;
use Tests\TestCase;

class ScrambleConfigTest extends TestCase
{
    /**
     * `php artisan config:cache` exports every config value with var_export() and evals it back.
     * Objects without __set_state() (e.g. Scramble's SecurityScheme) break the command.
     */
    public function test_scramble_config_can_be_serialized_for_config_cache(): void
    {
        foreach (Arr::dot(config('scramble')) as $key => $value) {
            try {
                eval(var_export($value, true).';');
            } catch (\Throwable $e) {
                $this->fail("Config [scramble.{$key}] is not serializable: {$e->getMessage()}");
            }
        }

        $this->assertTrue(true);
    }
}
