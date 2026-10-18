import { ProductGrid } from "./_components/product-grid";

export const metadata = {
  title: "Products",
  description: "Browse our collection.",
};

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold">Products</h1>
        <p className="text-sm text-muted-foreground">Browse our collection.</p>
      </div>
      <ProductGrid />
    </div>
  );
}
