import type { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { paginationSchema } from "@/lib/api/pagination";
import { requireAdmin } from "@/lib/api/auth";
import { createCategorySchema } from "@/schemas/category.schema";
import { listCategories, createCategory } from "@/services/category.service";
import { handleApiError, zodDetails } from "@/lib/api/error";

// GET /api/categories?page=1&limit=10
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const parsed = paginationSchema.safeParse(
      Object.fromEntries(url.searchParams),
    );
    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "The request contains invalid fields.",
        400,
        zodDetails(parsed.error),
      );
    }

    const { items, meta } = await listCategories(parsed.data);
    return successResponse(items, meta);
  } catch (err) {
    return handleApiError(err, "GET /api/categories");
  }
}

// POST /api/categories  (admin only)
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "The request contains invalid fields.",
        400,
        zodDetails(parsed.error),
      );
    }

    const category = await createCategory(parsed.data);
    return successResponse(category);
  } catch (err) {
    return handleApiError(err, "POST /api/categories");
  }
}
