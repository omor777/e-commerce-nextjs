import { getAdminCategoryBySlug } from "@/queries/category.queries";
import { CategoryForm } from "../../_components/category-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = await getAdminCategoryBySlug(slug).catch(() => null);

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/categories"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="size-4 mr-1" /> Back to Categories
        </Link>
        <h1 className="text-2xl font-semibold">Edit Category</h1>
        <p className="text-muted-foreground text-sm">
          Update details for {category.name}.
        </p>
      </div>

      <CategoryForm initialData={category} isEditMode />
    </div>
  );
}
