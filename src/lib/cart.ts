import prisma from "@/lib/prisma";
import { nanoid } from "nanoid";
import { cookies, headers } from "next/headers";
import { auth } from "./auth";

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
/**
 * Returns the cart for the current request.
 * (full docstring unchanged)
 */
export async function resolveCart(create = true) {
  const userId = await getCurrentUserId();

  // 🔄 CHANGED: guest cookie is now read once, at the top,
  // so it's available in both the auth and guest branches.
  const cookieStore = await cookies();
  const guestToken = cookieStore.get(GUEST_COOKIE)?.value;

  if (userId) {
    const userCart = create
      ? await prisma.cart.upsert({
          where: { userId },
          update: {},
          create: { userId },
          include: cartInclude,
        })
      : await prisma.cart.findUnique({
          where: { userId },
          include: cartInclude,
        });

    // ─── NEW ────────────────────────────────────────
    // If a logged-in user still holds a guest cookie,
    // merge their guest cart into their user cart.
    // ────────────────────────────────────────────────
    if (guestToken) {
      const guestCart = await prisma.cart.findUnique({
        where: { guestToken },
        select: { id: true },
      });

      if (guestCart) {
        await mergeGuestCart(guestCart.id, userCart?.id as string);
        cookieStore.delete(GUEST_COOKIE);

        // Re-fetch so the response reflects merged items.
        return prisma.cart.findUnique({
          where: { userId },
          include: cartInclude,
        });
      }

      // Stale cookie — points to a cart that no longer exists.
      cookieStore.delete(GUEST_COOKIE);
    }
    // ─── END NEW ────────────────────────────────────

    return userCart;
  }

  // Guest flow — 🔄 CHANGED: reuses `guestToken` from above
  // instead of reading the cookie again.
  let token = guestToken;

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

async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

// ─── NEW ────────────────────────────────────────────
// Merges a guest cart into a user cart.
// - Items in both carts → quantities summed.
// - Items only in guest → moved to user cart.
// - Guest cart record deleted after merge.
// Runs in a transaction so a failure leaves both carts untouched.
// ────────────────────────────────────────────────────
async function mergeGuestCart(
  guestCartId: string,
  userCartId: string,
): Promise<void> {
  const guestItems = await prisma.cartItem.findMany({
    where: { cartId: guestCartId },
  });

  if (guestItems.length === 0) {
    await prisma.cart.delete({ where: { id: guestCartId } });
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const guestItem of guestItems) {
      const existing = await tx.cartItem.findUnique({
        where: {
          cartId_variantId: {
            cartId: userCartId,
            variantId: guestItem.variantId,
          },
        },
      });

      if (existing) {
        await tx.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + guestItem.quantity },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: userCartId,
            variantId: guestItem.variantId,
            quantity: guestItem.quantity,
          },
        });
      }
    }

    await tx.cart.delete({ where: { id: guestCartId } });
  });
}
// ─── END NEW ────────────────────────────────────────
