import { NextRequest, NextResponse } from "next/server";
import {
  requireAuth,
  verifySubCategoryOwnership,
  createErrorResponse,
  createSuccessResponse,
} from "@/app/lib/auth";
import prisma from "@/prisma/client";
import { getOrCreatePeriod } from "@/app/lib/data/budget";

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult;

  const { amount, fromSubCategoryId, toSubCategoryId, month, year } =
    await req.json();

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

  const currentDate = new Date();

  const period = await getOrCreatePeriod(
    currentDate.getMonth() + 1,
    currentDate.getFullYear(),
  );
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

  const fromPeriodRow = await prisma.subCategoryPeriod.upsert({
    where: {
      periodId_subCategoryId: {
        periodId: period.id,
        subCategoryId: fromSubCategoryId,
      },
    },
    update: {},
    create: {
      periodId: period.id,
      subCategoryId: fromSubCategoryId,
      budgeted: 0,
      spent: 0,
    },
  });

  if (amount > fromPeriodRow.budgeted) {
    return createErrorResponse("Amount exceeds available budgeted");
  }

  const [updatedFrom, updatedTo] = await prisma.$transaction([
    prisma.subCategoryPeriod.update({
      where: {
        periodId_subCategoryId: {
          periodId: period.id,
          subCategoryId: fromSubCategoryId,
        },
      },
      data: { budgeted: { decrement: amount } },
    }),
    prisma.subCategoryPeriod.upsert({
      where: {
        periodId_subCategoryId: {
          periodId: period.id,
          subCategoryId: toSubCategoryId,
        },
      },
      update: { budgeted: { increment: amount } },
      create: {
        periodId: period.id,
        subCategoryId: toSubCategoryId,
        budgeted: amount,
        spent: 0,
      },
    }),
  ]);

  return createSuccessResponse(
    {
      fromSubCategoryPeriod: updatedFrom,
      toSubCategoryPeriod: updatedTo,
    },
    200,
  );
}
