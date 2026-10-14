import prisma from "@/lib/prisma";
import { nanoid } from "nanoid";
import { cookies } from "next/headers";

const GUEST_COOKIE = "cart_guest_token";
const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Returns the cart for the current request.
 *
 * - Authenticated user  → cart keyed by userId.
 * - Guest               → cart keyed by the guest token cookie.
 *   If the guest has no cookie yet, one is created and set.
 *
 * Pass `create: false` for read-only endpoints that shouldn't
 * materialize an empty cart for a brand-new visitor.
 */
export async function resolveCart(userId: string | null, create = true) {
  // logged in user flow
  if (userId) {
    if (create) {
      return prisma.cart.upsert({
        where: { userId },
        update: {},
        create: { userId },
        include: cartInclude,
      });
    }
    return prisma.cart.findUnique({ where: { userId }, include: cartInclude });
  }

  // Guest flow
  const cookieStore = await cookies();
  let token = cookieStore.get(GUEST_COOKIE)?.value;

  if (!token) {
    if (!create) return null;
    token = nanoid(32);
    cookieStore.set(GUEST_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: GUEST_COOKIE_MAX_AGE,
    });
  }

  if (create) {
    return prisma.cart.upsert({
      where: { guestToken: token },
      update: {},
      create: { guestToken: token },
      include: cartInclude,
    });
  }
  return prisma.cart.findUnique({
    where: { guestToken: token },
    include: cartInclude,
  });
}

/** Standard include for cart responses. */
export const cartInclude = {
  items: {
    orderBy: { createdAt: "asc" as const },
    include: {
      variant: {
        include: { product: true },
      },
    },
  },
};
