FROM node:22.21.1-slim AS base
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

FROM base AS builder
WORKDIR /app

# Required build deps for some native modules
RUN apt-get update -qq \
    && apt-get install --no-install-recommends -y build-essential node-gyp openssl pkg-config python-is-python3 \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# Install project dependencies
COPY .npmrc package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Prisma schema generation
COPY prisma ./prisma
RUN npx prisma generate

# Copy source
COPY . .

# Allow skipping env validation during image build (useful for remote builders like Fly)
# Pass this as a build-arg: --build-arg SKIP_ENV_VALIDATION=1
ARG SKIP_ENV_VALIDATION
ENV SKIP_ENV_VALIDATION=${SKIP_ENV_VALIDATION}

# Build Next.js app
RUN npx next build --experimental-build-mode compile

FROM base AS runner
WORKDIR /app

RUN apt-get update -qq \
    && apt-get install --no-install-recommends -y openssl \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# Copy built artifacts
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["pnpm", "start"]
