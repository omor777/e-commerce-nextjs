import { requireAuth } from "@/lib/api/auth";
import { handleApiError, zodDetails } from "@/lib/api/error";
import { errorResponse, successResponse } from "@/lib/api/response";
import { listMyOrdersQuerySchema } from "@/schemas/order.schema";
import { listMyOrders } from "@/services/order.service";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const url = new URL(req.url);
    const parsed = listMyOrdersQuerySchema.safeParse(
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

    const { items, meta } = await listMyOrders(user.id, parsed.data);
    return successResponse(items, meta);
  } catch (err) {
    return handleApiError(err, "GET /api/me/orders");
  }
}
