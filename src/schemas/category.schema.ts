import { z } from "zod";

// slug removed — generated server-side, immutable after creation.
export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
  description: z.string().trim().max(500).optional(),
  image: z.url("Image must be a valid URL.").or(z.literal("")).optional(), // 🔄 Allowed empty string
  isActive: z.boolean().optional(),
});

// No slug here either. Name changes do NOT regenerate the slug.
export const updateCategorySchema = createCategorySchema.partial();

// 🔄 NEW: Define Input and Output types for React Hook Form
export type CreateCategoryInput = z.input<typeof createCategorySchema>;
export type CreateCategoryOutput = z.output<typeof createCategorySchema>;

export type UpdateCategoryInput = z.input<typeof updateCategorySchema>;
export type UpdateCategoryOutput = z.output<typeof updateCategorySchema>;
