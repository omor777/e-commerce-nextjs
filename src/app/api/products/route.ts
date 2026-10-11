import type { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/auth";
import {
  createProductSchema,
  listProductsQuerySchema,
} from "@/schemas/product.schema";
import { listProducts, createProduct } from "@/services/product.service";
import { zodDetails, handleApiError } from "@/lib/api/error";

// GET /api/products?page=&limit=&categoryId=&isActive=&search=
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const parsed = listProductsQuerySchema.safeParse(
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

    const { items, meta } = await listProducts(parsed.data);
    return successResponse(items, meta);
  } catch (err) {
    return handleApiError(err, "GET /api/products");
  }
}

// POST /api/products  (admin only)
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "The request contains invalid fields.",
        400,
        zodDetails(parsed.error),
      );
    }

    const product = await createProduct(parsed.data);
    return successResponse(product);
  } catch (err) {
    return handleApiError(err, "POST /api/products");
  }
}
