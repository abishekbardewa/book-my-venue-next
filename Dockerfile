# syntax=docker/dockerfile:1

FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci


# Build the application
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN --mount=type=secret,id=env,target=/app/.env \
    echo "Checking BuildKit env secret..." && \
    test -s /app/.env && \
    echo "✓ /app/.env exists and is non-empty" && \
    echo "Env variable count:" && \
    grep -E '^[A-Za-z_][A-Za-z0-9_]*=' /app/.env | wc -l && \
    npm run build


# Production image
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]