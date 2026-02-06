import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/lib/authOptions";
import prisma from "@/prisma/client";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  //TODO CHANGE TO ACTUAL PERIOD
  const toBudget = await prisma.toBudget.findUnique({
    where: {
      periodId_userId: {
        periodId: 2,
        userId: user.id,
      },
    },
  });

  return NextResponse.json(toBudget.amount, { status: 200 });
}
