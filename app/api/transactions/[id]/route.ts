import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import {
  createErrorResponse,
  createSuccessResponse,
  requireAuth,
  verifyAccountTypeOwnership,
} from "@/app/lib/auth";

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

export async function DELETE({ params }: { params: { id: string } }) {
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
    where: { id: transaction.accountTypeId },
  });

  if (account?.userId !== user.id) {
    return createErrorResponse("Unauthorized access to account", 403);
  }

  await prisma.transaction.delete({
    where: { id: transactionId },
  });

  //TODO: change to current period
  const toBudget = await prisma.toBudget.findUnique({
    where: {
      periodId_userId: {
        periodId: 2,
        userId: user.id,
      },
    },
  });

  if (!toBudget) {
    return createErrorResponse("Unauthorized access to account", 403);
  }

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

  return createSuccessResponse(200);
}
