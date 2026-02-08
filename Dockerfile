# --- Base Stage ---
FROM node:22.21.1-slim AS base
WORKDIR /app
RUN npm install -g pnpm@latest

# --- Builder Stage ---
FROM base AS builder
WORKDIR /app

# Install system dependencies
RUN apt-get update -qq \
    && apt-get install --no-install-recommends -y build-essential node-gyp openssl pkg-config python-is-python3 \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# 1. Install dependencies
COPY .npmrc package.json pnpm-lock.yaml ./
COPY prisma ./prisma/
RUN pnpm install --frozen-lockfile

# 2. Copy source code
COPY . .

# 3. Build setup
# SKIP_ENV_VALIDATION is critical for T3 apps during build
ARG SKIP_ENV_VALIDATION=1
ENV SKIP_ENV_VALIDATION=${SKIP_ENV_VALIDATION}
ENV NODE_ENV=production

# Ensure the script is executable
RUN chmod +x dbsetup.js

RUN pnpm run build

# --- Runner Stage ---
FROM base AS runner
WORKDIR /app

RUN apt-get update -qq \
    && apt-get install --no-install-recommends -y openssl \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dbsetup.js ./dbsetup.js
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Using the dbsetup script as the entrypoint
CMD ["node", "dbsetup.js", "pnpm", "start"]