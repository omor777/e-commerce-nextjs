import prisma from "@/lib/prisma";
import { badRequest, notFound } from "@/lib/api/error";
import { buildMeta, toPrismaPagination } from "@/lib/api/pagination";
import type {
  ListOrdersQuery,
  UpdateOrderStatusInput,
} from "@/schemas/order.schema";

const STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export async function listOrders(query: ListOrdersQuery) {
  const { skip, take } = toPrismaPagination(query);

  const where = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.paymentStatus ? { paymentStatus: query.paymentStatus } : {}),
    ...(query.email ? { email: query.email } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.order.count({ where }),
  ]);

  return { items, meta: buildMeta(query, total) };
}

export async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: { select: { id: true, email: true, name: true } },
    },
  });
  if (!order) throw notFound("Order not found.");
  return order;
}

export async function updateOrderStatus(
  id: string,
  input: UpdateOrderStatusInput,
) {
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      items: { select: { variantId: true, quantity: true } },
    },
  });
  if (!order) throw notFound("Order not found.");

  const isCancelling =
    input.status === "CANCELLED" && order.status !== "CANCELLED";

  if (input.status && input.status !== order.status) {
    const allowed = STATUS_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(input.status)) {
      throw badRequest(
        `Cannot change status from ${order.status} to ${input.status}.`,
        [
          {
            field: "status",
            issue: `Allowed transitions from ${order.status}: ${
              allowed.length ? allowed.join(", ") : "none"
            }.`,
          },
        ],
      );
    }
  }

  // Atomic transaction: update the status AND restore stock together.
  const updated = await prisma.$transaction(async (tx) => {
    // Restore stock for each variant when the order is being cancelled.
    // Skips items whose variant was later deleted (variantId is null).
    if (isCancelling) {
      for (const item of order.items) {
        if (!item.variantId) continue;
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    return tx.order.update({
      where: { id },
      data: {
        ...(input.status ? { status: input.status } : {}),
        ...(input.paymentStatus ? { paymentStatus: input.paymentStatus } : {}),
      },
      include: { items: true },
    });
  });

  return updated;
}
