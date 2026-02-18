import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import {
  createErrorResponse,
  createSuccessResponse,
  requireAuth,
  verifySubCategoryOwnership,
} from "@/app/lib/auth";
import { getOrCreatePeriod } from "@/app/lib/data/budget";

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const body = await req.json();
  const { amount, subCategoryId, month, year } = body;

  if (!amount || !subCategoryId || amount <= 0) {
    return createErrorResponse("Invalid amount or subcategory", 400);
  }

  const ownsSubCategpry = await verifySubCategoryOwnership(
    subCategoryId,
    user.id,
  );

  if (!ownsSubCategpry) {
    return createErrorResponse("Unauthorized access to subcategory", 403);
  }

  const currentDate = new Date();
  const period = await getOrCreatePeriod(
    currentDate.getMonth() + 1,
    currentDate.getFullYear(),
  );

  //TODO: allocate budget in other months that the current one
  //   const period = await getOrCreatePeriod(
  //   month ?? currentDate.getMonth() + 1,
  //   year ?? currentDate.getFullYear(),
  // );

  const toBudget = await prisma.toBudget.upsert({
    where: {
      periodId_userId: {
        periodId: period.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      periodId: period.id,
      userId: user.id,
      amount: 0,
    },
  });

  if (amount > toBudget.amount) {
    return createErrorResponse("Insufficient budget to allocate", 400);
  }

  const result = await prisma.$transaction([
    prisma.subCategoryPeriod.upsert({
      where: {
        periodId_subCategoryId: {
          periodId: period.id,
          subCategoryId,
        },
      },
      update: {
        budgeted: { increment: amount },
      },
      create: {
        periodId: period.id,
        subCategoryId,
        budgeted: amount,
        spent: 0,
      },
    }),
    prisma.toBudget.update({
      where: {
        periodId_userId: {
          periodId: period.id,
          userId: user.id,
        },
      },
      data: {
        amount: {
          decrement: amount,
        },
      },
    }),
  ]);

  return createSuccessResponse(
    {
      subCategoryPeriod: result[0],
      toBudget: result[1],
    },
    200,
  );
}
