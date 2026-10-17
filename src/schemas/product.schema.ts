import { z } from "zod";

// ─── Product create/update (unchanged) ───────────────
export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(150),
  description: z.string().trim().max(2000).optional(),
  images: z.array(z.url("Image must be a valid URL.")).max(10).optional(),
  categoryId: z.string().trim().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// ─── NEW ─────────────────────────────────────────────
// Allowed sort values. Keep this small and explicit —
// arbitrary sort strings invite SQL injection paths
// and make the frontend/backend contract fuzzy.
export const PRODUCT_SORTS = [
  "newest",
  "oldest",
  "price_asc",
  "price_desc",
  "name_asc",
  "name_desc",
] as const;

export type ProductSort = (typeof PRODUCT_SORTS)[number];
// ─── END NEW ─────────────────────────────────────────

// 🔄 CHANGED: added sort, minPrice, maxPrice
export const listProductsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    categoryId: z.string().trim().min(1).optional(),
    isActive: z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .optional(),
    search: z.string().trim().min(1).max(150).optional(),

    // ─── NEW ───────────────────────────────────────
    sort: z.enum(PRODUCT_SORTS).default("newest"),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    // ─── END NEW ───────────────────────────────────
  })
  // ─── NEW ─────────────────────────────────────────
  // Reject minPrice > maxPrice early, with a field-
  // level error message the UI can show directly.
  .refine(
    (v) =>
      v.minPrice === undefined ||
      v.maxPrice === undefined ||
      v.minPrice <= v.maxPrice,
    {
      message: "minPrice must be less than or equal to maxPrice.",
      path: ["minPrice"],
    },
  );
// ─── END NEW ─────────────────────────────────────

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;

// ─── Variant schemas (unchanged) ─────────────────────
export const createVariantSchema = z.object({
  sku: z.string().trim().min(1, "SKU is required.").max(100),
  size: z.string().trim().min(1, "Size is required.").max(50),
  color: z.string().trim().min(1, "Color is required.").max(50),
  price: z.coerce.number().positive("Price must be greater than 0."),
  stock: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().optional(),
});

export const updateVariantSchema = createVariantSchema.partial();

export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
