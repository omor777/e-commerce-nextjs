import { requireAdmin } from "@/lib/api/auth";
import { handleApiError, zodDetails } from "@/lib/api/error";
import { errorResponse, successResponse } from "@/lib/api/response";
import { createVariantSchema } from "@/schemas/product.schema";
import { getProductVariants } from "@/services/product.service";
import type { NextRequest } from "next/server";

// POST /api/products/:id/variants  (admin only)
export async function POST(
  req: NextRequest,
  ctx: RouteContext<"/api/products/[id]/variants">,
) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;

    const body = await req.json();
    const parsed = createVariantSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "The request contains invalid fields.",
        400,
        zodDetails(parsed.error),
      );
    }

    // const variant = await createVariant(id, parsed.data);
    return successResponse("api/products/:id/variants");
  } catch (err) {
    return handleApiError(err, "POST /api/products/[id]/variants");
  }
}

// ─── NEW ───────────────────────────────────────────
// GET /api/products/:id/variants
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/products/[id]/variants">,
) {
  try {
    const { id } = await ctx.params;
    const variants = await getProductVariants(id);
    return successResponse(variants);
  } catch (err) {
    return handleApiError(err, "GET /api/products/[id]/variants");
  }
}
// ────
