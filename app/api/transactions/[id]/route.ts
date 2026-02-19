import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import {
  createErrorResponse,
  createSuccessResponse,
  requireAuth,
  verifyAccountTypeOwnership,
} from "@/app/lib/auth";
import { getOrCreatePeriod } from "@/app/lib/data/budget";

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
    include: { subCategory: { include: { category: true } } },
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
    await prisma.toBudget.update({
      where: {
        periodId_userId: {
          periodId: period.id,
          userId: user.id,
        },
      },
      data: { amount: updatedToBudgetAmount },
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
