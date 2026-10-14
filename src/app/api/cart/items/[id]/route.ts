import { requireAuth } from "@/lib/api/auth";
import { handleApiError, zodDetails } from "@/lib/api/error";
import { errorResponse, successResponse } from "@/lib/api/response";
import { resolveCart } from "@/lib/cart";
import { updateCartItemSchema } from "@/schemas/cart.schema";
import {
  removeCartItem,
  updateCartItemQuantity,
} from "@/services/cart.service";
import type { NextRequest } from "next/server";

// PATCH /api/cart/items/:id
export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/cart/items/[id]">,
) {
  try {
    let userId: string | null = null;
    try {
      const user = await requireAuth();
      userId = user.id;
    } catch {
      userId = null;
    }

    const { id } = await ctx.params;

    const body = await req.json();
    const parsed = updateCartItemSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "The request contains invalid fields.",
        400,
        zodDetails(parsed.error),
      );
    }

    const cart = await resolveCart(userId, false);
    if (!cart) {
      return errorResponse("NOT_FOUND", "Cart not found.", 404);
    }

    const updated = await updateCartItemQuantity(
      cart.id,
      id,
      parsed.data.quantity,
    );
    return successResponse(updated);
  } catch (err) {
    return handleApiError(err, "PATCH /api/cart/items/[id]");
  }
}

// DELETE /api/cart/items/:id
export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/cart/items/[id]">,
) {
  try {
    let userId: string | null = null;
    try {
      const user = await requireAuth();
      userId = user.id;
    } catch {
      userId = null;
    }

    const { id } = await ctx.params;

    const cart = await resolveCart(userId, false);
    if (!cart) {
      return errorResponse("NOT_FOUND", "Cart not found.", 404);
    }

    const updated = await removeCartItem(cart.id, id);
    return successResponse(updated);
  } catch (err) {
    return handleApiError(err, "DELETE /api/cart/items/[id]");
  }
}
