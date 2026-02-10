import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { amount, fromSubCategoryId, toSubCategoryId } = await req.json();
  if (
    typeof amount !== "number" ||
    typeof fromSubCategoryId !== "number" ||
    typeof toSubCategoryId !== "number"
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  if (fromSubCategoryId === toSubCategoryId) {
    return NextResponse.json(
      { error: "Cannot move to the same subcategory" },
      { status: 400 },
    );
  }
  // Fetch both subcategories
  const [fromSub, toSub] = await Promise.all([
    prisma.subCategory.findUnique({ where: { id: fromSubCategoryId } }),
    prisma.subCategory.findUnique({ where: { id: toSubCategoryId } }),
  ]);
  if (!fromSub || !toSub) {
    return NextResponse.json(
      { error: "Subcategory not found" },
      { status: 404 },
    );
  }
  if (amount > fromSub.budgeted) {
    return NextResponse.json(
      { error: "Amount exceeds available budgeted" },
      { status: 400 },
    );
  }
  // Perform the move
  const [updatedFrom, updatedTo] = await prisma.$transaction([
    prisma.subCategory.update({
      where: { id: fromSubCategoryId },
      data: { budgeted: { decrement: amount } },
    }),
    prisma.subCategory.update({
      where: { id: toSubCategoryId },
      data: { budgeted: { increment: amount } },
    }),
  ]);
  return NextResponse.json({
    fromSubCategory: updatedFrom,
    toSubCategory: updatedTo,
  });
}
