# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Copy manifests first (better layer caching — only re-runs npm ci when lockfile changes)
COPY package*.json ./

# Install ALL deps needed at build time
RUN npm ci

# Copy source
COPY . .

# Prune to production-only deps
RUN npm run build

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:18-alpine

WORKDIR /app

# Copy pruned node_modules + app code from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package*.json ./

# Drop root privileges — run as the built-in non-root user
USER node

EXPOSE 5000

CMD ["node", "src/app.js"]
