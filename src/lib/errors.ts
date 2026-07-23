/**
 * Application-level error with HTTP status code and machine-readable code.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly httpStatus: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    httpStatus: number = 400,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

// --- Convenience helpers ---

export function badRequest(message: string, details?: Record<string, unknown>): AppError {
  return new AppError("BAD_REQUEST", message, 400, details);
}

export function unauthorized(message: string = "Não autenticado"): AppError {
  return new AppError("UNAUTHORIZED", message, 401);
}

export function forbidden(message: string = "Acesso negado"): AppError {
  return new AppError("FORBIDDEN", message, 403);
}

export function notFound(message: string = "Recurso não encontrado"): AppError {
  return new AppError("NOT_FOUND", message, 404);
}

export function conflict(message: string, details?: Record<string, unknown>): AppError {
  return new AppError("CONFLICT", message, 409, details);
}

export function validationError(details: Record<string, unknown>): AppError {
  return new AppError("VALIDATION_ERROR", "Dados inválidos", 422, details);
}

export function tooManyRequests(
  message: string = "Muitas requisições. Tente novamente mais tarde.",
  retryAfterSeconds?: number
): AppError {
  return new AppError("TOO_MANY_REQUESTS", message, 429, {
    retryAfter: retryAfterSeconds,
  });
}

export function internalError(message: string = "Erro interno do servidor"): AppError {
  return new AppError("INTERNAL_ERROR", message, 500);
}
