import { notFound } from "@/lib/api/error";
import {
  buildMeta,
  toPrismaPagination,
  type Pagination,
} from "@/lib/api/pagination";
import prisma from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/slug";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/schemas/category.schema";

export async function listCategories(pagination: Pagination) {
  const { skip, take } = toPrismaPagination(pagination);
  const [items, total] = await Promise.all([
    prisma.category.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.count(),
  ]);
  return { items, meta: buildMeta(pagination, total) };
}

export async function getCategoryById(id: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw notFound("Category not found.");
  return category;
}

export async function createCategory(input: CreateCategoryInput) {
  // Slug generated once, from name, at creation time.
  const slug = await generateUniqueSlug(input.name, async (candidate) => {
    const existing = await prisma.category.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    return existing !== null;
  });

  return prisma.category.create({
    data: { ...input, slug },
  });
}

// ...listCategories, getCategoryById, createCategory unchanged...

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  const existing = await getCategoryById(id); // throws 404 if missing

  // Only regenerate the slug when the name actually changes.
  // If the client didn't send a name, or sent the same one, keep the slug.
  const nameChanged =
    typeof input.name === "string" && input.name !== existing.name;

  const slug = nameChanged
    ? await generateUniqueSlug(input.name as string, async (candidate) => {
        // Exclude the current category so renaming to a slug that
        // collides only with itself is allowed.
        const clash = await prisma.category.findUnique({
          where: { slug: candidate },
          select: { id: true },
        });
        return clash !== null && clash.id !== id;
      })
    : undefined;

  return prisma.category.update({
    where: { id },
    data: { ...input, ...(slug ? { slug } : {}) },
  });
}

export async function deleteCategory(id: string) {
  await getCategoryById(id);
  await prisma.category.delete({ where: { id } });
}
