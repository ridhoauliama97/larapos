<?php

/**
 * One-off data migration: SQLite (source) -> PostgreSQL (default connection).
 *
 * Copies every table that exists on both sides, skipping Laravel's
 * system/runtime tables (migrations, sessions, cache, jobs). Converts
 * booleans and empty strings, truncates targets first, then realigns
 * id sequences. Storage/app files are copied separately via docker cp.
 *
 * Usage (inside the app container):
 *   docker compose --env-file .env.production cp database/database.sqlite app:/tmp/source.sqlite
 *   docker compose --env-file .env.production exec app php docker/tools/sqlite-to-pg.php /tmp/source.sqlite
 */

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

// run from the app base dir; fall back to the script's own location
$base = is_file(getcwd().'/vendor/autoload.php') ? getcwd() : __DIR__.'/../..';

require $base.'/vendor/autoload.php';

$app = require $base.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$sourceFile = $argv[1] ?? '/tmp/source.sqlite';

if (! is_file($sourceFile)) {
    fwrite(STDERR, "Source sqlite file not found: {$sourceFile}\n");
    exit(1);
}

config(['database.connections.sqlite_source' => [
    'driver' => 'sqlite',
    'database' => $sourceFile,
    'prefix' => '',
    'foreign_key_constraints' => false,
]]);

$src = DB::connection('sqlite_source');
$dst = DB::connection();

$skip = ['migrations', 'sessions', 'cache', 'cache_locks', 'jobs', 'job_batches', 'failed_jobs'];

$sourceTables = collect($src->select(
    "select name from sqlite_master where type='table' and name not like 'sqlite_%'"
))
    ->pluck('name')
    ->reject(fn ($name) => in_array($name, $skip, true))
    ->values();

// keep only tables that also exist on the target
$tables = $sourceTables->filter(function ($name) use ($dst) {
    return $dst->selectOne('select to_regclass(?) is not null as ok', ['public."'.$name.'"'])->ok;
});

if ($tables->isEmpty()) {
    fwrite(STDERR, "No matching tables found.\n");
    exit(1);
}

$quoted = fn ($name) => '"'.str_replace('"', '', $name).'"';

// truncate every target data table in one statement so FK references are satisfied
$dst->statement('TRUNCATE TABLE '.implode(', ', $tables->map($quoted)->all()).' CASCADE');

// bypass FK checks during bulk insert (we connect as superuser)
$dst->statement('SET session_replication_role = replica');

$summary = [];

foreach ($tables as $table) {
    $pgColumns = $dst->select(
        "select column_name, data_type from information_schema.columns
         where table_schema = 'public' and table_name = ?",
        [$table]
    );
    $sqliteColumns = collect($src->select('pragma table_info('.$quoted($table).')'))->pluck('name');

    $types = collect($pgColumns)
        ->mapWithKeys(fn ($c) => [$c->column_name => $c->data_type])
        ->only($sqliteColumns->all());

    if ($types->isEmpty()) {
        $summary[$table] = 'skipped (no common columns)';

        continue;
    }

    $columns = $types->keys()->values();
    $booleanCols = $types->filter(fn ($type) => $type === 'boolean')->keys();
    $nullableCols = $types
        ->reject(fn ($type) => in_array($type, ['text', 'character varying', 'character', 'json', 'jsonb'], true))
        ->keys();

    $count = 0;
    $batch = [];

    $flush = function () use (&$batch, &$count, $dst, $table) {
        if ($batch === []) {
            return;
        }
        $dst->table($table)->insert($batch);
        $count += count($batch);
        $batch = [];
    };

    foreach ($src->table($table)->select($columns->all())->cursor() as $row) {
        $row = (array) $row;
        $converted = [];

        foreach ($columns as $column) {
            $value = $row[$column];
            $type = $types[$column];

            if ($value === null) {
                $converted[$column] = null;
            } elseif (in_array($column, $booleanCols->all(), true)) {
                $converted[$column] = match ((string) $value) {
                    '1', 'true' => true,
                    default => false,
                };
            } elseif ($value === '' && in_array($column, $nullableCols->all(), true)) {
                $converted[$column] = null;
            } else {
                $converted[$column] = $value;
            }
        }

        $batch[] = $converted;
        if (count($batch) >= 500) {
            $flush();
        }
    }
    $flush();

    $summary[$table] = $count;
}

$dst->statement('SET session_replication_role = origin');

// realign sequences so new inserts continue after the imported ids
foreach ($tables as $table) {
    $hasId = collect($dst->select(
        "select 1 from information_schema.columns
         where table_schema = 'public' and table_name = ? and column_name = 'id'",
        [$table]
    ))->isNotEmpty();

    if ($hasId) {
        $sequence = $dst->selectOne(
            "select pg_get_serial_sequence('public.{$table}', 'id') as seq"
        )->seq;

        if ($sequence !== null) {
            $dst->statement(
                'select setval(\''.$sequence."',
                    greatest(coalesce((select max(id) from ".$quoted($table).'), 0), 1),
                    (select exists(select 1 from '.$quoted($table).'))
                )'
            );
        }
    }
}

$src->disconnect();
$dst->disconnect();

$total = array_sum(array_filter($summary, 'is_int'));

foreach ($summary as $table => $result) {
    printf("%-40s %s\n", $table, is_int($result) ? $result.' rows' : $result);
}
printf("\nImported %d rows in %d tables.\n", $total, count($summary));
