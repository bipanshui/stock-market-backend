/**
 * PM2 Ecosystem Configuration
 * 
 * Usage:
 *   pm2 start ecosystem.config.js --env production
 *   pm2 reload ecosystem.config.js --env production   # zero-downtime reload
 *   pm2 stop ecosystem.config.js
 *   pm2 delete ecosystem.config.js
 *   pm2 logs stock-api
 */

const path = require('path');

const logDir = path.resolve(__dirname, 'logs');

module.exports = {
  apps: [
    {
      // ── App Identity ──────────────────────────────────────────────
      name: 'stock-api',
      script: 'src/app.js',

      // ── Cluster Mode (use all CPU cores) ─────────────────────────
      instances: 'max',       // or a number like 2
      exec_mode: 'cluster',   // enables zero-downtime reloads

      // ── Restart Policy ───────────────────────────────────────────
      watch: false,           // never watch files in production
      max_memory_restart: '512M',
      restart_delay: 3000,    // ms between crash restarts
      max_restarts: 10,       // give up after 10 rapid crashes
      min_uptime: '10s',      // must stay up 10s to count as "started"

      // ── Logging ──────────────────────────────────────────────────
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      out_file: path.join(logDir, 'pm2-out.log'),
      error_file: path.join(logDir, 'pm2-error.log'),
      merge_logs: true,       // merge cluster instance logs

      // ── Graceful Shutdown ────────────────────────────────────────
      kill_timeout: 10000,    // ms to wait before SIGKILL on stop
      listen_timeout: 8000,   // ms PM2 waits for app to be "online"

      // ── Environment: Development ─────────────────────────────────
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },

      // ── Environment: Production ──────────────────────────────────
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },

    // ── Cron Job (single instance, no cluster) ───────────────────────
    {
      name: 'stock-cron',
      script: 'src/jobs/scheduler.js',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 0 * * *',    // restart daily at midnight (optional)
      watch: false,
      autorestart: true,
      max_restarts: 5,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      out_file: path.join(logDir, 'cron-out.log'),
      error_file: path.join(logDir, 'cron-error.log'),

      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
