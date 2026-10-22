import type { NextRequest } from "next/server";
import { successResponse } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/auth";
import { getAdminProductById } from "@/queries/product.queries";
import { handleApiError } from "@/lib/api/error";

// GET /api/admin/products/:id
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/admin/products/[id]">,
) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const product = await getAdminProductById(id);
    return successResponse(product);
  } catch (err) {
    return handleApiError(err, "GET /api/admin/products/[id]");
  }
}
