import "server-only";
import prisma from "@/lib/prisma";
import { notFound } from "@/lib/api/error";

export async function getCategoriesForDropdown() {
  return prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}



/**
 * Fetches all categories for the admin table.
 */
export async function getAdminCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    isActive: c.isActive,
    productCount: c._count.products,
  }));
}

/**
 * Fetches a single category by slug for the admin edit form.
 */
export async function getAdminCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) throw notFound("Category not found.");

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || "",
    image: category.image || "",
    isActive: category.isActive,
  };
}

export type CategoryFormValues = Awaited<ReturnType<typeof getAdminCategoryBySlug>>;
export type Category = Awaited<ReturnType<typeof getAdminCategories>>[number];