# Stage 1: Pruning / Base dependencies
FROM mirror.gcr.io/library/node:24-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

FROM base AS dependencies
RUN npm ci --omit=dev && \
    rm -rf node_modules/drizzle-kit node_modules/esbuild node_modules/@esbuild-kit* node_modules/vitest

FROM base AS builder
RUN npm ci
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
COPY tsconfig.base.json ./
# Verify typing integrity
RUN npx tsc -p apps/api/tsconfig.json

# Stage 2: Production runtime (minimal & non-root per S-11 / SEC-C1)
FROM mirror.gcr.io/library/node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8787

# Add non-root node user configuration
RUN chown -R node:node /app

COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules

COPY --chown=node:node packages/ ./packages/
COPY --chown=node:node apps/api/ ./apps/api/
COPY --chown=node:node package.json ./

USER node

EXPOSE 8787

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8787/api/v1/health || exit 1

WORKDIR /app/apps/api
CMD ["node", "--experimental-strip-types", "--no-warnings", "src/index.ts"]

