type LogLevel = "info" | "warn" | "error";

function write(level: LogLevel, scope: string, message: string, meta?: Record<string, unknown>) {
  const payload = {
    level,
    scope,
    message,
    ...(meta ? { meta } : {}),
    at: new Date().toISOString(),
  };
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const appLogger = {
  info(scope: string, message: string, meta?: Record<string, unknown>) {
    write("info", scope, message, meta);
  },
  warn(scope: string, message: string, meta?: Record<string, unknown>) {
    write("warn", scope, message, meta);
  },
  error(scope: string, message: string, meta?: Record<string, unknown>) {
    write("error", scope, message, meta);
  },
};
