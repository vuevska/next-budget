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

  const payee = await prisma.payee.findUnique({
    where: { id: payeeId },
  });

  if (!payee || payee.userId !== user.id) {
    return createErrorResponse("Invalid payee", 400);
  }

  const txDate = new Date(date);

  const isTransfer = payee.name.startsWith("Transfer to/from:");

  if (isTransfer) {
    const destAccountName = payee.name.replace("Transfer to/from: ", "").trim();

    const destAccount = await prisma.accountType.findFirst({
      where: { name: destAccountName, userId: user.id },
    });

    if (!destAccount) {
      return createErrorResponse("Destination account not found", 404);
    }

    const reversePayee = await prisma.payee.findUnique({
      where: {
        name_userId: {
          name: `Transfer to/from: ${account.name}`,
          userId: user.id,
        },
      },
    });

    if (!reversePayee) {
      return createErrorResponse("Transfer payee not found for source account", 500);
    }

    const result = await prisma.$transaction(async (tx) => {
      const sourceTx = await tx.transaction.create({
        data: {
          amount,
          description: description || "",
          payeeId: payee.id,
          isInflow: false,
          subCatId: null,
          accountTypeId: accountTypeId,
          date: txDate,
        },
      });

      const destTx = await tx.transaction.create({
        data: {
          amount,
          description: description || "",
          payeeId: reversePayee.id,
          isInflow: true,
          subCatId: null,
          accountTypeId: destAccount.id,
          date: txDate,
          linkedTransactionId: sourceTx.id,
        },
      });

      const updatedSourceTx = await tx.transaction.update({
        where: { id: sourceTx.id },
        data: { linkedTransactionId: destTx.id },
        include: {
          subCategory: true,
          payee: true,
        },
      });

      await tx.accountType.update({
        where: { id: accountTypeId },
        data: { amount: account.amount - amount },
      });

      await tx.accountType.update({
        where: { id: destAccount.id },
        data: { amount: destAccount.amount + amount },
      });

      return updatedSourceTx;
    });

    return createSuccessResponse(result, 201);
  }

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
      date: txDate,
    },
    include: {
      subCategory: true,
      payee: true,
    },
  });

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
