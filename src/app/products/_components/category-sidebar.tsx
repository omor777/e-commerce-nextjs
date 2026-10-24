"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type CategorySidebarProps = {
  categories: Category[];
};

export function CategorySidebar({ categories }: CategorySidebarProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentCategory = searchParams.get("category");

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="sticky top-24 space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-4">Categories</h3>
          <ul className="space-y-1">
            {/* "All Products" Link */}
            <li>
              <Link
                href={pathname}
                className={cn(
                  "block px-3 py-2 rounded-md text-sm transition-colors",
                  !currentCategory
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                All Products
              </Link>
            </li>

            {/* Category Links */}
            {categories.map((category) => {
              const isActive = currentCategory === category.slug;
              return (
                <li key={category.id}>
                  <Link
                    href={`${pathname}?category=${category.slug}`}
                    className={cn(
                      "block px-3 py-2 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {category.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}
