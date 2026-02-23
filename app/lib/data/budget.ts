import prisma from "@/prisma/client";

export async function getOrCreatePeriod(month: number, year: number) {
  const existing = await prisma.period.findUnique({
    where: {
      month_year: {
        month,
        year,
      },
    },
  });

  if (existing) return existing;

  return prisma.period.create({
    data: {
      month,
      year,
    },
  });
}

export async function getOrCreateCurrentPeriod() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  return getOrCreatePeriod(month, year);
}

export async function getToBeBudgeted(
  userId: string,
  month?: number,
  year?: number,
) {
  const period =
    month && year
      ? await getOrCreatePeriod(month, year)
      : await getOrCreateCurrentPeriod();

  return prisma.toBudget.findUnique({
    where: {
      periodId_userId: {
        periodId: period.id,
        userId,
      },
    },
  });
}

export async function getOrCreateToBudget(
  userId: string,
  period: { id: number; month: number; year: number }
) {
  const existing = await prisma.toBudget.findUnique({
    where: {
      periodId_userId: {
        periodId: period.id,
        userId,
      },
    },
  });

  if (existing) return existing;

  let carryOverAmount = 0;
  const prevMonth = period.month === 1 ? 12 : period.month - 1;
  const prevYear = period.month === 1 ? period.year - 1 : period.year;

  const prevPeriod = await prisma.period.findUnique({
    where: { month_year: { month: prevMonth, year: prevYear } },
  });

  if (prevPeriod) {
    const prevToBudget = await prisma.toBudget.findUnique({
      where: { periodId_userId: { periodId: prevPeriod.id, userId } },
    });
    if (prevToBudget && prevToBudget.amount > 0) {
      carryOverAmount = prevToBudget.amount;
    }
  }

  return prisma.toBudget.upsert({
    where: {
      periodId_userId: {
        periodId: period.id,
        userId,
      },
    },
    update: {},
    create: {
      periodId: period.id,
      userId,
      amount: carryOverAmount,
    },
  });
}

export async function getFuturePeriodIds(month: number, year: number) {
  const periods = await prisma.period.findMany({
    where: {
      OR: [
        { year: { gt: year } },
        { year: year, month: { gte: month } }
      ]
    },
    select: { id: true }
  });
  return periods.map(p => p.id);
}