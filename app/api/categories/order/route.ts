import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import authOptions from "@/app/lib/authOptions";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await req.json();
  const { categories } = body;

  if (!Array.isArray(categories)) {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 },
    );
  }

  const email = session.user.email;
  if (!email) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  const user = await prisma.user.findUnique({
    where: { email },
  });

  const userCategories = await prisma.category.findMany({
    where: {
      id: { in: categories.map((c: any) => c.id) },
      userId: user!.id,
    },
  });

  if (userCategories.length !== categories.length) {
    return NextResponse.json(
      { success: false, error: "Some categories not found" },
      { status: 404 },
    );
  }

  await prisma.$transaction(
    categories.map((cat: { id: number }, index: number) =>
      prisma.category.update({
        where: { id: cat.id },
        data: { order: index },
      }),
    ),
  );

  return NextResponse.json({ success: true });
}
