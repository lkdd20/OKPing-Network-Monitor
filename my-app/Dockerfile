# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS deps

WORKDIR /app
RUN npm install --global --no-audit --no-fund pnpm@10.29.2

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS builder

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are embedded into browser JavaScript at build time.
ARG NEXT_PUBLIC_PING_WS_BASE_URL=ws://localhost:8080/websocket
ENV NEXT_PUBLIC_PING_WS_BASE_URL=${NEXT_PUBLIC_PING_WS_BASE_URL}

RUN npm install --global --no-audit --no-fund pnpm@10.29.2 \
  && pnpm build

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
