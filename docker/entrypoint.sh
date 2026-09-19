#!/usr/bin/env bash
set -e

cd /var/www/html

# Ensure the web user owns what it needs to write to
chown -R www-data:www-data storage bootstrap/cache database

# Run artisan as the web user so files it creates (logs, caches) stay writable by fpm
artisan() { su -s /bin/sh www-data -c "cd /var/www/html && php artisan $*"; }

# Clear any caches baked in from the build host (they may reference dev-only providers)
rm -f bootstrap/cache/packages.php bootstrap/cache/services.php bootstrap/cache/config.php bootstrap/cache/routes*.php

# Wait for the database to be reachable
if [ -n "$DB_HOST" ]; then
  until su -s /bin/sh www-data -c "php -r \"try { new PDO('pgsql:host='.getenv('DB_HOST').';port='.(getenv('DB_PORT') ?: 5432).';dbname='.getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); echo 'ok'; } catch (Exception \\\$e) { exit(1); }\"" >/dev/null 2>&1; do
    echo "Waiting for database at ${DB_HOST}:${DB_PORT:-5432}..."
    sleep 2
  done
fi

artisan package:discover --ansi
artisan config:cache
artisan route:cache
artisan view:cache
artisan migrate --force

if [ "$ENABLE_SEED" = "true" ]; then
  artisan db:seed --force || true
fi

rm -f public/hot
mkdir -p storage/app/public
ln -sfn /var/www/html/storage/app/public public/storage
chown -h www-data:www-data public/storage

# Schedule worker (every minute) + queue worker + php-fpm + nginx
(
  echo "* * * * * cd /var/www/html && php artisan schedule:run >> /dev/null 2>&1"
) | crontab -u www-data - 2>/dev/null || true
crond -b 2>/dev/null || true

# Bundled Gotenberg PDF engine (same container): auto-restart loop, internal port 3000.
# Gotenberg 8.37 needs these envs because it runs on Alpine instead of its own image.
# Only the chromium route (/forms/chromium/convert/html) is used by the app; pdftk
# (needs Java) and LibreOffice engines are placeholders that satisfy provisioning.
export CHROMIUM_BIN_PATH=/usr/bin/chromium-browser
export CHROMIUM_HYPHEN_DATA_DIR_PATH=/opt/gotenberg/chromium-hyphen-data
export EXIFTOOL_BIN_PATH=/usr/local/bin/exiftool
export PERL5LIB=/opt/gotenberg/perl
export PDFCPU_BIN_PATH=/usr/local/bin/pdfcpu
export QPDF_BIN_PATH=/usr/bin/qpdf
export PDFTK_BIN_PATH=/usr/local/bin/pdftk
export LIBREOFFICE_BIN_PATH=/usr/local/bin/unoconverter
export UNOCONVERTER_BIN_PATH=/usr/local/bin/unoconverter
(
  while true; do
    gotenberg --api-port=3000 --log-level=error >/dev/null 2>&1
    sleep 2
  done
) &

su -s /bin/sh www-data -c "cd /var/www/html && php artisan queue:work --sleep=3 --tries=1 --max-time=3600" &
nginx
exec php-fpm -F
