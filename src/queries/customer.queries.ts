import "server-only";
import prisma from "@/lib/prisma";

/**
 * Fetches all orders for a specific user, including a summary of items.
 */
export async function getUserOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        select: {
          id: true,
          productName: true,
          variantSize: true,
          variantColor: true,
          quantity: true,
          lineTotal: true,
        },
      },
    },
  });

  // Serialize Decimals and Dates for the Client Component
  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    total: order.total.toString(),
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      variantSize: item.variantSize,
      variantColor: item.variantColor,
      quantity: item.quantity,
      lineTotal: item.lineTotal.toString(),
    })),
  }));
}

export type CustomerOrder = Awaited<ReturnType<typeof getUserOrders>>[number];
