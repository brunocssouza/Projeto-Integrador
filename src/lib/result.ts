import { AppError } from "@/lib/errors";

export type Result<T> = Ok<T> | Fail;

interface Ok<T> {
  success: true;
  data: T;
}

interface Fail {
  success: false;
  error: AppError;
}

export function ok<T>(data: T): Ok<T> {
  return { success: true, data };
}

export function fail(error: AppError): Fail {
  return { success: false, error };
}

export function failFrom(code: string, message: string, httpStatus: number = 400): Fail {
  return fail(new AppError(code, message, httpStatus));
}
