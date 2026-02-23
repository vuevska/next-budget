import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import {
  createErrorResponse,
  createSuccessResponse,
  requireAuth,
  verifyAccountTypeOwnership,
} from "@/app/lib/auth";
import { getOrCreatePeriod, getOrCreateToBudget, getFuturePeriodIds } from "@/app/lib/data/budget";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult;

  const resolvedParams = await params;
  const accountTypeId = Number.parseInt(resolvedParams.id);

  const ownsAccount = await verifyAccountTypeOwnership(accountTypeId, user.id);
  if (!ownsAccount) {
    return createErrorResponse("Unauthorized access to account", 403);
  }

  const transactions = await (prisma.transaction.findMany as any)({
    where: { accountTypeId: accountTypeId },
    include: {
      subCategory: { include: { category: true } },
      payee: true,
    },
    orderBy: { date: "desc" },
  });

  return createSuccessResponse(transactions, 200);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult;

  const resolvedParams = await params;
  const transactionId = Number.parseInt(resolvedParams.id);

  if (!transactionId) {
    return createErrorResponse("Invalid transaction ID", 400);
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { accountType: true },
  });

  if (!transaction) {
    return createErrorResponse("Transaction not found", 404);
  }

  if (transaction.accountType.userId !== user.id) {
    return createErrorResponse("Unauthorized access to account", 403);
  }

  const account = await prisma.accountType.findUnique({
    where: { id: transaction.accountTypeId, userId: user.id },
  });

  if (!account) {
    return createErrorResponse("Unauthorized access to account", 403);
  }

  await prisma.transaction.delete({
    where: { id: transactionId },
  });

  const period = await getOrCreatePeriod(
    transaction.date.getMonth() + 1,
    transaction.date.getFullYear(),
  );

  const toBudget = await getOrCreateToBudget(user.id, period);

  let updatedAmount;
  let updatedToBudgetAmount;
  if (transaction.isInflow) {
    updatedAmount = account.amount - transaction.amount;
    updatedToBudgetAmount = toBudget.amount - transaction.amount;
  } else {
    updatedAmount = account.amount + transaction.amount;
  }

  await prisma.accountType.update({
    where: { id: transaction.accountTypeId },
    data: { amount: updatedAmount },
  });

  if (transaction.isInflow) {
    const futurePeriodIds = await getFuturePeriodIds(period.month, period.year);
    await prisma.toBudget.updateMany({
      where: {
        userId: user.id,
        periodId: { in: futurePeriodIds },
      },
      data: { amount: { decrement: transaction.amount } },
    });
  }

  if (!transaction.isInflow && transaction.subCatId) {
    await (prisma as any).subCategoryPeriod.upsert({
      where: {
        periodId_subCategoryId: {
          periodId: period.id,
          subCategoryId: transaction.subCatId,
        },
      },
      update: {
        spent: { decrement: transaction.amount },
      },
      create: {
        periodId: period.id,
        subCategoryId: transaction.subCatId,
        budgeted: 0,
        spent: 0,
      },
    });
  }

  return createSuccessResponse(200);
}

import { createTransactionSchema } from "@/app/lib/validationSchema";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult;

  const resolvedParams = await params;
  const transactionId = Number.parseInt(resolvedParams.id);

  if (!transactionId) {
    return createErrorResponse("Invalid transaction ID", 400);
  }

  const body = await request.json();
  const validation = createTransactionSchema.safeParse(body);
  if (!validation.success) {
    return createErrorResponse(JSON.stringify(validation.error.format()), 400);
  }

  const {
    amount: newAmount,
    description,
    payeeId: newPayeeId,
    isInflow: newIsInflow,
    subCatId: newSubCatId,
    accountTypeId,
    date: newDate,
  } = body;

  const oldTransaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { accountType: true },
  });

  if (!oldTransaction) {
    return createErrorResponse("Transaction not found", 404);
  }

  if (oldTransaction.accountType.userId !== user.id) {
    return createErrorResponse("Unauthorized access to account", 403);
  }

  const account = await prisma.accountType.findUnique({
    where: { id: oldTransaction.accountTypeId, userId: user.id },
  });

  if (!account) {
    return createErrorResponse("Unauthorized access to account", 403);
  }

  // Verify the payee belongs to this user
  const payee = await prisma.payee.findUnique({
    where: { id: newPayeeId },
  });

  if (!payee || payee.userId !== user.id) {
    return createErrorResponse("Invalid payee", 400);
  }

  const oldPeriod = await getOrCreatePeriod(
    oldTransaction.date.getMonth() + 1,
    oldTransaction.date.getFullYear(),
  );
  await getOrCreateToBudget(user.id, oldPeriod);

  let updatedAccountAmount = account.amount;

  if (oldTransaction.isInflow) {
    updatedAccountAmount -= oldTransaction.amount;
    const futurePeriodIds = await getFuturePeriodIds(oldPeriod.month, oldPeriod.year);
    await prisma.toBudget.updateMany({
      where: { userId: user.id, periodId: { in: futurePeriodIds } },
      data: { amount: { decrement: oldTransaction.amount } },
    });
  } else {
    updatedAccountAmount += oldTransaction.amount;
    if (oldTransaction.subCatId) {
      await (prisma as any).subCategoryPeriod.upsert({
        where: {
          periodId_subCategoryId: {
            periodId: oldPeriod.id,
            subCategoryId: oldTransaction.subCatId,
          },
        },
        update: { spent: { decrement: oldTransaction.amount } },
        create: {
          periodId: oldPeriod.id,
          subCategoryId: oldTransaction.subCatId,
          budgeted: 0,
          spent: 0,
        },
      });
    }
  }

  const newTxDate = new Date(newDate);
  const updatedTransaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      amount: newAmount,
      description,
      payeeId: newPayeeId,
      isInflow: newIsInflow,
      subCatId: newSubCatId,
      date: newTxDate,
    },
    include: {
      subCategory: true,
      payee: true,
    },
  });

  const newPeriod = await getOrCreatePeriod(
    newTxDate.getMonth() + 1,
    newTxDate.getFullYear(),
  );
  await getOrCreateToBudget(user.id, newPeriod);

  if (newIsInflow) {
    updatedAccountAmount += newAmount;
    const futurePeriodIds = await getFuturePeriodIds(newPeriod.month, newPeriod.year);
    await prisma.toBudget.updateMany({
      where: { userId: user.id, periodId: { in: futurePeriodIds } },
      data: { amount: { increment: newAmount } },
    });
  } else {
    updatedAccountAmount -= newAmount;
    if (newSubCatId) {
      await (prisma as any).subCategoryPeriod.upsert({
        where: {
          periodId_subCategoryId: {
            periodId: newPeriod.id,
            subCategoryId: newSubCatId,
          },
        },
        update: { spent: { increment: newAmount } },
        create: {
          periodId: newPeriod.id,
          subCategoryId: newSubCatId,
          budgeted: 0,
          spent: newAmount,
        },
      });
    }
  }

  await prisma.accountType.update({
    where: { id: accountTypeId },
    data: { amount: updatedAccountAmount },
  });

  return createSuccessResponse(updatedTransaction, 200);
}
