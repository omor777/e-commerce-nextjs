import { getCategoriesForDropdown } from "@/queries/category.queries";
import { getAdminProductById } from "@/queries/product.queries";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "../../_components/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    getAdminProductById(id).catch(() => null),
    getCategoriesForDropdown(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="size-4 mr-1" /> Back to Products
        </Link>
        <h1 className="text-2xl font-semibold">Edit Product</h1>
        <p className="text-muted-foreground text-sm">
          Update details and variants for {product.name}.
        </p>
      </div>

      <ProductForm
        categories={categories}
        initialData={product}
        isEditMode={true}
      />
    </div>
  );
}
