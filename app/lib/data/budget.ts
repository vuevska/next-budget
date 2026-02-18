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