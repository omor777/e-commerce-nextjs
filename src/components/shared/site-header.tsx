"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

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
        </nav>

        {/* Auth area */}
        <div className="flex items-center gap-3">
          {isPending ? (
            <span className="text-sm text-muted-foreground">…</span>
          ) : session ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {session.user.name ?? session.user.email}
              </span>
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
