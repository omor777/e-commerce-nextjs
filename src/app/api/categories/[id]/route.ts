import { requireAdmin } from "@/lib/api/auth";
import { conflict, handleApiError, notFound, zodDetails } from "@/lib/api/error";
import { errorResponse, successResponse } from "@/lib/api/response";
import prisma from "@/lib/prisma";
import { updateCategorySchema } from "@/schemas/category.schema";
import {
  deleteCategory,
  getCategoryById,
  updateCategory,
} from "@/services/category.service";
import type { NextRequest } from "next/server";

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


// DELETE /api/categories/:id
export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/categories/[id]">
) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;

    // 1. Fetch category and count its products
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) throw notFound("Category not found.");

    // 2. Prevent deletion if products are assigned to it
    if (category._count.products > 0) {
      throw conflict(
        `Cannot delete category. It has ${category._count.products} product(s). Reassign them first.`
      );
    }

    // 3. Safe to delete
    await prisma.category.delete({
      where: { id },
    });

    return successResponse({ id: category.id, deleted: true });
  } catch (err) {
    return handleApiError(err, "DELETE /api/categories/[id]");
  }
}
