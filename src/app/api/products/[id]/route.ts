import { requireAdmin } from "@/lib/api/auth";
import { handleApiError, zodDetails } from "@/lib/api/error";
import { errorResponse, successResponse } from "@/lib/api/response";
import { updateProductSchema } from "@/schemas/product.schema";
import {
  deleteProduct,
  getProductBySlug, // 👈 Using the slug service directly
  updateProduct,
} from "@/services/product.service";
import type { NextRequest } from "next/server";

// GET /api/products/:slug
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/products/[id]">,
) {
  try {
    const { id } = await ctx.params;
    // 🔄 CHANGED: Strictly fetch by slug
    const product = await getProductBySlug(id);
    return successResponse(product);
  } catch (err) {
    return handleApiError(err, "GET /api/products/[slug]");
  }
}

// PATCH /api/products/:slug
export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/products/[id]">,
) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    // const product = await getProductBySlug(slug);

    const body = await req.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "The request contains invalid fields.",
        400,
        zodDetails(parsed.error),
      );
    }

    // If updateProduct requires an ID, pass product.id
    const updated = await updateProduct(id, parsed.data);
    return successResponse(updated);
  } catch (err) {
    return handleApiError(err, "PATCH /api/products/[slug]");
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/products/[id]">,
) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;

    const { id: deleteProductId } = await deleteProduct(id);
    return successResponse({ id: deleteProductId });
  } catch (err) {
    return handleApiError(err, "DELETE /api/products/[slug]");
  }
}
