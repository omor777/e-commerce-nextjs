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

/**
 * Fetches all active categories for the sidebar navigation.
 */
export async function getActiveCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });
}

/**
 * Fetches products for the storefront, optionally filtered by category.
 * If a categorySlug is provided, it only returns products in that category.
 */
export async function getStorefrontProducts(
  categorySlug?: string,
  searchQuery?: string,
) {
  const where = {
    isActive: true,
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    // 🔄 NEW: Add search filter
    ...(searchQuery
      ? { name: { contains: searchQuery, mode: "insensitive" as const } }
      : {}),
  };

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
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
    categoryName: product.category?.name || null,
    cheapestPrice: product.variants[0]?.price?.toString() || null,
  }));
}

export type StorefrontProduct = Awaited<
  ReturnType<typeof getStorefrontProducts>
>[number];