import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import {
  requireAuth,
  verifyAccountTypeOwnership,
  createErrorResponse,
  createSuccessResponse,
} from "@/app/lib/auth";
import { createTransactionSchema } from "@/app/lib/validationSchema";
import { getOrCreatePeriod, getOrCreateToBudget, getFuturePeriodIds } from "@/app/lib/data/budget";

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
    payeeId,
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

  // Verify the payee belongs to this user
  const payee = await prisma.payee.findUnique({
    where: { id: payeeId },
  });

  if (!payee || payee.userId !== user.id) {
    return createErrorResponse("Invalid payee", 400);
  }

  const txDate = new Date(date);
  const period = await getOrCreatePeriod(
    txDate.getMonth() + 1,
    txDate.getFullYear(),
  );

  const transaction = await prisma.transaction.create({
    data: {
      amount,
      description,
      payeeId,
      isInflow,
      subCatId,
      accountTypeId,
      date: new Date(date),
    },
    include: {
      subCategory: true,
      payee: true,
    },
  });

  // Update subcategory spent amount if it's an expense (not inflow) and has a subcategory
  if (!isInflow && subCatId) {
    await (prisma as any).subCategoryPeriod.upsert({
      where: {
        periodId_subCategoryId: {
          periodId: period.id,
          subCategoryId: subCatId,
        },
      },
      update: {
        spent: { increment: amount },
      },
      create: {
        periodId: period.id,
        subCategoryId: subCatId,
        spent: amount,
        budgeted: 0,
      },
    });
  }

  const existingToBudget = await getOrCreateToBudget(user.id, period);

  let updatedAmount;
  let updatedToBudgetAmount;
  if (isInflow) {
    updatedAmount = account.amount + amount;
    updatedToBudgetAmount = existingToBudget.amount + amount;
  } else {
    updatedAmount = account.amount - amount;
  }
  await prisma.accountType.update({
    where: { id: accountTypeId },
    data: { amount: updatedAmount },
  });

  if (isInflow) {
    const futurePeriodIds = await getFuturePeriodIds(period.month, period.year);
    await prisma.toBudget.updateMany({
      where: {
        userId: user.id,
        periodId: { in: futurePeriodIds },
      },
      data: { amount: { increment: amount } },
    });
  }

  return createSuccessResponse(transaction, 201);
}
