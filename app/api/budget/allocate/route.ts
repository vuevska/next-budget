import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import {
  createErrorResponse,
  createSuccessResponse,
  requireAuth,
  verifySubCategoryOwnership,
} from "@/app/lib/auth";
import { getOrCreatePeriod, getOrCreateToBudget, getFuturePeriodIds } from "@/app/lib/data/budget";

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

  const toBudget = await getOrCreateToBudget(user.id, period);

  if (amount > toBudget.amount) {
    return createErrorResponse("Insufficient budget to allocate", 400);
  }

  const futurePeriodIds = await getFuturePeriodIds(period.month, period.year);

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
    prisma.toBudget.updateMany({
      where: {
        userId: user.id,
        periodId: { in: futurePeriodIds },
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
