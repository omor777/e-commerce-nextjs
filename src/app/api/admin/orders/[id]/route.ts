import type { NextRequest } from "next/server";
import { successResponse } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/auth";
import { getOrderById } from "@/services/admin-order.service";
import { handleApiError } from "@/lib/api/error";

// GET /api/admin/orders/:id
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/admin/orders/[id]">,
) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const order = await getOrderById(id);
    return successResponse(order);
  } catch (err) {
    return handleApiError(err, "GET /api/admin/orders/[id]");
  }
}
