import "server-only";
import prisma from "@/lib/prisma";

export async function getCategoriesForDropdown() {
  return prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
