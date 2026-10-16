import type { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/auth";
import { listOrdersQuerySchema } from "@/schemas/order.schema";
import { listOrders } from "@/services/admin-order.service";
import { zodDetails, handleApiError } from "@/lib/api/error";

// TODO: i will improve this endpoint later. [next time always import prisma as default not name export. DEEPSEEK]

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const url = new URL(req.url);
    const parsed = listOrdersQuerySchema.safeParse(
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

    const { items, meta } = await listOrders(parsed.data);
    return successResponse(items, meta);
  } catch (err) {
    return handleApiError(err, "GET /api/admin/orders");
  }
}


/*
TODO:
Known gaps still open
Audit trail — no record of who changed order status. Add an OrderEvent table if you need it.

Email notifications — no customer email on cancellation.

Guest cart merge on login — still not built.
*/