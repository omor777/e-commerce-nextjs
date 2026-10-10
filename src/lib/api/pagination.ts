import { z } from "zod";

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
});

export type Pagination = z.infer<typeof paginationSchema>;

// For Prisma: { skip, take }
export function toPrismaPagination({ page, limit }: Pagination) {
  return { skip: (page - 1) * limit, take: limit };
}

// Build the meta object for list responses.
export function buildMeta({ page, limit }: Pagination, total: number) {
  return { page, limit, total };
}
