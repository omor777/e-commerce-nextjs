import { conflict, notFound } from "@/lib/api/error";
import { buildMeta, toPrismaPagination } from "@/lib/api/pagination";
import prisma from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/slug";
import type {
  CreateProductInput,
  CreateVariantInput,
  ListProductsQuery,
  UpdateProductInput,
  UpdateVariantInput,
} from "@/schemas/product.schema";

export async function listProducts(query: ListProductsQuery) {
  const { skip, take } = toPrismaPagination(query);

  const where = {
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    ...(query.search
      ? { name: { contains: query.search, mode: "insensitive" as const } }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
    prisma.product.count({ where }),
  ]);

  return { items, meta: buildMeta(query, total) };
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      variants: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!product) throw notFound("Product not found.");
  return product;
}

export async function createProduct(input: CreateProductInput) {
  const slug = await generateUniqueSlug(input.name, async (candidate) => {
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    return existing !== null;
  });

  // Validate categoryId exists if provided (Prisma would throw, but we
  // give a cleaner 404/400).
  if (input.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    });
    if (!category) throw notFound("Category not found.");
  }

  return prisma.product.create({
    data: { ...input, slug },
    include: { category: true, variants: true },
  });
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  const existing = await prisma.product.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!existing) throw notFound("Product not found.");

  // Regenerate slug if name changed (same rule as Category).
  const nameChanged =
    typeof input.name === "string" && input.name !== existing.name;

  const slug = nameChanged
    ? await generateUniqueSlug(input.name as string, async (candidate) => {
        const clash = await prisma.product.findUnique({
          where: { slug: candidate },
          select: { id: true },
        });
        return clash !== null && clash.id !== id;
      })
    : undefined;

  if (input.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    });
    if (!category) throw notFound("Category not found.");
  }

  return prisma.product.update({
    where: { id },
    data: { ...input, ...(slug ? { slug } : {}) },
    include: { category: true, variants: true },
  });
}

export async function deleteProduct(id: string) {
  const existing = await prisma.product.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) throw notFound("Product not found.");
  await prisma.product.delete({ where: { id } });
}

// ---------- Variants ----------

export async function createVariant(
  productId: string,
  input: CreateVariantInput,
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) throw notFound("Product not found.");

  // sku is globally unique (Prisma schema)
  const skuClash = await prisma.productVariant.findUnique({
    where: { sku: input.sku },
    select: { id: true },
  });
  if (skuClash) throw conflict("A variant with this SKU already exists.");

  // @@unique([productId, size, color]) — give a clean error instead of Prisma's
  const comboClash = await prisma.productVariant.findFirst({
    where: { productId, size: input.size, color: input.color },
    select: { id: true },
  });
  if (comboClash)
    throw conflict(
      "This product already has a variant with that size and color.",
    );

  return prisma.productVariant.create({
    data: { ...input, productId },
  });
}

export async function updateVariant(id: string, input: UpdateVariantInput) {
  const existing = await prisma.productVariant.findUnique({
    where: { id },
    select: { id: true, productId: true, size: true, color: true },
  });

  if (!existing) throw notFound("Variant not found.");

  if (input.sku) {
    const skuClash = await prisma.productVariant.findUnique({
      where: { sku: input.sku },
      select: { id: true },
    });
    if (skuClash && skuClash.id !== id)
      throw conflict("A variant with this SKU already exists.");
  }

  // If size or color changes, check the combo unique constraint.
  const nextSize = input.size ?? existing.size;
  const nextColor = input.color ?? existing.color;
  if (nextSize !== existing.size || nextColor !== existing.color) {
    const comboClash = await prisma.productVariant.findFirst({
      where: {
        productId: existing.productId,
        size: nextSize,
        color: nextColor,
        id: { not: id },
      },
      select: { id: true },
    });

    if (comboClash)
      throw conflict(
        "This product already has a variant with that size and color.",
      );
  }

  return prisma.productVariant.update({ where: { id }, data: input });
}

export async function deleteVariant(id: string) {
  const existing = await prisma.productVariant.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) throw notFound("Variant not found.");
  await prisma.productVariant.delete({ where: { id } });
}
