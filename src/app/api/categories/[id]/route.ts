import type { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/auth";
import { updateCategorySchema } from "@/schemas/category.schema";
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "@/services/category.service";
import { zodDetails, handleApiError } from "@/lib/api/error";

// GET /api/categories/:id
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/categories/[id]">,
) {
  try {
    const { id } = await ctx.params;
    const category = await getCategoryById(id);
    return successResponse(category);
  } catch (err) {
    return handleApiError(err, "GET /api/categories/[id]");
  }
}

// PATCH /api/categories/:id  (admin only)
export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/categories/[id]">,
) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;

    const body = await req.json();
    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "The request contains invalid fields.",
        400,
        zodDetails(parsed.error),
      );
    }

    const category = await updateCategory(id, parsed.data);
    return successResponse(category);
  } catch (err) {
    return handleApiError(err, "PATCH /api/categories/[id]");
  }
}

// DELETE /api/categories/:id  (admin only)
export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/categories/[id]">,
) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    await deleteCategory(id);
    return successResponse({ id });
  } catch (err) {
    return handleApiError(err, "DELETE /api/categories/[id]");
  }
}
