// app/api/orders/route.ts
import { requireAuth } from "@/lib/api/auth";
import { handleApiError, zodDetails } from "@/lib/api/error";
import {
  buildMeta,
  paginationSchema,
  toPrismaPagination,
} from "@/lib/api/pagination";
import { errorResponse, successResponse } from "@/lib/api/response";
import prisma from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const url = new URL(req.url);
    const parsed = paginationSchema.safeParse(
      Object.fromEntries(url.searchParams),
    );
    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "The request contains invalid fields.",
        400,
        zodDetails(parsed.error),
      );
    }

    const { skip, take } = toPrismaPagination(parsed.data);
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: user.id },
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
      prisma.order.count({ where: { userId: user.id } }),
    ]);

    return successResponse(items, buildMeta(parsed.data, total));
  } catch (err) {
    return handleApiError(err, "GET /api/orders");
  }
}
