import { z } from "zod";

// slug removed — generated server-side, immutable after creation.
export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
  description: z.string().trim().max(500).optional(),
  image: z.string().url("Image must be a valid URL.").optional(),
  isActive: z.boolean().optional(),
});

// No slug here either. Name changes do NOT regenerate the slug.
export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
