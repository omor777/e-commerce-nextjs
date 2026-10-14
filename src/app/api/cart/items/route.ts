import { requireAuth } from "@/lib/api/auth";
import { handleApiError, zodDetails } from "@/lib/api/error";
import { errorResponse, successResponse } from "@/lib/api/response";
import { resolveCart } from "@/lib/cart";
import { addCartItemSchema } from "@/schemas/cart.schema";
import { addItemToCart } from "@/services/cart.service";
import type { NextRequest } from "next/server";

// POST /api/cart/items
export async function POST(req: NextRequest) {
  try {
    let userId: string | null = null;
    try {
      const user = await requireAuth();
      userId = user.id;
    } catch {
      userId = null;
    }

    const body = await req.json();
    const parsed = addCartItemSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "The request contains invalid fields.",
        400,
        zodDetails(parsed.error),
      );
    }

    const cart = await resolveCart(userId, true);

    if (!cart) {
      if (!cart) {
        return errorResponse("NOT_FOUND", "Cart not found.", 404);
      }
    }

    const updated = await addItemToCart(cart.id, parsed.data);
    return successResponse(updated);
  } catch (err) {
    return handleApiError(err, "POST /api/cart/items");
  }
}
