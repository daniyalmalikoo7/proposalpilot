// Structured logger — CLAUDE.md: "NEVER use console.log. Use this logger."
// Emits JSON in production, human-readable in development.

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getConfiguredLevel(): LogLevel {
  const level = process.env.LOG_LEVEL ?? "info";
  if (level in LOG_LEVEL_PRIORITY) return level as LogLevel;
  return "info";
}

function shouldEmit(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[getConfiguredLevel()];
}

function emit(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
): void {
  if (!shouldEmit(level)) return;

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };

  if (process.env.NODE_ENV === "production") {
    process.stdout.write(JSON.stringify(entry) + "\n");
  } else {
    const contextStr =
      context && Object.keys(context).length > 0
        ? ` ${JSON.stringify(context, null, 0)}`
        : "";
    const prefix = `[${entry.timestamp}] ${level.toUpperCase().padEnd(5)}`;
    const logFn =
      level === "error"
        ? console.error
        : level === "warn"
          ? console.warn
          : console.log;
    logFn(`${prefix} ${message}${contextStr}`);
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) =>
    emit("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) =>
    emit("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) =>
    emit("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) =>
    emit("error", message, context),
};
