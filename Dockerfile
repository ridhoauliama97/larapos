# syntax=docker/dockerfile:1

ARG PHP_VERSION=8.4
ARG NODE_VERSION=22

# ---------- Frontend build stage ----------
FROM node:${NODE_VERSION}-alpine AS node-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN PUPPETEER_SKIP_DOWNLOAD=true npm ci --no-audit --no-fund
COPY vite.config.js tailwind.config.js postcss.config.js ./
COPY resources/js ./resources/js
COPY resources/css ./resources/css
COPY resources/views ./resources/views
COPY lang ./lang
COPY public ./public
RUN npm run build

# ---------- Composer vendor stage ----------
FROM php:${PHP_VERSION}-cli-alpine AS vendor-build
RUN apk add --no-cache --virtual .build-deps \
        icu-dev \
        libzip-dev \
        oniguruma-dev \
        postgresql-dev \
        libpng-dev \
        libjpeg-turbo-dev \
        freetype-dev \
        git \
        unzip \
    && apk add --no-cache \
        icu-libs \
        libzip \
        oniguruma \
        libpq \
        libpng \
        libjpeg-turbo \
        freetype \
    && docker-php-ext-install gd bcmath intl zip pdo_pgsql pgsql \
    && apk del --no-cache .build-deps
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --no-scripts \
    --optimize-autoloader

# ---------- Runtime stage ----------
FROM php:${PHP_VERSION}-fpm-alpine AS app

RUN apk add --no-cache --virtual .build-deps \
        icu-dev \
        libzip-dev \
        oniguruma-dev \
        postgresql-dev \
        libpng-dev \
        libjpeg-turbo-dev \
        freetype-dev \
    && apk add --no-cache \
        bash \
        curl \
        dcron \
        icu-libs \
        libzip \
        nginx \
        oniguruma \
        libpq \
        libpng \
        libjpeg-turbo \
        freetype \
        postgresql17-client \
        supervisor \
    && docker-php-ext-install \
        pdo_pgsql \
        pgsql \
        bcmath \
        intl \
        opcache \
        pcntl \
        zip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd \
    && apk del --no-cache .build-deps

COPY docker/php/php.ini "$PHP_INI_DIR"/conf.d/zz-app.ini
COPY docker/php/opcache.ini "$PHP_INI_DIR"/conf.d/zz-opcache.ini
COPY docker/php/www.conf /usr/local/etc/php-fpm.d/zz-app.conf
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /var/www/html

COPY --from=vendor-build /app/vendor ./vendor
COPY --from=node-build /app/public/build ./public/build
COPY . .

RUN mkdir -p storage/framework/{cache/data,sessions,testing,views} \
        storage/app/public bootstrap/cache database \
    && touch database/database.sqlite \
    && chown -R www-data:www-data storage bootstrap/cache database \
    && chmod +x artisan

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
CMD []
