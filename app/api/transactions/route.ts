import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/lib/authOptions";
import prisma from "@/prisma/client";
import { createTransactionSchema } from "@/app/lib/validationSchema";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accountTypeId = request.nextUrl.searchParams.get("accountTypeId");

  if (!accountTypeId) {
    return NextResponse.json(
      { error: "accountTypeId is required" },
      { status: 400 },
    );
  }

  const accountType = await prisma.accountType.findUnique({
    where: { id: Number.parseInt(accountTypeId) },
  });

  if (!accountType) {
    return NextResponse.json(
      { error: "Account type not found" },
      { status: 404 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || accountType.userId !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const transactions = await (prisma.transaction.findMany as any)({
    where: { accountTypeId: Number.parseInt(accountTypeId) },
    include: { subCategory: { include: { category: true } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(transactions, { status: 200 });
}

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

  const toBudget = await prisma.toBudget.findUnique({
    where: {
      periodId_userId: {
        periodId: 2,
        userId: user.id,
      },
    },
  });

  let updatedAmount;
  let updatedToBudgetAmount;
  if (isInflow) {
    updatedAmount = account.amount + amount;
    updatedToBudgetAmount = toBudget.amount + amount;
  } else {
    updatedAmount = account.amount - amount;
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
