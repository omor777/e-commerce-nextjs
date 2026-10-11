import type { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/auth";
import { updateVariantSchema } from "@/schemas/product.schema";
import { updateVariant, deleteVariant } from "@/services/product.service";
import { zodDetails, handleApiError } from "@/lib/api/error";

// PATCH /api/variants/:id  (admin only)
export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/variants/[id]">
) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;

    const body = await req.json();
    const parsed = updateVariantSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "The request contains invalid fields.",
        400,
        zodDetails(parsed.error),
      );
    }

    const variant = await updateVariant(id, parsed.data);
    return successResponse(variant);
  } catch (err) {
    return handleApiError(err, "PATCH /api/variants/[id]");
  }
}

// DELETE /api/variants/:id  (admin only)
export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/variants/[id]">,
) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    await deleteVariant(id);
    return successResponse({ id });
  } catch (err) {
    return handleApiError(err, "DELETE /api/variants/[id]");
  }
}
