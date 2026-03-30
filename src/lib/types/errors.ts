// Typed error hierarchy — CLAUDE.md: "ALWAYS handle errors with typed AppError classes"

export class AppError extends Error {
  readonly code: string;
  readonly context: Record<string, unknown>;
  readonly statusCode: number;

  constructor(
    message: string,
    code: string,
    context: Record<string, unknown> = {},
    statusCode = 500,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.context = context;
    this.statusCode = statusCode;
  }
}

export class AIError extends AppError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, "AI_ERROR", context, 502);
    this.name = "AIError";
  }
}

export class FileProcessingError extends AppError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, "FILE_PROCESSING_ERROR", context, 422);
    this.name = "FileProcessingError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, "VALIDATION_ERROR", context, 400);
    this.name = "ValidationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, "AUTHORIZATION_ERROR", context, 403);
    this.name = "AuthorizationError";
  }
}

export class RateLimitError extends AppError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, "RATE_LIMIT_ERROR", context, 429);
    this.name = "RateLimitError";
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toAppError(error: unknown): AppError {
  if (isAppError(error)) return error;
  if (error instanceof Error) {
    return new AppError(error.message, "UNKNOWN_ERROR", {
      original: error.message,
    });
  }
  return new AppError("An unknown error occurred", "UNKNOWN_ERROR");
}
