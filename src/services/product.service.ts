import { conflict, notFound } from "@/lib/api/error";
import { buildMeta, toPrismaPagination } from "@/lib/api/pagination";
import prisma from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/slug";
import type {
  CreateProductInput,
  CreateProductOutput,
  ListProductsQuery,
  ProductSort,
  UpdateProductOutput,
} from "@/schemas/product.schema";

// ─── Reads (for API endpoints) ────────────────────────
export async function listProducts(query: ListProductsQuery) {
  const { skip, take } = toPrismaPagination(query);

  const priceFilter =
    query.minPrice !== undefined || query.maxPrice !== undefined
      ? {
          variants: {
            some: {
              isActive: true,
              ...(query.minPrice !== undefined
                ? { price: { gte: query.minPrice } }
                : {}),
              ...(query.maxPrice !== undefined
                ? { price: { lte: query.maxPrice } }
                : {}),
            },
          },
        }
      : {};

  const where = {
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    ...(query.search
      ? { name: { contains: query.search, mode: "insensitive" as const } }
      : {}),
    ...priceFilter,
  };

  const sort = query.sort;
  const isPriceSort = sort === "price_asc" || sort === "price_desc";

  const variantSelect = {
    where: { isActive: true },
    select: { id: true, price: true },
    orderBy: { price: "asc" as const },
    take: 1,
  };

  const enrich = (p: any) => ({
    ...p,
    cheapestVariant: p.variants[0] ?? null,
  });

  if (isPriceSort) {
    const all = await prisma.product.findMany({
      where,
      include: { category: true, variants: variantSelect },
    });

    const enriched = all.map(enrich);

    enriched.sort((a, b) => {
      if (!a.cheapestVariant) return 1;
      if (!b.cheapestVariant) return -1;
      const diff =
        Number(a.cheapestVariant.price) - Number(b.cheapestVariant.price);
      return sort === "price_asc" ? diff : -diff;
    });

    const total = enriched.length;
    const paged = enriched.slice(skip, skip + take);
    return { items: paged, meta: buildMeta(query, total) };
  }

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: getOrderBy(sort),
      include: { category: true, variants: variantSelect },
    }),
    prisma.product.count({ where }),
  ]);

  return { items: rows.map(enrich), meta: buildMeta(query, total) };
}

function getOrderBy(sort: ProductSort) {
  switch (sort) {
    case "oldest":
      return { createdAt: "asc" as const };
    case "price_asc":
    case "price_desc":
      return { createdAt: "desc" as const };
    case "name_asc":
      return { name: "asc" as const };
    case "name_desc":
      return { name: "desc" as const };
    case "newest":
    default:
      return { createdAt: "desc" as const };
  }
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: {
        where: { isActive: true },
        orderBy: { price: "asc" },
      },
    },
  });
  if (!product) throw notFound("Product not found.");
  return product;
}

export async function getProductVariants(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) throw notFound("Product not found.");

  const variants = await prisma.productVariant.findMany({
    where: { productId },
  });

  const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
  return variants.sort((a, b) => {
    const sizeA = SIZE_ORDER.indexOf(a.size.toUpperCase());
    const sizeB = SIZE_ORDER.indexOf(b.size.toUpperCase());
    const weightA = sizeA === -1 ? 999 : sizeA;
    const weightB = sizeB === -1 ? 999 : sizeB;
    if (weightA !== weightB) return weightA - weightB;
    return a.color.localeCompare(b.color);
  });
}

// ─── Mutations ────────────────────────────────────────
export async function createProduct(input: CreateProductOutput) {
  const { variants, ...productData } = input;

  const slug = await generateUniqueSlug(productData.name, async (candidate) => {
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    return existing !== null;
  });

  if (productData.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: productData.categoryId },
      select: { id: true },
    });
    if (!category) throw notFound("Category not found.");
  }

  if (variants && variants.length > 0) {
    const skus = variants.map((v) => v.sku);
    const existingSkus = await prisma.productVariant.findMany({
      where: { sku: { in: skus } },
      select: { sku: true },
    });
    if (existingSkus.length > 0) {
      throw conflict(
        `A variant with SKU "${existingSkus[0].sku}" already exists.`,
      );
    }

    const combos = new Set<string>();
    for (const v of variants) {
      const combo = `${v.size}-${v.color}`.toLowerCase();
      if (combos.has(combo)) {
        throw conflict(
          `You cannot add multiple variants with size "${v.size}" and color "${v.color}".`,
        );
      }
      combos.add(combo);
    }
  }

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        ...productData,
        slug,
      },
    });

    if (variants && variants.length > 0) {
      await tx.productVariant.createMany({
        data: variants.map((v) => ({
          ...v,
          productId: product.id,
        })),
      });
    }

    return tx.product.findUnique({
      where: { id: product.id },
      include: { category: true, variants: true },
    });
  });
}

export async function updateProduct(id: string, input: UpdateProductOutput) {
  const existing = await prisma.product.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!existing) throw notFound("Product not found.");

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

  if (input.variants && input.variants.length > 0) {
    const combos = new Set<string>();
    for (const v of input.variants) {
      const combo = `${v.size}-${v.color}`.toLowerCase();
      if (combos.has(combo)) {
        throw conflict(
          `You cannot add multiple variants with size "${v.size}" and color "${v.color}".`,
        );
      }
      combos.add(combo);
    }
  }

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.update({
      where: { id },
      data: {
        ...input,
        variants: undefined,
        ...(slug ? { slug } : {}),
      },
    });

    if (input.variants) {
      await tx.productVariant.deleteMany({ where: { productId: id } });

      if (input.variants.length > 0) {
        await tx.productVariant.createMany({
          data: input.variants.map((v) => ({
            ...v,
            productId: product.id,
          })),
        });
      }
    }

    return tx.product.findUnique({
      where: { id },
      include: { category: true, variants: true },
    });
  });
}

// export async function deleteProduct(id: string) {
//   const existing = await prisma.product.findUnique({
//     where: { id },
//     select: { id: true },
//   });
//   if (!existing) throw notFound("Product not found.");
//   await prisma.product.delete({ where: { id } });
// }

export async function findProductById(productId: string) {
  return await prisma.product.findUnique({
    where: { id: productId },
  });
}

export async function deleteProduct(id: string) {
  const existing = await findProductById(id);
  if (!existing) throw notFound("Product not found.");
  return await prisma.product.delete({ where: { id }, select: { id: true } });
}
