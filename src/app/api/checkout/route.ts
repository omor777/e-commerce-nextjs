import { handleApiError, zodDetails } from "@/lib/api/error";
import { errorResponse, successResponse } from "@/lib/api/response";
import { resolveCart } from "@/lib/cart";
import { checkoutSchema } from "@/schemas/checkout.schema";
import { checkout } from "@/services/checkout.service";
import type { NextRequest } from "next/server";

// POST /api/checkout
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "The request contains invalid fields.",
        400,
        zodDetails(parsed.error),
      );
    }

    // Resolve the cart for this user or guest. create: false —
    // you can't checkout a cart that doesn't exist.
    const cart = await resolveCart(false);
    if (!cart) {
      return errorResponse("NOT_FOUND", "Cart not found.", 404);
    }

    const order = await checkout(cart.id, parsed.data);
    return successResponse(order);
  } catch (err) {
    return handleApiError(err, "POST /api/checkout");
  }
}
