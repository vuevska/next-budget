import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import authOptions from "@/app/lib/authOptions";
import { createAccountTypeSchema } from "@/app/lib/validationSchema";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({}, { status: 401 });

  const body = await request.json();
  const validation = createAccountTypeSchema.safeParse(body);
  if (!validation.success)
    return NextResponse.json(validation.error.format(), { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return NextResponse.json({}, { status: 401 });

  const newAccountType = await prisma.$transaction(async (tx) => {
    const account = await tx.accountType.create({
      data: {
        name: body.name,
        amount: body.amount,
        userId: user.id,
      },
    });
    if (body.amount > 0) {
      await tx.transaction.create({
        data: {
          amount: body.amount,
          description: "Starting balance",
          payee: "Starting Balance",
          isInflow: true,
          accountTypeId: account.id,
          date: new Date(),
        },
      });

      const existingToBudget = await tx.toBudget.findUnique({
        where: {
          periodId_userId: {
            periodId: 2,
            userId: user.id,
          },
        },
      });

      if (existingToBudget) {
        await tx.toBudget.update({
          where: {
            periodId_userId: {
              periodId: 2,
              userId: user.id,
            },
          },
          data: {
            amount: {
              increment: body.amount,
            },
          },
        });
      } else {
        await tx.toBudget.create({
          data: {
            periodId: 2,
            userId: user.id,
            amount: body.amount,
          },
        });
      }
    }

    return account;
  });

  return NextResponse.json(newAccountType, { status: 201 });
}
