/**
 * Framework-independent application errors.
 * Portable: no Deno/Node/React/Supabase imports. Any transport (Edge Function,
 * NestJS controller, TanStack server function) maps these to HTTP responses.
 */

export type AppErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION"
  | "INTERNAL";

const STATUS_BY_CODE: Record<AppErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION: 422,
  INTERNAL: 500,
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  readonly details: unknown;

  constructor(code: AppErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.details = details ?? null;
  }

  toJSON() {
    return { code: this.code, status: this.status, message: this.message, details: this.details };
  }
}

export const unauthorized = (m = "You are not signed in.") => new AppError("UNAUTHORIZED", m);
export const forbidden = (m = "You do not have permission to perform this action.") =>
  new AppError("FORBIDDEN", m);
export const notFound = (m = "The requested record does not exist.") => new AppError("NOT_FOUND", m);
export const conflict = (m: string, details?: unknown) => new AppError("CONFLICT", m, details);
export const validationFailed = (m: string, details?: unknown) => new AppError("VALIDATION", m, details);

/** Maps a Postgres/PostgREST error into a safe, user-facing application error. */
export function fromDatabaseError(error: { code?: string; message: string; details?: string | null }): AppError {
  switch (error.code) {
    case "23505":
      return conflict("A record with these details already exists.");
    case "23503":
      return conflict("This record is still referenced by other data and cannot be removed.");
    case "23514":
      return validationFailed("The submitted values violate a database constraint.");
    case "42501":
    case "PGRST301":
      return forbidden();
    case "PGRST116":
      return notFound();
    default:
      // Never leak raw database internals to the client.
      console.error("[db]", error.code, error.message, error.details);
      return new AppError("INTERNAL", "Something went wrong while processing the request.");
  }
}

export function serializeError(error: unknown): { code: AppErrorCode; status: number; message: string } {
  if (error instanceof AppError) return { code: error.code, status: error.status, message: error.message };
  console.error("[unhandled]", error);
  return { code: "INTERNAL", status: 500, message: "Something went wrong while processing the request." };
}
