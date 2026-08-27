# ==============================================================================
# Aumveda Next.js Production Dockerfile for Google Cloud Run
# Multi-stage build with pnpm, Prisma, and Next.js standalone output
# ==============================================================================

# --- Stage 1: Base image ---
FROM node:20-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

# --- Stage 2: Dependencies ---
FROM base AS deps
WORKDIR /app

# Copy root workspace configuration & lockfile
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./

# Copy package manifests across all workspaces
COPY apps/web/package.json ./apps/web/
COPY apps/admin/package.json ./apps/admin/
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/

# Copy Prisma schema early for prisma generate
COPY packages/db/prisma ./packages/db/prisma

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# --- Stage 3: Builder ---
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /app/packages/utils/node_modules ./packages/utils/node_modules

# Copy full source tree
COPY . .

# Generate Prisma client for linux Debian target
RUN pnpm db:generate

# Build Next.js application in standalone mode
# Disable telemetry and set production environment for build optimization
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN pnpm --filter @aumveda/web build

# --- Stage 4: Production Runner ---
FROM node:20-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root system user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create Cloud SQL socket directory with proper permissions
RUN mkdir -p /cloudsql && chown -R nextjs:nodejs /cloudsql && chmod 777 /cloudsql

# Copy standalone build output and static/public assets
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Optional fallback copy to root static/public for standard Next.js asset routing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

USER nextjs

EXPOSE 8080

CMD ["node", "apps/web/server.js"]
