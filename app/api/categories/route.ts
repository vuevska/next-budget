import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import authOptions from "@/app/lib/authOptions";
import { createCategorySchema } from "@/app/lib/validationSchema";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    include: { SubCategory: true },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(categories, { status: 200 });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({}, { status: 401 });
  }
  const body = await req.json();
  const validation = createCategorySchema.safeParse(body);

  if (!validation.success)
    return NextResponse.json(validation.error.format(), { status: 400 });

  if (!session.user?.email) return NextResponse.json({}, { status: 401 });

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

  if (!user) return NextResponse.json({}, { status: 401 });

  await prisma.category.updateMany({
    where: { userId: user.id },
    data: { order: { increment: 1 } },
  });

  const category = await prisma.category.create({
    data: {
      name: body.name,
      order: 0,
      user: {
        connect: { email: session.user.email },
      },
    },
    include: { SubCategory: true },
  });

  return NextResponse.json(category, { status: 201 });
}
