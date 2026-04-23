# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Copy manifests first (better layer caching)
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

# Create logs directory and set ownership to 'node' user
RUN mkdir logs && chown -R node:node /app

# Copy pruned node_modules + app code from builder with proper ownership
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/src ./src
COPY --chown=node:node --from=builder /app/package*.json ./

# Drop root privileges — run as the built-in non-root user
USER node

EXPOSE 5000

CMD ["node", "src/app.js"]
