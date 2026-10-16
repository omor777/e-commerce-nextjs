import  prisma  from "@/lib/prisma";
import { badRequest, notFound } from "@/lib/api/error";
import { cartInclude } from "@/lib/cart";
import { nanoid } from "nanoid";
import type { CheckoutInput } from "@/schemas/checkout.schema";
import dayjs from "@/lib/dayjs";
import { SHIPPING_COST } from "@/lib/config";


function generateOrderNumber() {
  const date = dayjs().format("YYYYMMDD");
  const suffix = nanoid(6).toUpperCase();
  return `ORD-${date}-${suffix}`;
}

export async function checkout(cartId: string, input: CheckoutInput) {
  // Resolve the cart with items + variant + product BEFORE the transaction.
  // This gives us a clean read for validation and error messages.
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: cartInclude,
  });

  if (!cart || cart.items.length === 0) {
    throw notFound("Cart is empty or does not exist.");
  }

  // Pre-validate stock outside the transaction for a clean error message.
  // The transaction will re-check atomically.
  for (const item of cart.items) {
    if (item.quantity > item.variant.stock) {
      throw badRequest(
        `Insufficient stock for "${item.variant.product.name}" (${item.variant.size}/${item.variant.color}).`,
        [{ field: "cart", issue: `Only ${item.variant.stock} available.` }],
      );
    }
    if (!item.variant.isActive) {
      throw badRequest(
        `"${item.variant.product.name}" (${item.variant.size}/${item.variant.color}) is no longer available.`,
      );
    }
  }

  // Compute totals from the snapshot we already read.
  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.variant.price) * item.quantity,
    0,
  );
  const total = subtotal + SHIPPING_COST;

  // Atomic transaction — everything or nothing [citation:9].
  const order = await prisma.$transaction(async (tx) => {
    // Re-check stock inside the transaction to prevent race conditions.
    for (const item of cart.items) {
      const current = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        select: { stock: true, isActive: true },
      });

      if (!current || !current.isActive) {
        throw badRequest(
          `"${item.variant.product.name}" (${item.variant.size}/${item.variant.color}) is no longer available.`,
        );
      }
      if (current.stock < item.quantity) {
        throw badRequest(
          `Insufficient stock for "${item.variant.product.name}" (${item.variant.size}/${item.variant.color}).`,
          [{ field: "cart", issue: `Only ${current.stock} available.` }],
        );
      }

      // Decrement stock atomically.
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Create the order with snapshot fields.
    const created = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: cart.userId, // null for guest
        email: input.email,
        status: "PENDING",
        paymentStatus: "PENDING",

        shippingFullName: input.fullName,
        shippingPhone: input.phone,
        shippingLine1: input.line1,
        shippingLine2: input.line2,
        shippingCity: input.city,
        shippingState: input.state,
        shippingPostalCode: input.postalCode,
        shippingCountry: input.country,

        subtotal,
        shipping: SHIPPING_COST,
        total,

        items: {
          create: cart.items.map((item) => ({
            variantId: item.variantId,
            productName: item.variant.product.name,
            variantSize: item.variant.size,
            variantColor: item.variant.color,
            sku: item.variant.sku,
            unitPrice: item.variant.price,
            quantity: item.quantity,
            lineTotal: Number(item.variant.price) * item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    // Clear the cart items.
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return created;
  });

  return order;
}
