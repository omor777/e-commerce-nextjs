import prisma from "@/lib/prisma";

/**
 * Fetches aggregate stats for the admin dashboard.
 */
export async function getDashboardStats() {
  const [totalRevenueResult, totalOrders, activeProducts, customers] =
    await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "CANCELLED" } },
      }),
      prisma.order.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count(),
    ]);

  return {
    revenue: totalRevenueResult._sum.total?.toString() || "0",
    orders: totalOrders,
    activeProducts,
    customers,
  };
}

/**
 * Fetches the 5 most recent orders for the overview.
 */
export async function getRecentOrders(limit = 5) {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      orderNumber: true,
      email: true,
      total: true,
      status: true,
    },
  });

  return orders.map((order) => ({
    ...order,
    total: order.total.toString(),
  }));
}
