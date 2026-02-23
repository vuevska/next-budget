import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import {
  requireAuth,
  createErrorResponse,
  createSuccessResponse,
} from "@/app/lib/auth";
import { createAccountTypeSchema } from "@/app/lib/validationSchema";
import { getOrCreateCurrentPeriod, getFuturePeriodIds } from "@/app/lib/data/budget";

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

      // Find or create the "Starting Balance" payee for this user
      const startingBalancePayee = await tx.payee.upsert({
        where: {
          name_userId: {
            name: "Starting Balance",
            userId: user.id,
          },
        },
        update: {},
        create: {
          name: "Starting Balance",
          userId: user.id,
        },
      });

      await tx.transaction.create({
        data: {
          amount: body.amount,
          description: "Starting balance",
          payeeId: startingBalancePayee.id,
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

      const futurePeriodIds = await getFuturePeriodIds(period.month, period.year);

      if (existingToBudget) {
        await tx.toBudget.updateMany({
          where: {
            userId: user.id,
            periodId: { in: futurePeriodIds },
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
        
        // Update any existing future periods with the new balance
        const strictlyFuturePeriodIds = futurePeriodIds.filter((id) => id !== period.id);
        if (strictlyFuturePeriodIds.length > 0) {
          await tx.toBudget.updateMany({
            where: {
              userId: user.id,
              periodId: { in: strictlyFuturePeriodIds },
            },
            data: {
              amount: {
                increment: body.amount,
              },
            },
          });
        }
      }
    }

    return account;
  });

  return createSuccessResponse(newAccountType, 201);
}
