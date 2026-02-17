import { NextRequest, NextResponse } from "next/server";
import {
  requireAuth,
  verifySubCategoryOwnership,
  createErrorResponse,
  createSuccessResponse,
} from "@/app/lib/auth";
import prisma from "@/prisma/client";

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult;

  const { amount, fromSubCategoryId, toSubCategoryId } = await req.json();

  if (
    typeof amount !== "number" ||
    typeof fromSubCategoryId !== "number" ||
    typeof toSubCategoryId !== "number"
  ) {
    return createErrorResponse("Invalid input");
  }

  if (fromSubCategoryId === toSubCategoryId) {
    return createErrorResponse("Cannot move to the same subcategory");
  }

  const [ownsFromSub, ownsToSub] = await Promise.all([
    verifySubCategoryOwnership(fromSubCategoryId, user.id),
    verifySubCategoryOwnership(toSubCategoryId, user.id),
  ]);

  if (!ownsFromSub || !ownsToSub) {
    return createErrorResponse("Unauthorized access to subcategory", 403);
  }

  const [fromSub, toSub] = await Promise.all([
    prisma.subCategory.findUnique({
      where: { id: fromSubCategoryId },
      include: {
        category: {
          select: { userId: true },
        },
      },
    }),
    prisma.subCategory.findUnique({
      where: { id: toSubCategoryId },
      include: {
        category: {
          select: { userId: true },
        },
      },
    }),
  ]);

  if (!fromSub || !toSub) {
    return createErrorResponse("Subcategory not found", 404);
  }

  if (
    fromSub.category.userId !== user.id ||
    toSub.category.userId !== user.id
  ) {
    return createErrorResponse("Unauthorized access to subcategory", 403);
  }

  if (amount > fromSub.budgeted) {
    return createErrorResponse("Amount exceeds available budgeted");
  }

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

  return createSuccessResponse(
    {
      fromSubCategory: updatedFrom,
      toSubCategory: updatedTo,
    },
    200,
  );
}
