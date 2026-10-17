import { conflict, notFound } from "@/lib/api/error";
import { buildMeta, toPrismaPagination } from "@/lib/api/pagination";
import prisma from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/slug";
import type {
  CreateProductInput,
  CreateVariantInput,
  ListProductsQuery,
  ProductSort,
  UpdateProductInput,
  UpdateVariantInput,
} from "@/schemas/product.schema";


/*
TODO: Read later this doc
The price-sort trade-off (important)
Why not let Prisma sort by price? Prisma can't orderBy a nested aggregate (_min: { variants: { price: ... } }) reliably for one-to-many relations. It can do it in newer versions via orderBy: { variants: { _min: { price: "asc" } } }, but that requires the relation to be included, and the query planner gets slower with large tables.

What I did instead: for price_asc / price_desc, fetch all matching products (with their cheapest active variant), sort in memory, then slice for pagination.

The cost: for a shop with thousands of products, this loads every matching row into memory on every request. Fine for MVP with hundreds of products. Not fine at scale.

When to revisit:

If you ever exceed ~5,000 products or notice slow responses on price sort, migrate to raw SQL:

SELECT p.*, MIN(v.price) AS min_price
FROM product p
LEFT JOIN product_variant v ON v.product_id = p.id AND v.is_active = true
WHERE ...
GROUP BY p.id
ORDER BY min_price ASC
LIMIT ... OFFSET ...;


via prisma.$queryRaw. Keep the same response shape.

For now, the in-memory approach is honest and simple. The comment in the code flags exactly when to replace it.

Alternative if you want to stay pure Prisma: add a denormalized minPrice Decimal column to Product, updated whenever a variant's price changes. That's the scalable answer, but it's more work and introduces a sync problem. Not worth it for MVP — the in-memory sort is fine until you prove otherwise.

*/

/*
TODO: sort testing
Sort

?sort=newest → newest first (default).

?sort=oldest → oldest first.

?sort=name_asc → A → Z.

?sort=name_desc → Z → A.

?sort=price_asc → ascending by cheapest active variant.

?sort=price_desc → descending by cheapest active variant.

?sort=bogus → 400 with details.

?sort=price_asc with a product that has no active variants → product placed last.

Price range

?minPrice=10 → only products with some active variant ≥ 10.

?maxPrice=50 → only products with some active variant ≤ 50.

?minPrice=10&maxPrice=50 → products whose cheapest active variant falls in [10, 50]. Wait — this is where the "cheapest variant" interpretation matters. Read the semantics note below.

?minPrice=50&maxPrice=10 → 400 with details[0].field === "minPrice".

Price filter + sort combined → both apply correctly.

Interaction with existing filters

?search=shirt&minPrice=20 → both filters applied.

?categoryId=X&sort=price_desc → both applied.

?isActive=false&sort=price_asc → both applied.

Pagination with price sort

?sort=price_asc&page=2&limit=5 → correct slice, correct meta.total.

Total count is correct even though sorting is in memory.
*/

export async function listProducts(query: ListProductsQuery) {
  const { skip, take } = toPrismaPagination(query);

  // ─── NEW ─────────────────────────────────────────
  // Price filters translate into a variant-level `some`
  // clause: products with AT LEAST ONE variant in range.
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
  // ─── END NEW ─────────────────────────────────────

  const where = {
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    ...(query.search
      ? { name: { contains: query.search, mode: "insensitive" as const } }
      : {}),
    // ─── NEW ───────────────────────────────────────
    ...priceFilter,
    // ─── END NEW ───────────────────────────────────
  };

  // ─── NEW ─────────────────────────────────────────
  // Sort by price needs a different strategy. Fetch
  // matching products with their cheapest variant, then
  // sort in memory. See note below.
  const sort = query.sort;
  const isPriceSort = sort === "price_asc" || sort === "price_desc";

  if (isPriceSort) {
    const all = await prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: {
          where: { isActive: true },
          select: { price: true },
          orderBy: { price: "asc" },
          take: 1,
        },
      },
    });

    const withPrice = all.map((p) => ({
      product: p,
      cheapest: p.variants[0]?.price,
    }));

    withPrice.sort((a, b) => {
      // Products with no active variant go last.
      if (a.cheapest === undefined) return 1;
      if (b.cheapest === undefined) return -1;
      const diff = Number(a.cheapest) - Number(b.cheapest);
      return sort === "price_asc" ? diff : -diff;
    });

    const total = withPrice.length;
    const paged = withPrice.slice(skip, skip + take).map((x) => x.product);
    return { items: paged, meta: buildMeta(query, total) };
  }
  // ─── END NEW ─────────────────────────────────────

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: getOrderBy(sort), // 🔄 CHANGED: was `{ createdAt: "desc" }`
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

// ─── NEW ─────────────────────────────────────────────
// Maps the API sort values to Prisma orderBy clauses.
// Centralizing the mapping keeps the schema (which
// controls what clients can send) and Prisma (which
// controls what gets executed) in sync.
function getOrderBy(sort: ProductSort) {
  switch (sort) {
    case "oldest":
      return { createdAt: "asc" as const };
    case "price_asc":
    case "price_desc":
      // Price lives on variants; Prisma can't order
      // products by a nested aggregate directly.
      // Handled post-query below.
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
// ─── END NEW ─────────────────────────────────────────
