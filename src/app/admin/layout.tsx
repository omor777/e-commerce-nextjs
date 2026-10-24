import { auth } from "@/lib/auth";
import { FolderTree, LayoutDashboard, Package, ShoppingCart } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🔄 Server-side auth check
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-muted/10">
      <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <span className="font-bold text-lg">Admin Panel</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted"
          >
            <LayoutDashboard className="size-4" /> Dashboard
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted"
          >
            <ShoppingCart className="size-4" /> Orders
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted"
          >
            <Package className="size-4" /> Products
          </Link>

          {/* 🔄 NEW: Categories Link */}
          <Link
            href="/admin/categories"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted"
          >
            <FolderTree className="size-4" /> Categories
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
