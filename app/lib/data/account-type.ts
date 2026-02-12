import "server-only";
import prisma from "@/prisma/client";

export async function getAccountTypes(userId: string) {
  return await prisma.accountType.findMany({
    where: { userId },
  });
}
