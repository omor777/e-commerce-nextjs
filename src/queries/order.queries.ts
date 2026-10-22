import "server-only";
import prisma from "@/lib/prisma";
import { notFound } from "@/lib/api/error";

/**
 * Fetches the 50 most recent orders for the admin list.
 */
export async function getAdminOrders(limit = 50) {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    email: order.email,
    total: order.total.toString(),
    status: order.status,
    createdAt: order.createdAt.toISOString(),
  }));
}

/**
 * Fetches full order details for the admin drawer.
 */
export async function getAdminOrderDetails(id: string) {
console.log("Fetching order details for ID:", id); // Debugging log
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true, // Includes the snapshot fields (productName, variantSize, etc.)
    },
  });

  if (!order) throw notFound("Order not found.");

  // Serialize Decimals and Dates
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    email: order.email,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt.toISOString(),
    shippingFullName: order.shippingFullName,
    shippingPhone: order.shippingPhone,
    shippingLine1: order.shippingLine1,
    shippingLine2: order.shippingLine2,
    shippingCity: order.shippingCity,
    shippingState: order.shippingState,
    shippingPostalCode: order.shippingPostalCode,
    shippingCountry: order.shippingCountry,
    subtotal: order.subtotal.toString(),
    shipping: order.shipping.toString(),
    total: order.total.toString(),
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      variantSize: item.variantSize,
      variantColor: item.variantColor,
      sku: item.sku,
      unitPrice: item.unitPrice.toString(),
      quantity: item.quantity,
      lineTotal: item.lineTotal.toString(),
    })),
  };
}

export type AdminOrderDetails = Awaited<
  ReturnType<typeof getAdminOrderDetails>
>;
 