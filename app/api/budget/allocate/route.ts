import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import {
  createErrorResponse,
  createSuccessResponse,
  requireAuth,
  verifySubCategoryOwnership,
} from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const body = await req.json();
  const { amount, subCategoryId } = body;

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

  //TODO: get the actual date
  const currentDate = new Date();
  const period = await prisma.period.findUnique({
    where: {
      month_year: {
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
      },
    },
  });

  if (!period) {
    return createErrorResponse("Period not found", 404);
  }

  const toBudget = await prisma.toBudget.findUnique({
    where: {
      periodId_userId: {
        periodId: period.id,
        userId: user.id,
      },
    },
  });

  if (!toBudget) {
    return createErrorResponse("To-budget record not found", 404);
  }

  if (amount > toBudget.amount) {
    return createErrorResponse("Insufficient budget to allocate", 400);
  }

  const result = await prisma.$transaction([
    prisma.subCategory.update({
      where: { id: subCategoryId },
      data: {
        budgeted: {
          increment: amount,
        },
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
      subCategory: result[0],
      toBudget: result[1],
    },
    200,
  );
}
