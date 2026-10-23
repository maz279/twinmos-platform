# Stage 1: Build Astro SSR bundle
FROM mirror.gcr.io/library/node:24-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
COPY packages/ ./packages/
COPY apps/web/package.json ./apps/web/
RUN npm ci

COPY apps/web/ ./apps/web/
COPY tsconfig.base.json ./
WORKDIR /app/apps/web
ENV NODE_ENV=production
RUN npm run build:only

# Stage 2: Dependencies for production runtime
FROM mirror.gcr.io/library/node:24-alpine AS dependencies
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
COPY apps/web/package.json ./apps/web/
RUN npm ci --omit=dev --workspaces --include-workspace-root

# Stage 3: Runtime image (non-root per SEC-C1)
FROM mirror.gcr.io/library/node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

RUN chown -R node:node /app

COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/apps/web/dist ./dist
COPY --from=builder --chown=node:node /app/apps/web/package.json ./package.json

USER node

EXPOSE 4321

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:4321/ || exit 1

CMD ["node", "./dist/server/entry.mjs"]

