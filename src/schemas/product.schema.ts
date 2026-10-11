import { z } from "zod";

// ---------- Product ----------

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(150),
  description: z.string().trim().max(2000).optional(),
  images: z
    .array(z.url("Image must be a valid URL."))
    .max(10)
    .optional(),
  categoryId: z.string().trim().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();

// Query for GET /api/products
export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  categoryId: z.string().trim().min(1).optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  search: z.string().trim().min(1).max(150).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;

// ---------- ProductVariant ----------

export const createVariantSchema = z.object({
  sku: z.string().trim().min(1, "SKU is required.").max(100),
  size: z.string().trim().min(1, "Size is required.").max(50),
  color: z.string().trim().min(1, "Color is required.").max(50),
  // Money as string to avoid float issues. Coerced to number then stringified for Prisma.
  price: z.coerce.number().positive("Price must be greater than 0."),
  stock: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateVariantSchema = createVariantSchema.partial();

export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
