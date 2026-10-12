# Stage 1: Build Astro SSR bundle
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
COPY packages/ ./packages/
COPY apps/web/package.json ./apps/web/
RUN npm ci

COPY apps/web/ ./apps/web/
WORKDIR /app/apps/web
ENV NODE_ENV=production
RUN npm run build:only

# Stage 2: Runtime image (non-root per SEC-C1)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

RUN chown -R node:node /app

COPY --from=builder --chown=node:node /app/apps/web/dist ./dist
COPY --from=builder --chown=node:node /app/apps/web/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/apps/web/package.json ./package.json

USER node

EXPOSE 4321

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:4321/ || exit 1

CMD ["node", "./dist/server/entry.mjs"]
