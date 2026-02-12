import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/lib/authOptions";
import prisma from "@/prisma/client";
import { createTransactionSchema } from "@/app/lib/validationSchema";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const validation = createTransactionSchema.safeParse(body);
  if (!validation.success)
    return NextResponse.json(validation.error.format(), { status: 400 });

  const {
    amount,
    description,
    payee,
    isInflow,
    subCatId,
    accountTypeId,
    date,
  } = body;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const account = await prisma.accountType.findUnique({
    where: { id: accountTypeId },
  });

  if (!account || account.userId !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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

  return NextResponse.json(transaction, { status: 201 });
}
