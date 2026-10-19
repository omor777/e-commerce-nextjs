import type { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/auth";
import { updateProductSchema } from "@/schemas/product.schema";
import {
  getProductBySlug, // 👈 Using the slug service directly
  updateProduct,
  deleteProduct,
} from "@/services/product.service";
import { zodDetails, handleApiError } from "@/lib/api/error";

// GET /api/products/:slug
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/products/[slug]">,
) {
  try {
    const { slug } = await ctx.params;
    // 🔄 CHANGED: Strictly fetch by slug
    const product = await getProductBySlug(slug);
    return successResponse(product);
  } catch (err) {
    return handleApiError(err, "GET /api/products/[slug]");
  }
}

// PATCH /api/products/:slug
export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/products/[slug]">,
) {
  try {
    await requireAdmin();
    const { slug } = await ctx.params;

    // Note: For PATCH/DELETE, you usually need the ID.
    // If your service functions (updateProduct/deleteProduct) strictly require an ID,
    // you'll need to fetch the product first to get its ID, OR update your service functions to accept the slug.
    // Assuming your services can handle a slug lookup internally or you fetch it here:

    const product = await getProductBySlug(slug);

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
    const updated = await updateProduct(product.id, parsed.data);
    return successResponse(updated);
  } catch (err) {
    return handleApiError(err, "PATCH /api/products/[slug]");
  }
}

// DELETE /api/products/:slug
export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/products/[slug]">,
) {
  try {
    await requireAdmin();
    const { slug } = await ctx.params;

    const product = await getProductBySlug(slug);
    await deleteProduct(product.id);
    return successResponse({ id: product.id });
  } catch (err) {
    return handleApiError(err, "DELETE /api/products/[slug]");
  }
}
