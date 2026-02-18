import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import {
  createErrorResponse,
  createSuccessResponse,
  requireAuth,
} from "@/app/lib/auth";
import { getOrCreatePeriod } from "@/app/lib/data/budget";

function parseIntParam(value: string | null) {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult;

  const { searchParams } = new URL(req.url);
  const month = parseIntParam(searchParams.get("month"));
  const year = parseIntParam(searchParams.get("year"));

  if (!month || month < 1 || month > 12 || !year || year < 1970) {
    return createErrorResponse("Invalid month/year", 400);
  }

  const period = await getOrCreatePeriod(month, year);

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

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    include: { SubCategory: true },
    orderBy: { order: "asc" },
  });

  const subCategoryIds = categories.flatMap((c) =>
    c.SubCategory.map((s) => s.id),
  );

  const currentPeriodRows = subCategoryIds.length
    ? await prisma.subCategoryPeriod.findMany({
        where: {
          periodId: period.id,
          subCategoryId: { in: subCategoryIds },
        },
        select: {
          subCategoryId: true,
          budgeted: true,
          spent: true,
        },
      })
    : [];

  const currentBySubId = new Map<number, { budgeted: number; spent: number }>();
  currentPeriodRows.forEach((row) => {
    currentBySubId.set(row.subCategoryId, {
      budgeted: row.budgeted,
      spent: row.spent,
    });
  });

  const previousRows = subCategoryIds.length
    ? await prisma.subCategoryPeriod.findMany({
        where: {
          subCategoryId: { in: subCategoryIds },
          period: {
            OR: [
              { year: { lt: year } },
              {
                year: year,
                month: { lt: month },
              },
            ],
          },
        },
        select: {
          subCategoryId: true,
          budgeted: true,
          spent: true,
        },
      })
    : [];

  const rolloverBySubId = new Map<number, number>();
  previousRows.forEach((row) => {
    const prev = rolloverBySubId.get(row.subCategoryId) ?? 0;
    rolloverBySubId.set(row.subCategoryId, prev + (row.budgeted - row.spent));
  });

  const decoratedCategories = categories.map((cat) => {
    return {
      ...cat,
      SubCategory: cat.SubCategory.map((sub) => {
        const current = currentBySubId.get(sub.id) ?? { budgeted: 0, spent: 0 };
        const rollover = rolloverBySubId.get(sub.id) ?? 0;
        const available = rollover + current.budgeted - current.spent;

        return {
          ...sub,
          periodBudgeted: current.budgeted,
          periodSpent: current.spent,
          rollover,
          available,
        };
      }),
    };
  });

  return createSuccessResponse(
    {
      period,
      toBudget,
      categories: decoratedCategories,
    },
    200,
  );
}
