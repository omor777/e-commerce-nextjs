// Central error class. Throw this anywhere; handleRoute() formats it.

import type { ZodError } from "zod";
import { errorResponse } from "./response";


export type ApiErrorDetail = {
  field: string;
  issue: string;
};

export class ApiError extends Error {
  code: string;
  status: number;
  details?: ApiErrorDetail[];

  constructor(
    code: string,
    message: string,
    status: number,
    details?: ApiErrorDetail[],
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// Convenience factories — keeps call sites short and consistent.
export const badRequest = (message: string, details?: ApiErrorDetail[]) =>
  new ApiError("VALIDATION_ERROR", message, 400, details);

export const unauthorized = (message = "Authentication required.") =>
  new ApiError("UNAUTHORIZED", message, 401);

export const forbidden = (
  message = "You do not have permission to perform this action.",
) => new ApiError("FORBIDDEN", message, 403);

export const notFound = (message = "Resource not found.") =>
  new ApiError("NOT_FOUND", message, 404);

export const conflict = (message: string) =>
  new ApiError("CONFLICT", message, 409);


// Converts a ZodError's issues into our `details[]` shape.
export function zodDetails(err: ZodError): ApiErrorDetail[] {
  return err.issues.map((i) => ({
    field: i.path.join(".") || "_root",
    issue: i.message,
  }));
}


// Single place that turns a thrown value into an errorResponse.
// Call this from every route's catch block.
export function handleApiError(err: unknown, context: string) {
  console.error(`[api] ${context}:`, err);

  if (err instanceof ApiError) {
    return errorResponse(err.code, err.message, err.status, err.details);
  }

  return errorResponse("INTERNAL_ERROR", "Something went wrong.", 500);
}