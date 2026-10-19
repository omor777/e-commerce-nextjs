import type { NextRequest } from "next/server";
import { successResponse } from "@/lib/api/response";
import { getOrderById } from "@/services/admin-order.service"; // Reusing your existing service
import { handleApiError } from "@/lib/api/error";

// GET /api/orders/:id
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/orders/[id]">,
) {
  try {
    const { id } = await ctx.params;
    // Note: In a production app, you should secure this.
    // Usually, you only return an order if the user's session matches the userId,
    // OR if they provide a secure token (like the orderNumber or email).
    // For this MVP success page, we'll allow fetching by ID so guests can see it.
    const order = await getOrderById(id);
    return successResponse(order);
  } catch (err) {
    return handleApiError(err, "GET /api/orders/[id]");
  }
}
