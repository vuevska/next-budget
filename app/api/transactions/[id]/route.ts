import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/lib/authOptions";
import prisma from "@/prisma/client";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const transactionId = parseInt(resolvedParams.id);

  if (!transactionId) {
    return NextResponse.json(
      { error: "Invalid transaction ID" },
      { status: 400 },
    );
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { accountType: true },
  });

  if (!transaction) {
    return NextResponse.json(
      { error: "Transaction not found" },
      { status: 404 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || transaction.accountType.userId !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const account = await prisma.accountType.findUnique({
    where: { id: transaction.accountTypeId },
  });

  if (!account || account.userId !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await prisma.transaction.delete({
    where: { id: transactionId },
  });

  let updatedAmount;
  if (transaction.isInflow) {
    updatedAmount = account.amount - transaction.amount;
  } else {
    updatedAmount = account.amount + transaction.amount;
  }

  await prisma.accountType.update({
    where: { id: transaction.accountTypeId },
    data: { amount: updatedAmount },
  });

  return NextResponse.json({ success: true });
}
