import { requireAdmin } from "@/lib/api/auth";
import { handleApiError } from "@/lib/api/error";
import { successResponse } from "@/lib/api/response";
import { getAdminOrderDetails } from "@/queries/order.queries";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/admin/orders/[id]">,
) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const order = await getAdminOrderDetails(id);
    return successResponse(order);
  } catch (err) {
    return handleApiError(err, "GET /api/admin/orders/[id]");
  }
}
