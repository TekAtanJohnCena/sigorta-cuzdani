// ============================================
// Structured Logger — Winston benzeri, sıfır dependency
// console.log yerine bu kullanılmalı
// ============================================

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
  error?: string;
}

const IS_PROD = process.env.NODE_ENV === "production";

function log(level: LogLevel, message: string, context?: string, data?: unknown) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context && { context }),
    ...(data !== undefined && { data }),
  };

  // Production: JSON structured log (Vercel/Datadog ile uyumlu)
  if (IS_PROD) {
    const output = JSON.stringify(entry);
    if (level === "error" || level === "warn") {
      console.error(output);
    } else {
      console.log(output);
    }
    return;
  }

  // Development: okunabilir format
  const prefix = {
    debug: "\x1b[36m[DEBUG]\x1b[0m",
    info:  "\x1b[32m[INFO]\x1b[0m ",
    warn:  "\x1b[33m[WARN]\x1b[0m ",
    error: "\x1b[31m[ERROR]\x1b[0m",
  }[level];

  const ctx = context ? ` \x1b[35m${context}\x1b[0m` : "";
  const dataStr = data ? `\n  ${JSON.stringify(data, null, 2).replace(/\n/g, "\n  ")}` : "";

  const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  fn(`${entry.timestamp} ${prefix}${ctx} ${message}${dataStr}`);
}

export const logger = {
  debug: (message: string, context?: string, data?: unknown) => log("debug", message, context, data),
  info:  (message: string, context?: string, data?: unknown) => log("info",  message, context, data),
  warn:  (message: string, context?: string, data?: unknown) => log("warn",  message, context, data),
  error: (message: string, context?: string, data?: unknown) => log("error", message, context, data),

  // Audit log: kritik güvenlik olayları için
  audit: (event: string, tenantId: string, userId?: string, meta?: unknown) => {
    const entry = {
      type: "AUDIT",
      event,
      tenantId,
      userId,
      timestamp: new Date().toISOString(),
      meta,
    };
    console.log(JSON.stringify(entry));
  },
};
