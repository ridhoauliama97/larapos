#!/usr/bin/env bash
# deploy.sh — build & run the dockerized Point of Sales stack
# Usage:
#   ./deploy.sh               full deploy: validate env, build, up, wait healthy
#   ./deploy.sh --seed        same, plus db:seed --force (first install only)
#   ./deploy.sh --no-build    start stack without rebuilding images
#   ./deploy.sh migrate-sqlite  copy local SQLite data into the PostgreSQL volume (one-off)
#   ./deploy.sh pdf-check     verify the bundled Gotenberg PDF engine (health + conversion)
#   ./deploy.sh gotenberg     start/ensure a local Gotenberg engine for the dev server (:8000)
#   ./deploy.sh logs|status|down|shell|tinker
set -euo pipefail

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ENV_FILE=".env.production"
COMPOSE=(docker compose --env-file "$ENV_FILE")

info() { printf '\033[36m==>\033[0m %s\n' "$*"; }
ok()   { printf '\033[32m ✓ \033[0m %s\n' "$*"; }
warn() { printf '\033[33m ! \033[0m %s\n' "$*"; }
die()  { printf '\033[31m ✗ \033[0m %s\n' "$*" >&2; exit 1; }

env_value() { grep -E "^$1=" "$ENV_FILE" 2>/dev/null | tail -n 1 | cut -d'=' -f2- | sed 's/^"\(.*\)"$/\1/; s/^'"'"'\(.*\)'"'"'$/\1/'; }

SEED=0
BUILD=1
CMD=deploy
for arg in "$@"; do
  case "$arg" in
    --seed) SEED=1 ;;
    --no-build) BUILD=0 ;;
    *) CMD="$arg" ;;
  esac
done
case "$CMD" in
  deploy) ;;
  logs) exec "${COMPOSE[@]}" logs -f --tail=100 ;;
  status) exec "${COMPOSE[@]}" ps ;;
  down) exec "${COMPOSE[@]}" down ;;
  shell) exec "${COMPOSE[@]}" exec app sh ;;
  tinker) exec "${COMPOSE[@]}" exec app php artisan tinker ;;
  migrate-sqlite) ;;
  pdf-check) ;;
  gotenberg) ;;
  *) die "Unknown command '$CMD'. Try: deploy.sh [logs|status|down|shell|tinker|migrate-sqlite|pdf-check|gotenberg] [--seed] [--no-build]" ;;
esac

# ---------- local Gotenberg engine for dev (localhost:8000 has no bundled engine) ----------
if [ "$CMD" = "gotenberg" ]; then
  if docker ps --format '{{.Names}}' | grep -qx gotenberg-local; then
    ok "gotenberg-local already running on :3000"
  else
    if docker ps -a --format '{{.Names}}' | grep -qx gotenberg-local; then
      docker start gotenberg-local >/dev/null
    else
      docker run --rm -d --name gotenberg-local -p 3000:3000 gotenberg/gotenberg:8 >/dev/null
    fi
    sleep 2
    ok "gotenberg-local started (dev server on :8000 can now render PDFs). Stop it later with: docker stop gotenberg-local"
  fi
  exit 0
fi

# ---------- prerequisites ----------
command -v docker >/dev/null 2>&1 || die "docker not found in PATH"
docker compose version >/dev/null 2>&1 || die "docker compose v2 required (not docker-compose v1)"

if [ ! -f "$ENV_FILE" ]; then
  warn "$ENV_FILE not found — creating it from .env.production.example"
  cp .env.production.example "$ENV_FILE"
  die "Fill in secrets in $ENV_FILE (APP_KEY, POSTGRES_PASSWORD, APP_URL), then run ./deploy.sh again"
fi

# ---------- required secrets ----------
if [ -z "$(env_value APP_KEY)" ]; then
  if command -v openssl >/dev/null 2>&1; then
    key="base64:$(openssl rand -base64 32)"
    printf '\nAPP_KEY=%s\n' "$key" >>"$ENV_FILE"
    info "APP_KEY was empty — generated one and appended to $ENV_FILE"
  else
    die "APP_KEY is empty in $ENV_FILE and openssl is unavailable. Generate it with: ${COMPOSE[*]} run --rm app php artisan key:generate --show"
  fi
fi

[ -n "$(env_value POSTGRES_PASSWORD)" ] || die "POSTGRES_PASSWORD is empty in $ENV_FILE"

APP_URL="$(env_value APP_URL)"
[ -n "$APP_URL" ] || die "APP_URL is empty in $ENV_FILE"
case "$APP_URL" in
  http://*)
    if [ "$(env_value SECURITY_BASELINE_ALLOW_HTTP)" != "true" ]; then
      warn "APP_URL is HTTP ($APP_URL). Payment webhooks (Midtrans/Xendit) need a public HTTPS URL."
      warn "For local HTTP testing, set SECURITY_BASELINE_ALLOW_HTTP=true in $ENV_FILE to silence the warning."
    fi
    ;;
esac

# PDF engine env sanity (soft): the bundled Gotenberg runs inside the app container on :3000
if [ -n "$(env_value LARAVEL_PDF_DRIVER)" ] && [ "$(env_value LARAVEL_PDF_DRIVER)" != "gotenberg" ]; then
  warn "LARAVEL_PDF_DRIVER is '$(env_value LARAVEL_PDF_DRIVER)' — bundled Gotenberg requires 'gotenberg'"
fi
case "$(env_value GOTENBERG_URL)" in
  *gotenberg:*) warn "GOTENBERG_URL points at a separate 'gotenberg' service, but the engine is bundled in the app container. Set GOTENBERG_URL=http://localhost:3000" ;;
esac

# ---------- build & run ----------
info "Building and starting containers (postgres 17, redis 7, app + bundled Gotenberg PDF engine)..."
if [ "$BUILD" = "1" ]; then
  "${COMPOSE[@]}" up -d --build
else
  "${COMPOSE[@]}" up -d
fi

# ---------- wait for health ----------
APP_PORT="$(env_value APP_PORT)"; APP_PORT="${APP_PORT:-8080}"
info "Waiting for http://localhost:${APP_PORT}/up (Laravel health endpoint)..."
deadline=$((SECONDS + 300))
until curl -sf -o /dev/null "http://localhost:${APP_PORT}/up"; do
  [ "$SECONDS" -lt "$deadline" ] || die "App did not become healthy within 300s. Check: ${COMPOSE[*]} logs app"
  sleep 3
done
ok "App is healthy"

# ---------- bundled Gotenberg PDF engine (same container, port 3000) ----------
info "Waiting for the bundled Gotenberg PDF engine (in-container :3000)..."
deadline=$((SECONDS + 60))
until "${COMPOSE[@]}" exec -T app curl -sf -o /dev/null http://localhost:3000/health; do
  [ "$SECONDS" -lt "$deadline" ] || die "Gotenberg engine did not become healthy. Check: ${COMPOSE[*]} logs app (entrypoint auto-restarts it every 2s)"
  sleep 2
done
ok "Gotenberg PDF engine is ready"

# ---------- first-install seeding ----------
if [ "$SEED" = "1" ]; then
  info "Seeding database (permissions, roles, default users, settings)..."
  "${COMPOSE[@]}" exec app php artisan db:seed --force
  ok "Seeded — note: UserSeeder skips default accounts in production; create the first user via /setup or the admin dashboard"
elif [ "$CMD" = "deploy" ]; then
  warn "Database was not seeded. First install? Run: ./deploy.sh --seed"
fi

# ---------- one-off SQLite → PostgreSQL data migration ----------
if [ "$CMD" = "migrate-sqlite" ]; then
  [ -f database/database.sqlite ] || die "database/database.sqlite not found — nothing to migrate"
  info "Copying SQLite database + storage into the app container..."
  "${COMPOSE[@]}" cp database/database.sqlite app:/tmp/source.sqlite
  "${COMPOSE[@]}" cp docker/tools/sqlite-to-pg.php app:/tmp/sqlite-to-pg.php
  info "Running sqlite-to-pg conversion..."
  "${COMPOSE[@]}" exec app sh -c "cd /var/www/html && php /tmp/sqlite-to-pg.php /tmp/source.sqlite"
  "${COMPOSE[@]}" cp storage/app/public/. app:/var/www/html/storage/app/public/
  "${COMPOSE[@]}" exec app php artisan permission:cache-reset
  ok "SQLite data migrated. Verify the app, then clean up leftovers if desired: ${COMPOSE[*]} exec app sh -c 'rm -f /tmp/source.sqlite /tmp/sqlite-to-pg.php'"
  exit 0
fi

# ---------- PDF engine verification ----------
if [ "$CMD" = "pdf-check" ]; then
  "${COMPOSE[@]}" exec -T app sh -c '
    if curl -sf -o /dev/null http://localhost:3000/health; then
      echo "gotenberg health: OK"
    else
      echo "gotenberg health: FAILED"; exit 1
    fi
    printf "<html><body><p>pdf-check</p></body></html>" > /tmp/deploy-pdf-check.html
    if curl -s -o /tmp/deploy-pdf-check.pdf -F "files=@/tmp/deploy-pdf-check.html;filename=index.html" http://localhost:3000/forms/chromium/convert/html \
       && head -c 8 /tmp/deploy-pdf-check.pdf | grep -q PDF; then
      echo "chromium conversion: OK (valid PDF)"
    else
      echo "chromium conversion: FAILED"; exit 1
    fi
    rm -f /tmp/deploy-pdf-check.html /tmp/deploy-pdf-check.pdf
  '
  ok "PDF engine verified"
  exit 0
fi

ok "Deploy complete — $APP_URL"
printf '  status:   ./deploy.sh status\n  logs:     ./deploy.sh logs\n  pdf:      ./deploy.sh pdf-check\n  shell:    ./deploy.sh shell\n'
