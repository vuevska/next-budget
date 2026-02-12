import prisma from "@/prisma/client";

export async function getCategories(userId: string) {
  return prisma.category.findMany({
    where: { userId: userId },
    include: { SubCategory: true },
    orderBy: { order: "asc" },
  });
}
