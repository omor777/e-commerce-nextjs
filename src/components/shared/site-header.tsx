"use client";

import { Button } from "@/components/ui/button";
import { cartQueryOptions } from "@/lib/api/cart";
import { signOut, useSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, User } from "lucide-react"; // 🔄 ADDED: User icon
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartDrawer } from "./cart-drawer";

export function SiteHeader() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();

  // Fetch cart to show badge count
  const { data: cartRes } = useQuery(cartQueryOptions());
  const cartItemCount =
    cartRes?.data?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Brand */}
        <Link href="/" className="text-lg font-semibold">
          Store
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link
            href="/products"
            className="text-muted-foreground hover:text-foreground"
          >
            Products
          </Link>
          <Link
            href="/cart"
            className="text-muted-foreground hover:text-foreground"
          >
            Cart
          </Link>
          {/* 🔄 REMOVED: The /checkout link from the main nav, as it's accessed via the cart */}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Cart Drawer & Badge */}
          <CartDrawer>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="size-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </CartDrawer>

          {/* Auth */}
          {isSessionLoading ? (
            <span className="text-sm text-muted-foreground">…</span>
          ) : session ? (
            <>
              {/* 🔄 CHANGED: Replaced the text name with a clean Account link */}
              <Button
                variant="ghost"
                size="sm"
                render={<Link href="/account/orders" />}
              >
                <User className="size-4 mr-2" />
                <span className="hidden sm:inline">Account</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" render={<Link href="/login" />}>
                Sign in
              </Button>
              <Button size="sm" render={<Link href="/register" />}>
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
