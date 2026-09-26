# Changelog

All notable application releases are listed here. Git tags using the same
`vMAJOR.MINOR.PATCH` version are the authoritative release identifiers.

## [v2.11.0] - 2026-09-27

### Added

- Added a right-side Drawer component to the design system, built on the same headlessui pairing as the existing Modal.
- Moved the category, customer, supplier, unit, warehouse, price list and bank account forms into a Drawer, so add and edit no longer leave the list.
- Made the dashboard sidebar sections collapsible, with the collapsed set persisted in local storage.
- Made each notification navigate to its own route, and stay clickable after it has been read.
- Added a local Gotenberg PDF engine for the dev server via `./deploy.sh gotenberg`.
- Added ESLint 9 and Prettier, enforced on pull requests.
- Added a deterministic ordering tie-breaker for dine-in areas and tables, with test coverage.

### Removed

- Removed the dedicated create and edit pages for categories, customers, suppliers and bank accounts. Add and edit now happen in a Drawer on the list page, so `/dashboard/categories/create`, `/dashboard/customers/create`, `/dashboard/suppliers/create`, `/dashboard/bank-accounts/create` and the matching `/{id}/edit` URLs no longer resolve. The supplier create path answers 405 because it collides with the `/suppliers/{supplier}` pattern.
- Removed unreachable frontend components and the dead code ESLint surfaced: unused imports, write-only in-flight state, and a dead pending-count chain.

### Fixed

- Fixed offline transaction sync returning 401 and leaving queued sales stranded in IndexedDB forever; the API group now registers Sanctum's stateful middleware.
- Fixed Inertia `reset({...})` silently doing nothing, which left "add" forms filled with the previously saved record until a page reload.
- Fixed dine-in areas and tables sharing a sort order reshuffling between requests.
- Fixed price list creation always failing validation, because the slug field was rendered disabled while the server required it.
- Fixed the price list and bank account success and error toasts, which fired during render and read a `flash` prop that is never shared.
- Fixed the POS numpad dropping fast keystrokes, a stale-closure risk in the numpad, and duplicate barcode additions.
- Fixed thermal print failures being swallowed instead of reported to the cashier.
- Fixed native form posts being rejected by CSRF by exposing the token in a meta tag.
- Fixed `deploy.sh` advertising `./deploy.sh ps`, which is not a valid subcommand.

### Improved

- Automatic PDF caching is now hard-coded off instead of being readable from the environment, and the bundled Gotenberg engine is documented accurately.
- Updated the stale deployment, default account, feature doc and payment gateway documentation.
- Applied Pint formatting to the remaining controllers and dropped three unused aggregates from the dashboard query.

## [v2.10.5] - 2026-09-12

### Fixed

- Fixed cashier shift closing to persist only columns present in the shift schema.
- Added a full demo seeder that runs the required seeders in dependency order.
- Ensured demo products are linked to the primary warehouse before stock transfers.

### Improved

- Improved transaction customer selection responsiveness and desktop overflow handling.
- Reorganized order details and cash payment controls for faster checkout.
- Added dynamic quick cash amounts, exact-payment action, and clearer change feedback.

## [v2.10.4] - 2026-09-12

### Fixed

- Reused the seeded primary warehouse during first-install setup instead of attempting to create a duplicate `PUSAT` warehouse.
- Fixed setup wizard submission when transforming form data before posting.
- Added setup warehouse coverage for reuse, rename, duplicate validation, and versioned setup state.

## [v2.10.3] - 2026-09-12

### Fixed

- Stabilized the first-install setup wizard, localization, root redirect, and migration rollback behavior.

## [v2.10.2] - 2026-09-12

### Fixed

- Fixed guided-tour behavior and replay handling.

## [v2.10.1] - 2026-09-12

### Fixed

- Fixed walk-in checkout behavior and stabilized the related documentation.

## [v2.10.0] - 2026-09-12

### Added

- Added automatic receipt printing and ESC/POS WebUSB support.

## [v2.9.0] - 2026-09-12

### Added

- Added cashier shift cash movements, X/Z reports, and order types.

## [v2.8.0] - 2026-09-12

### Added

- Added offline transaction synchronization and dynamic QRIS support.

## [v2.7.0] - 2026-09-12

### Added

- Added tour replay and the setup checklist.

## [v2.6.0] - 2026-09-12

### Added

- Added guided tours for onboarding.

## [v2.5.0] - 2026-09-12

### Added

- Added the first-install setup wizard and unified local development command.

## [v2.4.0] - 2026-09-12

### Added

- Added dine-in QR menu and customer self-order workflow.
