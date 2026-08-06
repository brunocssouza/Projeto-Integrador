/**
 * PM2 cluster configuration — runs multiple Next.js instances across all CPU
 * cores behind a single entry point. Pair with nginx (see nginx.conf) which
 * load-balances across the instance ports.
 *
 *   npm run build
 *   npm run start:cluster        # starts N instances (one per core)
 *   npm run start:lb             # zero-downtime reload
 *   npm run stop:cluster
 *
 * Instances log to ./logs/. Env vars come from .env.local (loaded by the app
 * via lib/env.ts) or your process manager / container env.
 */
module.exports = {
  apps: [
    {
      name: "mock-mentor",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: "max", // one per CPU core
      exec_mode: "cluster",
      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000,
      max_memory_restart: "512M",
      // Health / graceful shutdown
      kill_timeout: 3000,
      listen_timeout: 8000,
      shutdown_with_message: false,
      // Logs
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
