type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  userId?: string | number;
  requestId?: string;
  path?: string;
  method?: string;
  duration?: number;
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getMinLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL as LogLevel | undefined;
  if (envLevel && LOG_LEVELS[envLevel] !== undefined) return envLevel;
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[getMinLevel()];
}

function formatLog(level: LogLevel, message: string, context?: LogContext): void {
  if (!shouldLog(level)) return;

  const entry: Record<string, unknown> = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };

  // Redact PII-like fields in production
  if (process.env.NODE_ENV === "production") {
    if (entry.email) entry.email = "[REDACTED]";
    if (typeof entry.ip === "string") entry.ip = entry.ip.slice(0, 3) + "***";
  }

  const output = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    case "debug":
      console.debug(output);
      break;
    default:
      console.info(output);
  }
}

export const logger = {
  debug(message: string, context?: LogContext) {
    formatLog("debug", message, context);
  },
  info(message: string, context?: LogContext) {
    formatLog("info", message, context);
  },
  warn(message: string, context?: LogContext) {
    formatLog("warn", message, context);
  },
  error(message: string, context?: LogContext) {
    formatLog("error", message, context);
  },
};

export type { LogLevel, LogContext };
