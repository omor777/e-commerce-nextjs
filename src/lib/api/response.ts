import { NextResponse } from "next/server";
import type { ApiErrorDetail } from "./error";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
};

// Success envelope. meta is only included when provided (list endpoints).
export function successResponse<T>(data: T, meta?: PaginationMeta) {
  const body: { success: true; data: T; meta?: PaginationMeta } = {
    success: true,
    data,
  };
  if (meta) body.meta = meta;
  return NextResponse.json(body, { status: 200 });
}

// Error envelope. Used by handleRoute(); can also be called directly.
export function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: ApiErrorDetail[],
) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, status, ...(details ? { details } : {}) },
    },
    { status },
  );
}
