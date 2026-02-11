import "server-only";
import { getServerSession } from "next-auth";
import authOptions from "../authOptions";
import prisma from "@/prisma/client";

export async function getUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return user;
}
