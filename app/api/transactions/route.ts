import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import {
  requireAuth,
  verifyAccountTypeOwnership,
  createErrorResponse,
  createSuccessResponse,
} from "@/app/lib/auth";
import { createTransactionSchema } from "@/app/lib/validationSchema";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult;

  const body = await request.json();
  const validation = createTransactionSchema.safeParse(body);
  if (!validation.success) {
    return createErrorResponse(JSON.stringify(validation.error.format()), 400);
  }

  const {
    amount,
    description,
    payee,
    isInflow,
    subCatId,
    accountTypeId,
    date,
  } = body;

  const ownsAccount = await verifyAccountTypeOwnership(accountTypeId, user.id);
  if (!ownsAccount) {
    return createErrorResponse("Unauthorized access to account", 403);
  }

  const account = await prisma.accountType.findUnique({
    where: { id: accountTypeId },
  });

  if (!account) {
    return createErrorResponse("Account not found", 404);
  }

  const transaction = await prisma.transaction.create({
    data: {
      amount,
      description,
      payee,
      isInflow,
      subCatId,
      accountTypeId,
      date: new Date(date),
    },
    include: {
      subCategory: true,
    },
  });

  // Update subcategory spent amount if it's an expense (not inflow) and has a subcategory
  if (!isInflow && subCatId) {
    await prisma.subCategory.update({
      where: { id: subCatId },
      data: {
        spent: {
          increment: amount,
        },
      },
    });
  }

  const existingToBudget = await prisma.toBudget.findUnique({
    where: {
      periodId_userId: {
        periodId: 2,
        userId: user.id,
      },
    },
  });

  let updatedAmount;
  let updatedToBudgetAmount;
  if (existingToBudget) {
    if (isInflow) {
      updatedAmount = account.amount + amount;
      updatedToBudgetAmount = existingToBudget.amount + amount;
    } else {
      updatedAmount = account.amount - amount;
    }
  } else {
    await prisma.toBudget.create({
      data: {
        periodId: 2,
        userId: user.id,
        amount: body.amount,
      },
    });
  }
  await prisma.accountType.update({
    where: { id: accountTypeId },
    data: { amount: updatedAmount },
  });

  //TODO CHANGE TO ACTUAL PERIOD
  await prisma.toBudget.update({
    where: {
      periodId_userId: {
        periodId: 2,
        userId: user.id,
      },
    },
    data: { amount: updatedToBudgetAmount },
  });

  return createSuccessResponse(transaction, 201);
}
