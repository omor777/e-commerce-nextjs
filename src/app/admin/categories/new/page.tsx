import { CategoryForm } from "../_components/category-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewCategoryPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/categories"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="size-4 mr-1" /> Back to Categories
        </Link>
        <h1 className="text-2xl font-semibold">Add New Category</h1>
        <p className="text-muted-foreground text-sm">
          Create a new category for your products.
        </p>
      </div>

      <CategoryForm />
    </div>
  );
}
