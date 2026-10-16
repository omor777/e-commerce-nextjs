import type { NextRequest } from "next/server";
import { successResponse } from "@/lib/api/response";
import { requireAuth } from "@/lib/api/auth";
import { getMyOrderById } from "@/services/order.service";
import { handleApiError } from "@/lib/api/error";

// GET /api/me/orders/:id
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/me/orders/[id]">,
) {
  try {
    const user = await requireAuth();
    const { id } = await ctx.params;
    const order = await getMyOrderById(user.id, id);
    return successResponse(order);
  } catch (err) {
    return handleApiError(err, "GET /api/me/orders/[id]");
  }
}


// TODO: I want guest orders to migrate on login that's the cart-merge feature, extended.

/*

* Known gaps (still open)
Guest order lookup — a guest can't view their order after checkout. The Order record exists and email + orderNumber are both stored; a GET /api/orders/lookup?email=&orderNumber= endpoint would fill this. Not built — you chose A.

Guest cart merge on login — still not built.

Email confirmation of order — no transactional email on creation or status change.
*/