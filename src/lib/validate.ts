import { z, ZodError } from "zod";
import { NextRequest } from "next/server";
import { AppError, validationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

/**
 * Parse and validate a request body using a zod schema.
 * Returns parsed data or throws a 422 AppError with field-level errors.
 */
export async function validateBody<T extends z.ZodType>(
  schema: T,
  req: NextRequest
): Promise<z.infer<T>> {
  try {
    const body = await req.json();
    return (await schema.parseAsync(body)) as z.infer<T>;
  } catch (err) {
    if (err instanceof ZodError) {
      const formatted = err.flatten();
      throw validationError(formatted.fieldErrors);
    }
    throw new AppError("INVALID_BODY", "Corpo da requisição inválido", 422);
  }
}

/**
 * Parse and validate query parameters using a zod schema.
 * Always sync since query params are already in memory.
 */
export function validateQuery<T extends z.ZodType>(schema: T, req: NextRequest): z.infer<T> {
  try {
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    return schema.parse(searchParams) as z.infer<T>;
  } catch (err) {
    if (err instanceof ZodError) {
      const formatted = err.flatten();
      throw validationError(formatted.fieldErrors);
    }
    throw new AppError("INVALID_QUERY", "Parâmetros de consulta inválidos", 422);
  }
}

/**
 * Parse and validate URL path parameters.
 * Typically used with next.js dynamic route params.
 */
export function validateParams<T extends z.ZodType>(schema: T, params: unknown): z.infer<T> {
  try {
    return schema.parse(params) as z.infer<T>;
  } catch (err) {
    if (err instanceof ZodError) {
      throw validationError(err.flatten().fieldErrors);
    }
    throw new AppError("INVALID_PARAMS", "Parâmetros inválidos", 422);
  }
}

/**
 * Parse and validate multipart/form-data using a zod schema.
 * Used for file uploads (avatar, etc.).
 */
export async function validateFormData<T extends z.ZodType>(
  schema: T,
  req: NextRequest
): Promise<z.infer<T>> {
  try {
    const formData = await req.formData();
    const data: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    return (await schema.parseAsync(data)) as z.infer<T>;
  } catch (err) {
    if (err instanceof ZodError) {
      throw validationError(err.flatten().fieldErrors);
    }
    throw new AppError("INVALID_FORM", "Formulário inválido", 422);
  }
}

/**
 * Try-catch wrapper that catches AppError and returns the JSON response.
 * Uncaught errors (not AppError) become 500 internal errors.
 * Supports both simple and dynamic route handlers.
 */
export function withErrorHandler<TArgs = unknown>(
  handler: (req: NextRequest, ctx: TArgs) => Promise<Response>
): (req: NextRequest, ctx: TArgs) => Promise<Response> {
  return async (req: NextRequest, ctx: TArgs) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof AppError) {
        return Response.json(err.toJSON(), { status: err.httpStatus });
      }
      logger.error("Unhandled error in route", {
        error: err instanceof Error ? err.message : String(err),
        path: req.nextUrl.pathname,
      });
      return Response.json(
        { error: "Erro interno do servidor", code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    }
  };
}
