import { getCategoriesForDropdown } from "@/queries/category.queries";
import { ProductForm } from "../_components/product-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewProductPage() {
  const categories = await getCategoriesForDropdown();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="size-4 mr-1" /> Back to Products
        </Link>
        <h1 className="text-2xl font-semibold">Add New Product</h1>
        <p className="text-muted-foreground text-sm">
          Create a new product and its variants.
        </p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
