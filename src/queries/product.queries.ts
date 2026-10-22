import { notFound } from "@/lib/api/error";
import prisma from "@/lib/prisma";
import "server-only";

/**
 * Fetches all products for the admin dashboard table.
 */
export async function getAdminProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: {
        select: { name: true },
      },
      variants: {
        where: { isActive: true },
        select: { price: true },
        orderBy: { price: "asc" },
        take: 1,
      },
    },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    images: product.images,
    isActive: product.isActive,
    categoryName: product.category?.name || null,
    cheapestPrice: product.variants[0]?.price?.toString() || null,
  }));
}

/**
 * Fetches a single product by ID for the admin edit form.
 * Includes ALL variants (active and inactive).
 */
export async function getAdminProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!product) throw notFound("Product not found.");

  return {
    id: product.id,
    name: product.name,
    description: product.description || "",
    categoryId: product.categoryId || "",
    isActive: product.isActive,
    images: product.images || [],
    variants: product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      price: v.price.toString(),
      stock: v.stock,
      isActive: v.isActive,
    })),
  };
}

export type AdminProductFormValues = Awaited<
  ReturnType<typeof getAdminProductById>
>;
