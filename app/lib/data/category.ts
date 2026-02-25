import prisma from "@/prisma/client";

export async function getCategories(userId: string) {
  return prisma.category.findMany({
    where: { userId: userId },
    include: { SubCategory: true },
    orderBy: { order: "asc" },
  });
}

export async function createDefaultCategories(userId: string) {
  const defaults = [
    {
      name: "Housing",
      subCategories: ["Rent/Mortgage", "Utilities"],
    },
    {
      name: "Food",
      subCategories: ["Groceries", "Eating Out"],
    },
    {
      name: "Transportation",
      subCategories: ["Fuel", "Public Transport"],
    },
    {
      name: "Savings",
      subCategories: ["Emergency Fund", "Investments"],
    },
  ];

  return await prisma.$transaction(
    defaults.map((cat, index) =>
      prisma.category.create({
        data: {
          name: cat.name,
          userId: userId,
          order: index,
          SubCategory: {
            create: cat.subCategories.map((subName) => ({
              name: subName,
            })),
          },
        },
      }),
    ),
  );
}
