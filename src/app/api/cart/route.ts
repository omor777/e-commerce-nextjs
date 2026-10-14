import { requireAuth } from "@/lib/api/auth";
import { handleApiError } from "@/lib/api/error";
import { successResponse } from "@/lib/api/response";
import { resolveCart } from "@/lib/cart";
import { clearCart } from "@/services/cart.service";

// GET /api/cart
export async function GET() {
  try {
    let userId: string | null = null;
    try {
      const user = await requireAuth();
      userId = user.id;
    } catch {
      // No session → guest flow. Not an error.
      userId = null;
    }

    const cart = await resolveCart(userId, false);
    return successResponse(cart); // cart may be null
  } catch (err) {
    return handleApiError(err, "GET /api/cart");
  }
}

// DELETE /api/cart  (clear)
export async function DELETE() {
  try {
    let userId: string | null = null;
    try {
      const user = await requireAuth();
      userId = user.id;
    } catch {
      userId = null;
    }

    const cart = await resolveCart(userId, false);
    if (!cart) return successResponse(null);

    const cleared = await clearCart(cart.id);
    return successResponse(cleared);
  } catch (err) {
    return handleApiError(err, "DELETE /api/cart");
  }
}
