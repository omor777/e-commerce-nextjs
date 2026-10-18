import prisma from "@/lib/prisma";


async function main() {
  // 1. Create a Category
  const category = await prisma.category.upsert({
    where: { slug: "mens-shirts" },
    update: {},
    create: { name: "Men's Shirts", slug: "mens-shirts" },
  });

  // 2. Classic Polo (Multi-color)
  const polo = await prisma.product.create({
    data: {
      name: "Classic Polo",
      slug: "classic-polo",
      description: "A comfortable cotton polo.",
      images: [
        "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80",
      ],
      categoryId: category.id,
      variants: {
        create: [
          {
            sku: "POLO-BLK-M",
            size: "M",
            color: "Black",
            price: 1250,
            stock: 10,
          },
          {
            sku: "POLO-BLK-L",
            size: "L",
            color: "Black",
            price: 1250,
            stock: 5,
          },
          {
            sku: "POLO-BLK-XL",
            size: "XL",
            color: "Black",
            price: 1250,
            stock: 0,
          }, // OOS
          {
            sku: "POLO-NVY-M",
            size: "M",
            color: "Navy",
            price: 1300,
            stock: 8,
          },
          {
            sku: "POLO-NVY-L",
            size: "L",
            color: "Navy",
            price: 1300,
            stock: 0,
          }, // OOS
        ],
      },
    },
  });

  // 3. Denim Jacket (Single color)
  const jacket = await prisma.product.create({
    data: {
      name: "Casual Denim Jacket",
      slug: "casual-denim-jacket",
      images: [
        "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80",
      ],
      variants: {
        create: [
          { sku: "JKT-BLU-S", size: "S", color: "Blue", price: 3500, stock: 3 },
          { sku: "JKT-BLU-M", size: "M", color: "Blue", price: 3500, stock: 4 },
          { sku: "JKT-BLU-L", size: "L", color: "Blue", price: 3500, stock: 6 },
        ],
      },
    },
  });

  // 4. Product with no variants
  await prisma.product.create({
    data: {
      name: "Summer Shorts",
      slug: "summer-shorts",
      images: [
        "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80",
      ],
    },
  });

  console.log("Seed data created!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
