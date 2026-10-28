# Stage 1: admin console bundle (vite base '/admin/'). The edge serves it from
# /var/www/twinmos/admin — without this stage /admin/ answered 403 (ZT-011).
FROM mirror.gcr.io/library/node:24-alpine AS admin
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/admin/ ./apps/admin/
RUN npm ci --workspace @twinmos/admin --include-workspace-root
ARG GIT_SHA=unknown
RUN cd apps/admin && GIT_SHA=$GIT_SHA npx vite build

FROM mirror.gcr.io/library/nginx:alpine

# Create required directories for caching, snippets, and certificates.
# nginx's *_temp dirs are created here because the prod overlay drops all
# capabilities (no DAC_OVERRIDE): root nginx cannot mkdir them at start inside
# the nginx-owned cache volume, which seeds from this image layer.
RUN mkdir -p /var/cache/nginx/ssr \
    /var/cache/nginx/client_temp /var/cache/nginx/proxy_temp /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/uwsgi_temp /var/cache/nginx/scgi_temp \
    /etc/nginx/snippets \
    /etc/nginx/certs \
    /var/www/twinmos/web \
    /var/www/twinmos/admin \
    && chown -R nginx:nginx /var/cache/nginx \
    && ln -sf /dev/stdout /var/log/nginx/access.json.log  # read_only rootfs in the prod overlay

# Generate test/dev certificates for syntax validation and lab environments
RUN apk add --no-cache openssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout /etc/nginx/certs/twinmos.key \
      -out /etc/nginx/certs/twinmos.pem \
      -subj "/CN=twinmos.com"

# Copy edge configurations
COPY deploy/nginx/realip_cloudflare.conf /etc/nginx/snippets/realip_cloudflare.conf
COPY deploy/nginx/twinmos-redirects.map /etc/nginx/twinmos-redirects.map
COPY deploy/nginx/certs/cloudflare-origin-pull-ca.pem /etc/nginx/certs/cloudflare-origin-pull-ca.pem
COPY deploy/nginx/twinmos.conf /etc/nginx/conf.d/default.conf
COPY --from=admin /app/apps/admin/dist/ /var/www/twinmos/admin/

EXPOSE 80 443

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8081/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
