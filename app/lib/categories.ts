"use server";

import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import authOptions from "./authOptions";
import { Category, SubCategory } from "@prisma/client";

export async function getCategories(): Promise<
  (Category & { SubCategory: SubCategory[] })[]
> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return await prisma.category.findMany({
    where: { user: session.user },
    include: { SubCategory: true },
    orderBy: { order: "asc" },
  });
}

export async function createCategory(name: string): Promise<{
  success: boolean;
  category?: Category & { SubCategory: SubCategory[] };
  error?: string;
}> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const category = await prisma.category.create({
      data: {
        name,
        userId: session.user.id,
      },
      include: { SubCategory: true },
    });

    return { success: true, category };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function createSubCategory(
  categoryId: number,
  name: string,
  budgeted: number,
): Promise<{
  success: boolean;
  subCategory?: SubCategory;
  error?: string;
}> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.userId !== session.user.id) {
      return { success: false, error: "Category not found" };
    }

    const subCategory = await prisma.subCategory.create({
      data: {
        name,
        budgeted,
        catId: categoryId,
      },
    });

    return { success: true, subCategory };
  } catch (error) {
    console.error("Error creating subcategory:", error);
    return { success: false, error: "Failed to create subcategory" };
  }
}

export async function persistCategoryOrder(categories: { id: number }[]) {
  await prisma.$transaction(
    categories.map((cat, index) =>
      prisma.category.update({
        where: { id: cat.id },
        data: { order: index },
      }),
    ),
  );
}
