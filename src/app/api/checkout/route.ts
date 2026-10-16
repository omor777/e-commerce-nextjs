import type { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { getOptionalUser } from "@/lib/api/auth";
import { resolveCart } from "@/lib/cart";
import { checkoutSchema } from "@/schemas/checkout.schema";
import { checkout } from "@/services/checkout.service";
import { zodDetails, handleApiError } from "@/lib/api/error";

// POST /api/checkout
export async function POST(req: NextRequest) {
  try {
    const user = await getOptionalUser();
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
    const cart = await resolveCart(user?.id ?? null, false);
    if (!cart) {
      return errorResponse("NOT_FOUND", "Cart not found.", 404);
    }

    const order = await checkout(cart.id, parsed.data);
    return successResponse(order);
  } catch (err) {
    return handleApiError(err, "POST /api/checkout");
  }
}
