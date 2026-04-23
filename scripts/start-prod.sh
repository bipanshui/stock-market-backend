#!/usr/bin/env bash
# =============================================================================
#  start-prod.sh — Production startup script for Stock Analytics API
#
#  Usage:
#    ./scripts/start-prod.sh              # start
#    ./scripts/start-prod.sh reload       # zero-downtime reload (no downtime!)
#    ./scripts/start-prod.sh stop         # graceful stop
#    ./scripts/start-prod.sh restart      # full restart
#    ./scripts/start-prod.sh logs         # tail live logs
#    ./scripts/start-prod.sh status       # show PM2 process table
# =============================================================================

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$APP_DIR/logs"
ENV_FILE="$APP_DIR/.env"
HEALTH_URL="http://localhost:${PORT:-5000}/health"
MAX_HEALTH_WAIT=30   # seconds to wait for the app to become healthy
ACTION="${1:-start}"

# ── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'

log()     { echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $*"; }
success() { echo -e "${GREEN}[$(date '+%H:%M:%S')] ✔${NC} $*"; }
warn()    { echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠${NC} $*"; }
error()   { echo -e "${RED}[$(date '+%H:%M:%S')] ✘${NC} $*" >&2; }
die()     { error "$*"; exit 1; }

# ── Pre-flight checks ─────────────────────────────────────────────────────────
preflight() {
  log "Running pre-flight checks..."

  # Node.js present?
  command -v node &>/dev/null || die "node is not installed or not in PATH"
  log "Node $(node --version) found"

  # PM2 present?
  if ! command -v pm2 &>/dev/null; then
    warn "PM2 not found — installing globally..."
    npm install -g pm2 || die "Failed to install PM2"
  fi
  log "PM2 $(pm2 --version) found"

  # .env file present?
  [[ -f "$ENV_FILE" ]] || die ".env file not found at $ENV_FILE — copy .env.sample and fill in values"

  # node_modules present?
  [[ -d "$APP_DIR/node_modules" ]] || {
    warn "node_modules not found — running npm ci..."
    (cd "$APP_DIR" && npm ci --omit=dev) || die "npm ci failed"
  }

  # Ensure logs directory exists
  mkdir -p "$LOG_DIR"

  success "Pre-flight checks passed"
}

# ── Health check ──────────────────────────────────────────────────────────────
wait_for_health() {
  log "Waiting for health check at $HEALTH_URL..."
  local elapsed=0
  until curl -sf "$HEALTH_URL" >/dev/null 2>&1; do
    sleep 1
    ((elapsed++))
    if (( elapsed >= MAX_HEALTH_WAIT )); then
      error "App did not become healthy within ${MAX_HEALTH_WAIT}s"
      pm2 logs stock-api --lines 30 --nostream
      return 1
    fi
    printf '.'
  done
  echo ""
  success "App is healthy (took ${elapsed}s)"
}

# ── Actions ───────────────────────────────────────────────────────────────────
do_start() {
  preflight
  log "Starting application in ${BOLD}production${NC} mode..."
  (cd "$APP_DIR" && pm2 start ecosystem.config.js --env production)
  wait_for_health
  pm2 save              # persist process list for system restarts
  success "Stock API is up and running!"
  pm2 list
}

do_reload() {
  log "Performing ${BOLD}zero-downtime reload${NC}..."
  (cd "$APP_DIR" && pm2 reload ecosystem.config.js --env production)
  wait_for_health
  success "Reload complete — no downtime incurred."
}

do_restart() {
  log "Restarting application..."
  (cd "$APP_DIR" && pm2 restart ecosystem.config.js --env production)
  wait_for_health
  success "Restart complete."
}

do_stop() {
  log "Gracefully stopping application..."
  (cd "$APP_DIR" && pm2 stop ecosystem.config.js)
  success "Application stopped."
}

do_status() {
  pm2 list
}

do_logs() {
  pm2 logs stock-api
}

# ── Dispatch ──────────────────────────────────────────────────────────────────
case "$ACTION" in
  start)   do_start ;;
  reload)  do_reload ;;
  restart) do_restart ;;
  stop)    do_stop ;;
  status)  do_status ;;
  logs)    do_logs ;;
  *)
    echo "Usage: $0 {start|reload|restart|stop|status|logs}"
    exit 1
    ;;
esac
