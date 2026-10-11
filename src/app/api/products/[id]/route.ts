import type { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/auth";
import { updateProductSchema } from "@/schemas/product.schema";
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/services/product.service";
import { zodDetails, handleApiError } from "@/lib/api/error";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/products/[id]">,
) {
  try {
    const { id } = await ctx.params;
    const product = await getProductById(id);
    return successResponse(product);
  } catch (err) {
    return handleApiError(err, "GET /api/products/[id]");
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/products/[id]">,
) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;

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

    const product = await updateProduct(id, parsed.data);
    return successResponse(product);
  } catch (err) {
    return handleApiError(err, "PATCH /api/products/[id]");
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/products/[id]">,
) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    await deleteProduct(id);
    return successResponse({ id });
  } catch (err) {
    return handleApiError(err, "DELETE /api/products/[id]");
  }
}
