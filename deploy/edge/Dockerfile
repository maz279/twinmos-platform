FROM mirror.gcr.io/library/nginx:alpine

# Create required directories for caching, snippets, and certificates
RUN mkdir -p /var/cache/nginx/ssr \
    /etc/nginx/snippets \
    /etc/nginx/certs \
    /var/www/twinmos/web \
    /var/www/twinmos/admin \
    && chown -R nginx:nginx /var/cache/nginx

# Generate test/dev certificates for syntax validation and lab environments
RUN apk add --no-cache openssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout /etc/nginx/certs/twinmos.key \
      -out /etc/nginx/certs/twinmos.pem \
      -subj "/CN=twinmos.com"

# Copy edge configurations
COPY deploy/nginx/realip_cloudflare.conf /etc/nginx/snippets/realip_cloudflare.conf
COPY deploy/nginx/twinmos-redirects.map /etc/nginx/twinmos-redirects.map
COPY deploy/nginx/twinmos.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget -q --spider --no-check-certificate --header="Host: www.twinmos.com" https://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
