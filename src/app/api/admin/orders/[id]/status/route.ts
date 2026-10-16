import type { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/auth";
import { updateOrderStatusSchema } from "@/schemas/order.schema";
import { updateOrderStatus } from "@/services/admin-order.service";
import { zodDetails, handleApiError } from "@/lib/api/error";

// PATCH /api/admin/orders/:id/status
export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/admin/orders/[id]/status">,
) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;

    const body = await req.json();
    const parsed = updateOrderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "The request contains invalid fields.",
        400,
        zodDetails(parsed.error),
      );
    }

    const order = await updateOrderStatus(id, parsed.data);
    return successResponse(order);
  } catch (err) {
    return handleApiError(err, "PATCH /api/admin/orders/[id]/status");
  }
}
