import LayoutContent from "./LayoutContent";
import { getServerSession } from "next-auth";
import authOptions from "../lib/authOptions";
import prisma from "@/prisma/client";

export default async function AuthLayoutWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <>{children}</>;
  }

  const [categories, accounts] = await Promise.all([
    prisma.category.findMany({
      where: { user: session.user },
      include: { SubCategory: true },
      orderBy: { order: "asc" },
    }),
    prisma.accountType.findMany({
      where: { user: session.user },
    }),
  ]);

  return <LayoutContent accounts={accounts} categories={categories} />;
}
