import prisma from "@/lib/prisma";
import { notFound } from "@/lib/api/error";
import { buildMeta, toPrismaPagination } from "@/lib/api/pagination";
import type { ListMyOrdersQuery } from "@/schemas/order.schema";

export async function listMyOrders(userId: string, query: ListMyOrdersQuery) {
  const { skip, take } = toPrismaPagination(query);

  const where = { userId };

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

export async function getMyOrderById(userId: string, orderId: string) {
  // findFirst — id AND userId. A foreign order id returns null → 404.
  // This is deliberate: do not use findUnique here.
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });

  if (!order) throw notFound("Order not found.");
  return order;
}
