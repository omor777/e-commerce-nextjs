import { badRequest, notFound } from "@/lib/api/error";
import { cartInclude } from "@/lib/cart";
import prisma from "@/lib/prisma";
import type { AddCartItemInput } from "@/schemas/cart.schema";

export async function getCartById(cartId: string) {
  return prisma.cart.findUnique({
    where: { id: cartId },
    include: cartInclude,
  });
}

export async function addItemToCart(cartId: string, input: AddCartItemInput) {
  // Variant must exist and be active
  const variant = await prisma.productVariant.findUnique({
    where: { id: input.variantId },
    select: { id: true, stock: true, isActive: true },
  });
  if (!variant || !variant.isActive) {
    throw notFound("Variant not found or is not available.");
  }

  // Existing line → increment. New line → create.
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId, variantId: input.variantId } },
  });

  const nextQty = (existing?.quantity ?? 0) + input.quantity;

  // Stock guard — don't let a cart exceed available stock.
  if (nextQty > variant.stock) {
    throw badRequest(`Only ${variant.stock} in stock.`, [
      { field: "quantity", issue: `Maximum available is ${variant.stock}.` },
    ]);
  }

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: nextQty },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId, variantId: input.variantId, quantity: input.quantity },
    });
  }

  return getCartById(cartId);
}

export async function updateCartItemQuantity(
  cartId: string,
  itemId: string,
  quantity: number,
) {
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId },
    include: { variant: { select: { stock: true } } },
  });
  if (!item) throw notFound("Cart item not found.");

  if (quantity > item.variant.stock) {
    throw badRequest(`Only ${item.variant.stock} in stock.`, [
      {
        field: "quantity",
        issue: `Maximum available is ${item.variant.stock}.`,
      },
    ]);
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  return getCartById(cartId);
}

export async function removeCartItem(cartId: string, itemId: string) {
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId },
    select: { id: true },
  });
  if (!item) throw notFound("Cart item not found.");

  await prisma.cartItem.delete({ where: { id: itemId } });
  return getCartById(cartId);
}

export async function clearCart(cartId: string) {
  await prisma.cartItem.deleteMany({ where: { cartId } });
  return getCartById(cartId);
}
