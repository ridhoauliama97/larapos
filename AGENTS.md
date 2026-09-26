# AGENTS.md — Point of Sales (Larapos fork)

Open-source POS. Laravel 13 + Inertia 3.0 + React 19. Current version `v2.10.5` (`APP_VERSION` in `.env`/`.env.example` must match the git tag).

## Repo & Git

**Only push to the fork `larapos`** (`git@github.com:ridhoauliama97/larapos.git`). Remote `origin` (`aryadwiputra/point-of-sales`) is read-only upstream — the registered account gets 403. Don't waste time trying to push to `origin`.

**Branches:** `main` (production, protected, PR-only from `development`) · `development` (integration) · `feature/*` and `fix/*` branch off `development` · `release/X.Y.Z` cut from `development`, merged to `main` + tagged, then merged back to `development`. Never push directly to `main`.

Conventional Commits are required (`CONTRIBUTING.md`). Pre-PR gate: `vendor/bin/pint` + `php artisan test` + `npm run build` all green.

## Stack

- **Backend**: Laravel 13 (`php ^8.3`; CI + Docker use 8.4), PHPUnit 12, Mockery, Faker
- **Frontend**: `@inertiajs/react ^3.0`, React 19, Vite 5, Tailwind 3 (`darkMode: "class"`). Single Vite entry `resources/js/app.jsx`; **no** `resolve.alias` in `vite.config.js` — use the `@/` path alias declared in `jsconfig.json`
- **Auth/RBAC**: Spatie Permission `^8.3` + Laravel Breeze (`^2.0`, **dev-only** — Breeze stubs are committed, so don't expect to re-run the installer)
- **API**: Sanctum `^4.0` at `/api/v1`; docs at `/docs/api` + `/docs/api.json` via `dedoc/scramble ^0.13`
- **PDF**: `spatie/laravel-pdf ^2.13`, Gotenberg driver (`LARAVEL_PDF_DRIVER=gotenberg`, `GOTENBERG_URL=http://localhost:3000`)
- **Exports/imports**: `maatwebsite/excel ^3.1`; barcodes `picqer/php-barcode-generator` + `jsbarcode`; QR is **server-rendered** via `simplesoftwareio/simple-qrcode`
- **Regions**: `laravolt/indonesia ^0.41` (`php artisan laravolt:indonesia:seed`)
- **Ziggy**: `tightenco/ziggy ^2.6` — the global `route()` comes from the `@routes` Blade directive in `resources/views/app.blade.php`. There is **no** `ziggy-js` npm package and no Ziggy Vite plugin; never `import route from 'ziggy-js'`
- **DB**: `.env.example` defaults to MySQL; local dev may use SQLite; production Docker uses PostgreSQL 17; tests use in-memory SQLite
- **i18n**: react-i18next, statically-imported JSON (`resources/js/i18n/index.js` + `locales/{id,en}.json`)
- **WhatsApp**: whatsapp-web.js in a separate Node service (`whatsapp-service/`, port 3001)
- **npm** is the package manager of record (`package-lock.json` committed, `bun.lock` gitignored); CI/deploy run `npm ci`

## Commands

```bash
# Setup
composer install && PUPPETEER_SKIP_DOWNLOAD=true npm install
php artisan key:generate && php artisan migrate --seed
php artisan laravolt:indonesia:seed    # provinces/cities/districts/villages
php artisan storage:link

# Dev — server + queue + pail + vite in one process
composer run dev                        # = php artisan dev (Laravel 13 DevCommand)
# PDF routes need an engine: ./deploy.sh gotenberg  (separate container on :3000)

# Test
php artisan test
php artisan test --filter=FooTest        # one class
php artisan test --filter=test_name      # one method
php artisan test tests/Feature/Foo.php   # one file

# Format (PHP only — no pint.json, so the default `laravel` preset with no excludes)
vendor/bin/pint
vendor/bin/pint --test                   # what CI runs

# Build
PUPPETEER_SKIP_DOWNLOAD=true npm run build

# WhatsApp service (separate terminal)
cd whatsapp-service && npm install && npm start

# Artisan
php artisan inventory:reconcile [--fix]  # global vs pivot stock drift; --fix aligns products.stock
php artisan reorder:generate             # scheduled dailyAt 02:00
php artisan crm:sync-segments            # scheduled dailyAt 01:00
php artisan crm:generate-reminders       # scheduled dailyAt 01:15
php artisan scramble:cache | scramble:clear
```

Scheduling lives in `routes/console.php` (3 daily commands + Laravel's default `inspire`). `inventory:reconcile` is manual-only. Production must run `php artisan schedule:run` every minute — the Docker entrypoint installs that crontab; a bare VPS does not.

**Demo seeders are opt-in and destructive.** `SampleDataSeeder` truncates ~19 tables before reseeding. Use `DemoSeeder` (meta-seeder running DatabaseSeeder → UserSeeder → SampleDataSeeder → OperationalCoreSeeder → FeatureCoverageSeeder → FeatureDemoSeeder) for a full demo DB.

## Docker / Deploy

`./deploy.sh` is the entrypoint, not raw `docker compose`. Subcommands: `deploy` (default), `logs`, `status`, `down`, `shell`, `tinker`, `migrate-sqlite`, `pdf-check`, `gotenberg`. Global flags: `--seed` (runs `db:seed --force` in the container once it's up), `--no-build`. Separately, `ENABLE_SEED=true` in the container env makes `entrypoint.sh` seed on **every** boot — it works but is not in `.env.production.example`. Note `./deploy.sh ps` is advertised in the help text but is **not** a valid command — use `status`.

```bash
./deploy.sh                 # creates .env.production from the example, validates it, compose up --build
./deploy.sh --seed          # first install: also runs db:seed --force
./deploy.sh pdf-check       # verifies the bundled engine: /health + a real HTML→PDF conversion
```

- Required in `.env.production`: `APP_KEY`, `POSTGRES_PASSWORD` (compose hard-fails without it), `APP_URL`. `APP_PORT` defaults to 8080.
- Services: `app` (php-fpm + nginx + Gotenberg + crond + queue worker, **one container**), `postgres:17-alpine`, `redis:7-alpine`. There is **no** `gotenberg` service and no healthcheck on `app` — `deploy.sh` polls the `/up` health route and `:3000/health` itself.
- Gotenberg binaries are copied from a `gotenberg/gotenberg:8` build stage (floating tag, not pinned). Only the Chromium route works; `pdftk`/`unoconverter` are placeholder binaries (no Java/LibreOffice in the image).
- The `apk add chromium perl perl-image-exiftool qpdf` layer is deliberately **separate** from the `docker-php-ext-install` layer in the `Dockerfile`. Merging them invalidates the ~14-minute extension-compile cache.
- `entrypoint.sh` order: chown → wait for DB → `package:discover` → `config:cache` → `route:cache` → `view:cache` → `migrate --force` → (`db:seed` if `ENABLE_SEED`) → symlink `public/storage` → crontab → Gotenberg restart loop → `queue:work` → nginx → php-fpm.
- `.dockerignore` excludes `whatsapp-service`, `docs`, `*.md`, `public/build`, and `database/database.sqlite` — but `Dockerfile` still `COPY . .` afterwards, so build artifacts come from the `node-build` stage only.
- Migrating a local SQLite DB into the stack: `./deploy.sh migrate-sqlite` (wraps `docker/tools/sqlite-to-pg.php`, skips `migrations`/`sessions`/`cache`/`jobs`, realigns sequences, then `permission:cache-reset`).

## CI

Two workflows, and they are **not** equivalent:

- **`.github/workflows/build.yml`** — push to `main`/`development` + all PRs. PHP 8.4, Node 22, `pdo_sqlite`. Order: `composer install` → `npm ci` → `cp .env.example .env && key:generate` → **`vendor/bin/pint --test`** → **`npm run format:check`** → **`npm run build`** (before tests, so the Vite manifest exists) → **`npm run lint`** → **`php artisan test`**. This is the workflow that gates a PR. A second parallel job builds the Docker image with `push: false`.
- **`.github/workflows/deploy.yml`** — push/PR to `main`. Its `ci` job only runs `composer validate` + installs + `npm run build`. It runs **neither Pint nor the test suite**, so a green `deploy.yml` does not mean tests passed.
- The `deploy` job is gated on `push` to `main` **and** a guard step that skips gracefully when `secrets.VPS_HOST` is empty. It SSHes to `/var/www/Larapos.web.id` (Node 24.15.0 via nvm, `php8.4 artisan migrate --force`) and fails the job unless `https://Larapos.web.id/` returns 200.

## Testing

`phpunit.xml` forces a hermetic environment: `DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`, `QUEUE_CONNECTION=sync`, `CACHE_STORE=array`, `SESSION_DRIVER=array`, `MAIL_MAILER=array`, `BCRYPT_ROUNDS=4`. Two suites only — `tests/Unit` and `tests/Feature` (65 `*Test.php` files). Don't assume MySQL/PostgreSQL features in tests.

`tests/TestCase.php` calls `Pdf::fake()` in `setUp()`, so **no test ever renders a real PDF** and nothing needs Gotenberg. It also exposes `botGuardPayload()` and `recentlyConfirmedSession()` helpers — use them instead of hand-rolling honeypot/`auth.password_confirmed_at` payloads.

Conventions:

- `RefreshDatabase` on every test class; seed `PermissionSeeder → RoleSeeder → UserSeeder` first
- Test users: `admin.nelsha@gmail.com` (super-admin) / `cashier.nelsha@gmail.com` (cashier), password `password`, already verified by `UserSeeder`
- Call `markEmailAsVerified()` before `actingAs()` on HTTP tests
- `PUSAT` warehouse: `type='main'`, `is_active=true`, `sort_order=0`
- **Set `tax_rate=0`** on test `Product::create` or PPN changes `grand_total`
- Warehouse stock: `$product->warehouses()->attach($id, ['stock' => N])`
- Open a shift: `app(CashierShiftService::class)->openShift($cashier, $cashier, $openingCash, null, $warehouse->id)`
- PHPUnit 12: **no `$faker` property** — use `static int $seq` counters or `uniqid()`
- API tests: `Sanctum::actingAs($user, ['*'])` or a real token. `TransientToken` does **not** bypass the `abilities` middleware
- There is **no JS test runner**. Frontend correctness is checked by `npm run build` + ESLint only

## JS Lint & Format (added Sept 2026)

ESLint 9 flat config (`eslint.config.js`) + Prettier 3 with `prettier-plugin-tailwindcss`.

```bash
npm run lint            # eslint resources/js — exits non-zero on errors
npm run lint:fix        # autofix (unused imports, hasOwnProperty, unescaped entities)
npm run lint:strict     # same + --max-warnings=0  ← aspirational gate, NOT yet clean
npm run format          # prettier --write  (169 files still non-compliant)
npm run format:check    # verify only
```

- **Pinned to ESLint 9 deliberately** — `eslint-plugin-react@7.37.5` declares peer `eslint ^3..^9.7`; ESLint 10 exists but the plugin doesn't support it yet. Bump both together or the install fails with ERESOLVE.
- `react/no-children-prop` is **off**: `Page.layout = (page) => <Layout children={page} />` is this repo's convention across ~88 pages, not a defect.
- The React Compiler-era rules (`set-state-in-effect`, `immutability`, `static-components`, `preserve-manual-memoization`) are pinned to `warn` — noisy for Inertia prop→state syncing. Promote to `error` when the backlog clears.
- `no-unused-vars` is a `warn` with `^_` escape hatches. 126 dead `import React` were removed (Sept 2026); ~101 remain and are **not** all safe to delete — `handlePrint` is unused in `Payables/Show` and `Receivables/Show`, and `totalRevenue`/`totalProfit`/`averageOrder` are computed but never rendered in `Dashboard/Index`. Those look like unfinished work, not noise.
- Prettier ran once (Sept 2026, 169 files) as a dedicated formatting-only commit. `format:check` is clean and enforced in CI — run `npm run format` before pushing.
- **CI runs `npm run lint`, not `lint:strict`.** `--max-warnings=0` would fail: 90 of the remaining warnings are React Compiler-era rules that need real refactors, not config. Flip to `lint:strict` only once those are genuinely fixed.

### Traps ESLint surfaced in this repo

- **`carts` is an Inertia prop, not local state.** `Transactions/Index.jsx` has no `setCarts` — the cart lives server-side. Clear it with `router.reload({ only: ["carts", "carts_total"] })`, never a setter. This crashed the offline-queue path until Sept 2026.
- **No `<meta name="csrf-token">` and no `@csrf` exist in any view.** Laravel's CSRF token is only available via the `XSRF-TOKEN` cookie. Any native `form.submit()` must read + `decodeURIComponent` it and post it as `_token`, or the request 419s. `Public/TransactionDetail.jsx` does this for the gateway hand-off.
- **The payment gateway returns an external redirect**, so `Public/TransactionDetail.jsx` must use a native form, not `router.post` — Inertia would intercept the response.
- Hooks must sit above any early return. `Pagination.jsx` and `TextInput.jsx` both violated this; `TextInput` now always calls `useRef` and merges the forwarded ref with `useImperativeHandle`.

## Backend Architecture

- **`app/Http/Controllers/Apps/`** (35 files) — dashboard web controllers per module. **`Api/`** (8) — REST. Root (15) + `Auth/` (9) + `Reports/` (3).
- **Six controller basenames exist in two namespaces** — always check the import: `DineOrderController` (root = public guest ordering vs `Apps/` = dashboard accept/reject), plus `ProductController`, `CustomerController`, `CategoryController`, `SupplierController`, `WarehouseController` (`Apps/` vs `Api/`).
- **`app/Services/`** — 22 services + 3 in `Services/Payments/` (`PaymentGatewayManager`, `MidtransGateway`, `XenditGateway`). Pricing, loyalty, batches (FEFO), stock, CRM, WhatsApp, and thermal-print logic all live here, not in controllers.
- **Observers** (`AppServiceProvider`): `Transaction`, `StockMutation`, `Receivable`, `Payable` — all on **`created`**, not `saving`. `TransactionObserver` defers with `DB::afterCommit()` when inside a transaction and fires low-stock checks per product. Don't add a `saving` expectation.
- `AppServiceProvider` also: defines the `api` rate limiter (`API_RATE_LIMIT_PER_MINUTE`, default 120, keyed by user id else IP), the `viewApiDocs` gate (public unless `SCRAMBLE_DOCS_TOKEN` is set), a `Failed` login listener that notifies super-admins (5-minute cache throttle keyed `email+ip`), and a boot-time `ProductionSecurityBaseline::issues()` warning log.
- **`routes/web.php`** — ~246 routes under the `/dashboard` group (`auth` + `verified`). Public/token routes: `/setup`, `/fitur`, `/dokumentasi`, `/roadmap`, `/kontribusi`, `/share/transactions/{invoice}?token=`, `/portal/transactions/{invoice}`, `/language/switch`, `/dine/{token}` + `/dine-order/{accessToken}`. Health check is `/up` (`bootstrap/app.php`).
- **`routes/api.php`** — `/api/webhooks/{midtrans,xendit}` (public, signature-verified), `/api/v1/auth/{login,register,me,logout}`, 5 `apiResource` master-data sets, `/api/v1/pos/*`.
- **Inertia shared props** — `HandleInertiaRequests.php` is appended to the web group and shares auth + permissions, four notification lists, aging summaries, active shift, store profile, printer settings, security warnings, `locale.{current,available,names}`, and `appVersion`.

### Inventory model

`product_warehouse.stock` is the operational source of truth; `products.stock` is a global aggregate. **Both must be written in the same `DB::transaction`**, with `lockForUpdate()` on the affected pivot rows. Every mutation path (checkout, transfer, receiving, return, opname, payment) already follows this — don't add a new one that skips it. `inventory:reconcile --fix` repairs drift after manual data edits.

### Seeder chain & first install

`DatabaseSeeder` runs, with `PermissionRegistrar::forgetCachedPermissions()` before and after (order matters — `UserSeeder` needs roles to exist):

```text
PermissionSeeder → RoleSeeder → UserSeeder → PaymentSettingSeeder → DineInSettingsSeeder
```

then creates the `PUSAT` warehouse (`firstOrCreate`), points `Setting setup_warehouse_id` at it, and back-fills `product_warehouse` from `products.stock`.

`UserSeeder` creates `admin.nelsha@gmail.com` and `cashier.nelsha@gmail.com` (password `password`, pre-verified — seeders run under `Model::unguarded()`, so `email_verified_at` persists despite not being in `$fillable`) and **returns early in production**.

The `/setup` wizard stays reachable while `Setting::app_setup_completed` is false (`/` redirects there). Users it creates — and users from the admin user form — have **no `email_verified_at`**, while dashboard routes require `verified`. Read the link out of `storage/logs/laravel.log` (`MAIL_MAILER=log`) or set it manually.

### Middleware

| Alias | Class | Applied to |
| --- | --- | --- |
| `role` | Spatie `RoleMiddleware` | — |
| `permission` | Spatie `PermissionMiddleware` | every dashboard route |
| `role_or_permission` | Spatie `RoleOrPermissionMiddleware` | — |
| `step_up` | `EnsureRecentPasswordConfirmation` | sensitive create/update/delete: roles, users, payment settings, bank accounts, payment confirm |
| `active_shift` | `EnsureActiveCashierShift` | all POS cart/hold/checkout actions (422 for JSON, redirect otherwise) |
| `bot.guard` | `EnsureBotGuard` | login/register/forgot-password (honeypot + submit timer) |
| `registration.enabled` | `EnsurePublicRegistrationEnabled` | `/register` — 404s unless `config('security.auth.public_registration')` |
| `setup.notinstalled` | `EnsureNotInstalled` | `/setup` only; redirects to login once setup completes |
| `abilities` | Sanctum `CheckAbilities` | API master-data resources only |

Web group **appends** `SetLocale`, `SecureHeaders`, `EnforceAbsoluteSessionLifetime`, `HandleInertiaRequests`, `AddLinkHeadersForPreloadedAssets`. API group **prepends** `SetLocale`.

`step_up` and `EnforceAbsoluteSessionLifetime` read `config('auth.password_timeout')` — **not** `config('security.session.recent_password_timeout')`, which is defined in `config/security.php` but never read. Set the former.

Exception rendering (`bootstrap/app.php`): `AuthenticationException` → JSON 401 when `expectsJson()` or the path is `api/*`, otherwise redirect to login; `MissingAbilityException` → JSON 403; validation stays the Laravel 422. The custom Inertia `Error` page renders only for statuses 401/403/404/419/429/500/503 **and** only when `APP_DEBUG=false`.

### API abilities

`abilities` middleware mirrors Spatie permission names:

| Route | Ability |
| --- | --- |
| index, show | `{module}-access` |
| store | `{module}-create` |
| update | `{module}-edit` (products/customers/categories) or `{module}-update` (**warehouses**) |
| destroy | `{module}-delete` |
| suppliers (all five verbs) | `suppliers-access` |

`/api/v1/auth/*` and `/api/v1/pos/*` are auth-only. Abilities are stamped onto the token at login from Spatie permissions plus `user:read`; public registration mints a token with only `user:read`.

### Route naming

- `Route::resource('/settings/price-lists', …)` names routes after the **last path segment only** (`price-lists.index`) because Laravel's `prefixedResource` splits the slash-prefixed name. `/settings/warehouses` and `/settings/units` pass explicit `->names('settings.x')`. Sidebar links to `route('price-lists.index')` — don't "fix" it.
- Profile: `/dashboard/profile` (not `/apps/profile`)
- Public invoice: `/share/transactions/{invoice}?token={access_token}`

## Frontend

**The design system is `resources/js/Components/Dashboard/`** — `Input`, `TextArea`, `Select`, `InputSelect`, `ListBox`, `Checkbox`, `Search`, `Modal`, `Table` (compound: `Table.Card/Thead/Tbody/Th/Td/Empty`), `Pagination`, `Button`, `Navbar`, `Sidebar`, `Notification`, `ImageDropzone`, `ImageCropper`, `LanguageSwitcher`. Everything else under `resources/js/Components/` is a Laravel Breeze stub used only by auth pages, including a **second, different** `Modal.jsx`. There is no `Badge`, `DataTable`, `Tabs`, or date-picker component — dates use native `<Input type="date">`.

- **Error prop name is inconsistent and fails silently.** `Input`, `TextArea`, `InputSelect`, `ListBox`, `Checkbox` take **`errors`** (plural, a string). `Select` and `ImageDropzone` take **`error`** (singular). Passing `error` to `Input` spreads an unknown DOM attribute and renders no message. This shipped as a real bug in 6 DineIn Area/Table fields (fixed Sept 2026) — check the component's signature before writing a call site.
- **`Utils/Menu.jsx` default-exports `Menu()`, a plain function — not a component.** `Sidebar.jsx`, `Navbar.jsx`, and `AuthDropdown.jsx` call it as `Menu()` during their own render, and it internally calls `useTranslation()`/`usePage()`. That is only legal because it happens to run inside another component's render. Don't move it to module scope, call it conditionally, or give it a capital-letter name expecting JSX. `Utils/Permission.jsx` is a **pure** function for the same reason — it used to be a hook in disguise and was being called from a `cards.filter()` callback in `Access.jsx`.
- `Select` is a custom listbox, **not** a `<select>`: `options` are `{value, label, description?, disabled?}`, `onChange` is a **callback** `onChange(value, option)`, not a DOM event, and the search box auto-enables above 7 options. Native form submission/`FormData` will lose the value — mirror it into `useForm` state.
- `hint` is only supported by `ImageDropzone` (and rendered `sr-only`). Other helper text is a hand-written `<p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">`.
- `ImageCropper` is dependency-free canvas (1000×1000 output, zoom 1–3, GIF falls back to the original). `ImageDropzone` is used for product/category images, store logo, bank-account logo, and user avatars.
- Table/grid view toggles are copy-pasted inline `useState` in ~7 pages (default `grid` for products/customers/categories/users/suppliers, `list` for roles/permissions). Not shared, not persisted.
- **Dead code was purged (2026-09-26).** `Dashboard/{Skeleton,Header,ImportButton,Barcode,ListBox,Card,Widget}.jsx`, `POS/{index,SearchBar,BarcodeScanner,PaymentPanel}.jsx`, `Layouts/AuthenticatedLayout.jsx`, `Components/ResponsiveNavLink.jsx`, and `Pages/Dashboard.jsx` were all deleted, along with the `puppeteer` and `html5-qrcode` dependencies. `route('dashboard')` renders `Dashboard/Index`, so `Pages/Dashboard.jsx` was unreachable. If you re-add a camera scanner, note that `html5-qrcode` is no longer installed.
- `Layouts/`: `DashboardLayout` (88 pages — the default for the whole dashboard), `POSLayout` (`Transactions/Index` only), `PublicLayout` (marketing + OSS pages), `GuestLayout` (2 pages). `Auth/Login|Register|ForgotPassword|ConfirmPassword|VerifyEmail` render with no layout at all.

**Tailwind / theming**

- The content globs cover `./resources/js/**/*.jsx` **only**. Tailwind classes written in a `.js`/`.ts` file are silently not generated — keep JSX in `.jsx`.
- `darkMode: "class"`, but the `dark`/`light` class is written to **`document.body`**, not `<html>`, by both `ThemeSwitcherContext` and an inline `onload` script in `app.blade.php` (which also sets `user-scalable=no`, blocking pinch-zoom — relevant for the touch-heavy POS/dine-in flows).
- Tokens: `primary` indigo, `accent` cyan, `success` emerald, `warning` amber, `danger` rose — full 50–950 scales. Fonts: Inter + Plus Jakarta Sans (sans), JetBrains Mono + Fira Code (mono). Also `touch`/`touch-lg` min sizes, `4xl` radius, `glow` shadows, and `slide-in`/`slide-up`/`fade-in`/`cart-add` animations.

**i18n reality check** — `locales/{id,en}.json` have 33 namespaces but only 5 files call `useTranslation()`: `Utils/Menu.jsx`, `Components/Dashboard/SetupChecklist.jsx`, `Pages/Dashboard/Index.jsx`, `Pages/Setup/Wizard.jsx`, `Pages/Auth/Login.jsx`. (`POSLayout`, `tours.js`, and `LanguageSwitcher` call `i18n` directly.) The other 87 dashboard pages hardcode Indonesian/English strings, and `Pagination.jsx`/`Select.jsx` hardcode `"Sebelumnya"`, `"Pilih..."`, etc. Don't assume a translation key exists — and don't assume switching locale translates the page. Resolution order in `SetLocale`: user `locale` column → session → cookie → `Accept-Language` → `id`. `config/app.php` defaults to `env('APP_LOCALE', 'en')` while `.env.example` sets `en` but `.env.production.example` sets `id`.

**Service worker** — `public/sw.js` registers unconditionally from `app.jsx`. Strategy: network-first-then-cache for `/products`, `/customers`, `/pricing`, `/categories`, `/warehouses` (matched by **substring**, so it hits nested paths too); network-only with a synthetic `503 {offline:true}` for anything under `/transactions/`; cache-first for everything else. Bump `CACHE_NAME` when cached responses change — the activate handler deletes every other cache.

**Barcode / QR / printing**

- No client-side QR generation. The QRIS QR is an `<img>` from `route('transactions.qr', invoice)`; dine-table QR from `dine-tables.qr`.
- Live POS scanning is the **keyboard-wedge** hook `Hooks/useBarcodeScanner.js` (50 ms inter-key gap + Enter). There is no camera scanner — `html5-qrcode` and its `BarcodeScanner` component were removed as dead code in Sept 2026. Re-adding camera scanning needs `npm i html5-qrcode` and HTTPS/localhost.
- JsBarcode is used only by `Components/Barcode/BarcodeLabel.jsx`; `BarcodePrintModal` loads JsBarcode **from the jsDelivr CDN** in a new window, so barcode printing needs internet. The barcodes in `Receipt/ShippingLabel.jsx` and `Transactions/Print.jsx` are decorative fakes, not scannable.
- `Utils/escpos.js` is a hand-rolled ESC/POS byte writer (32/48 cols, WebUSB, Chromium-only, throws otherwise). The `window.print()` fallback lives in `Transactions/Print.jsx`, wrapped in a `try/catch` that falls through silently.
- `Utils/offlineDb.js` is IndexedDB (`pos-offline`: `products`, `customers`, `pricing`, `pending_transactions`). `client_uuid` comes from `crypto.randomUUID()` in the page, not the util; the server price wins on replay. `POSLayout` polls `getPendingCount()` every 15 s.
- Tours (`driver.js`) record completion with **plain `axios`, not Inertia** — the Inertia router rejects the JSON-only response. Tour text is captured at module load, so it doesn't re-translate on language switch.

**Exports** — `app/Exports/*` via `maatwebsite/excel`, all `FromCollection + ShouldAutoSize + WithHeadings + WithMapping`. Every string cell goes through `App\Support\SpreadsheetSanitizer::sanitize()`, which prefixes `'` when the **first** character is `= + - @ \t \r` (CSV/Excel formula injection). Money is cast to `(int)`, so don't expect cents. Filenames are hardcoded Indonesian (`produk.xlsx`, `customer.xlsx`, `transaksi.xlsx`) and not localized.

**`puppeteer` and `html5-qrcode` were removed from the root `package.json` (Sept 2026)** — zero importers. The `PUPPETEER_SKIP_DOWNLOAD=true` prefixes still in the `Dockerfile`, both workflows, and the docs are now **vestigial no-ops** for this repo; they are harmless. Note `whatsapp-service/` has its *own* lockfile that really does pull Chromium via `whatsapp-web.js` — never leak the skip flag into that install or WhatsApp breaks with no browser.

## PDF / Gotenberg

Routes live in `routes/web.php` → `DocumentController` (`/dashboard/documents/...`, plus the token-gated public invoice). `Pdf::format()->paperSize()->margins()` in the controller sets the geometry — **but** five of the six views also carry a matching `@page` block, so change both when changing page setup. Only `invoice.blade.php` omits `@page`.

Gotenberg resolves assets relative to attached files and **cannot read local paths** (`public/...`). Fonts are inlined as base64 in `views/pdf/fonts.blade.php` (Geist / Geist Mono, weights 400–800, from `public/geist/` and `public/geist_mono/`); the store logo and barcode are inlined as base64 by the controller. Keep it that way — a `<link>` or `url('/...')` reference renders blank.

## Environment gotchas

- **Keys read in code but absent from `.env.example`:** `API_RATE_LIMIT_PER_MINUTE` (inline default 120) and `SCRAMBLE_DOCS_TOKEN` (only in `.env.production.example`).
- **Dead keys in `.env.production.example`:** `MIDTRANS_CLIENT_KEY` and `MIDTRANS_IS_PRODUCTION` are never read. `config/services.php` only reads `MIDTRANS_SERVER_KEY`, `XENDIT_SECRET_KEY`, `XENDIT_CALLBACK_TOKEN`; client keys and sandbox/production mode live in the **`payment_settings` table** (with env fallbacks). Same for `XENDIT_PUBLIC_KEY`, which `docs/configuration.md` documents but nothing reads.
- Midtrans/Xendit webhooks need a publicly reachable `APP_URL`; they never work against `localhost`.
- `SECURITY_BASELINE_ALLOW_HTTP=true` silences the production security baseline (only for HTTP-only LAN deploys).
- Puppeteer's Chromium download no longer applies to the root project (`puppeteer` removed Sept 2026). The leftover `PUPPETEER_SKIP_DOWNLOAD=true` prefixes are harmless no-ops; don't bother stripping them unless you're already touching those files.
- Product/avatar images need `php artisan storage:link` locally; the Docker entrypoint creates the symlink itself.
- A stale permission cache survives re-seeding (the session keeps the old set) — log out and back in.
- Running Pint can produce a large diff unrelated to your change (it expands multi-line arrays and closures). Reformat only the files you touched: `vendor/bin/pint path/to/File.php`.

## Docs

`docs/getting-started.md` · `docs/architecture-overview.md` · `docs/configuration.md` · `docs/feature-index.md` · `docs/testing-manual.md` (manual QA for QRIS, ESC/POS, offline sync) · `docs/features/` (30 module docs) · `docs/agents/{issue-tracker,triage-labels,domain}.md` (skills: local `.scratch/<slug>/` issue tracker, triage labels, domain docs) · `docs/superpowers/specs/`. Also `CONTRIBUTING.md` (branch + commit + gate rules), `CHANGELOG.md` (Keep-a-Changelog; tags are authoritative), `SECURITY.md` (v2.x only), `LICENSE` (MIT).

Some prose is stale — trust config over docs. Known drift: `README.md` says there are no default accounts (false outside production), claims 44 feature docs (there are 30), and never mentions Docker or the local Gotenberg requirement; `docs/configuration.md` documents the nonexistent `XENDIT_PUBLIC_KEY`; `.env.production.example` claims a `gotenberg` compose service that doesn't exist. `CONTEXT.md` and `docs/adr/` are a documented convention (`docs/agents/domain.md`) with **no artifacts yet**; `.scratch/` exists but is empty.
