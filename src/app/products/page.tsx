import {
  getActiveCategories,
  getStorefrontProducts,
} from "@/queries/product.queries";
import { CategorySidebarShadcn } from "./_components/category-sidebar-shadcn";
import { ProductCard } from "./_components/product-card";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;

  const [categories, products] = await Promise.all([
    getActiveCategories(),
    // 🔄 CHANGED: Pass the search param to the query function
    getStorefrontProducts(category, search),
  ]);

  return (
    <SidebarProvider>
      <CategorySidebarShadcn categories={categories} />

      <SidebarInset>
        <div className="p-4 md:p-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="space-y-1">
              {/* 🔄 CHANGED: Dynamic heading based on search state */}
              <h1 className="text-2xl font-semibold">
                {search ? `Search results for "${search}"` : "Products"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {products.length}{" "}
                {products.length === 1 ? "product" : "products"} found.
              </p>
            </div>

            {/* Trigger for Mobile */}
            <SidebarTrigger className="md:hidden" />
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
                {/* 🔄 CHANGED: Better empty state message */}
                <p className="text-muted-foreground">
                  {search
                    ? `No products match "${search}". Try a different search term.`
                    : "No products found in this category."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      categoryName: product.categoryName ?? null,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
