import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import {
  requireAuth,
  createErrorResponse,
  createSuccessResponse,
} from "@/app/lib/auth";
import { createAccountTypeSchema } from "@/app/lib/validationSchema";
import { getOrCreateCurrentPeriod } from "@/app/lib/data/budget";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult;

  const body = await request.json();
  const validation = createAccountTypeSchema.safeParse(body);
  if (!validation.success) {
    return createErrorResponse(JSON.stringify(validation.error.format()), 400);
  }

  const newAccountType = await prisma.$transaction(async (tx) => {
    const account = await tx.accountType.create({
      data: {
        name: body.name,
        amount: body.amount,
        userId: user.id,
      },
    });
    if (body.amount > 0) {
      const period = await getOrCreateCurrentPeriod();

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
            periodId: period.id,
            userId: user.id,
          },
        },
      });

      if (existingToBudget) {
        await tx.toBudget.update({
          where: {
            periodId_userId: {
              periodId: period.id,
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
            periodId: period.id,
            userId: user.id,
            amount: body.amount,
          },
        });
      }
    }

    return account;
  });

  return createSuccessResponse(newAccountType, 201);
}
