# https://www.drupal.org/docs/system-requirements/php-requirements
FROM php:8.4-apache-bookworm

# Install system dependencies and PHP extensions
RUN set -eux; \
	\
	if command -v a2enmod; then \
		a2enmod expires rewrite headers; \
	fi; \
	\
	savedAptMark="$(apt-mark showmanual)"; \
	\
	apt-get update; \
	apt-get install -y --no-install-recommends \
		libfreetype6-dev \
		libjpeg-dev \
		libpng-dev \
		libpq-dev \
		libwebp-dev \
		libzip-dev \
		libicu-dev \
		libonig-dev \
		libmemcached-dev \
		git \
		unzip \
		nano \
		vim \
	; \
	\
	# Configure GD library
	docker-php-ext-configure gd \
		--with-freetype \
		--with-jpeg=/usr \
		--with-webp \
	; \
	\
	# Configure intl extension
	docker-php-ext-configure intl; \
	\
	# Install PHP extensions
	docker-php-ext-install -j "$(nproc)" \
		gd \
		pdo_mysql \
		pdo_pgsql \
		zip \
		opcache \
		bcmath \
		exif \
		intl \
		mbstring \
	; \
	\
	# Install PECL extensions
	pecl install redis memcached apcu; \
	docker-php-ext-enable redis memcached apcu; \
	\
	# Cleanup
	apt-mark auto '.*' > /dev/null; \
	apt-mark manual $savedAptMark git unzip nano vim; \
	ldd "$(php -r 'echo ini_get("extension_dir");')"/*.so \
		| awk '/=>/ { so = $(NF-1); if (index(so, "/usr/local/") == 1) { next }; gsub("^/(usr/)?", "", so); printf "*%s\n", so }' \
		| sort -u \
		| xargs -r dpkg-query -S \
		| cut -d: -f1 \
		| sort -u \
		| xargs -rt apt-mark manual; \
	\
	apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false; \
	rm -rf /var/lib/apt/lists/*; \
	rm -rf /tmp/pear

# Set recommended PHP.ini settings
RUN { \
		echo 'opcache.enable=1'; \
		echo 'opcache.memory_consumption=512'; \
		echo 'opcache.interned_strings_buffer=16'; \
		echo 'opcache.max_accelerated_files=10000'; \
		echo 'opcache.revalidate_freq=60'; \
		echo 'opcache.fast_shutdown=1'; \
		echo 'opcache.enable_cli=1'; \
		echo 'upload_max_filesize=100M'; \
		echo 'post_max_size=100M'; \
		echo 'max_execution_time=300'; \
		echo 'memory_limit=512M'; \
		echo 'max_input_time=300'; \
		echo 'max_input_vars=10000'; \
		echo 'date.timezone=UTC'; \
	} > /usr/local/etc/php/conf.d/opcache-recommended.ini

# Drupal recommended settings
RUN { \
		echo 'output_buffering=On'; \
		echo 'expose_php=Off'; \
		echo 'session.cookie_httponly=On'; \
		echo 'session.use_only_cookies=On'; \
		echo 'session.cookie_secure=On'; \
		echo 'session.cookie_samesite=Lax'; \
	} > /usr/local/etc/php/conf.d/docker-php-drupal-recommended.ini

# APCu settings
RUN { \
		echo 'apc.shm_size=128M'; \
		echo 'apc.enable_cli=1'; \
	} > /usr/local/etc/php/conf.d/docker-php-apcu.ini

# Configure Apache security headers
RUN { \
		echo 'ServerTokens Prod'; \
		echo 'ServerSignature Off'; \
		echo 'TraceEnable Off'; \
		echo 'Header always set X-Content-Type-Options "nosniff"'; \
		echo 'Header always set X-Frame-Options "SAMEORIGIN"'; \
		echo 'Header always set X-XSS-Protection "1; mode=block"'; \
	} > /etc/apache2/conf-available/security-headers.conf \
	&& a2enconf security-headers

# Copy composer
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/

ENV COMPOSER_ALLOW_SUPERUSER 1

WORKDIR /opt/drupal

# Install Drupal
RUN set -eux; \
	export COMPOSER_HOME="$(mktemp -d)"; \
	composer create-project --no-interaction "drupal/cms" ./; \
	composer check-platform-reqs; \
	chown -R www-data:www-data web/sites web/modules web/themes; \
	rmdir /var/www/html; \
	ln -sf /opt/drupal/web /var/www/html; \
	rm -rf "$COMPOSER_HOME"

# Install additional useful Drupal tools
RUN set -eux; \
	export COMPOSER_HOME="$(mktemp -d)"; \
	composer require --dev drupal/devel drupal/admin_toolbar drush/drush; \
	rm -rf "$COMPOSER_HOME"

ENV PATH=${PATH}:/opt/drupal/vendor/bin

# Create a health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
	CMD curl -f http://localhost/ || exit 1

# Expose port
EXPOSE 80

# Optional: For development, you can add Xdebug
# Uncomment the following lines if you need Xdebug for development
# RUN pecl install xdebug && docker-php-ext-enable xdebug
# RUN { \
#     echo 'xdebug.mode=debug'; \
#     echo 'xdebug.client_host=host.docker.internal'; \
#     echo 'xdebug.start_with_request=yes'; \
# } > /usr/local/etc/php/conf.d/xdebug.ini