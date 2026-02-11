import prisma from "@/prisma/client";

export async function getToBeBudgeted(userId: string) {
 return await prisma.toBudget.findUnique({
   where: {
     periodId_userId: {
       periodId: 2,
       userId: userId,
     },
   },
 });
}