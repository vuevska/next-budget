import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import authOptions from "@/app/lib/authOptions";
import { createSubCategorySchema } from "@/app/lib/validationSchema";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({}, { status: 401 });
  }

  const body = await req.json();
  const validation = createSubCategorySchema.safeParse(body);
  if (!validation.success)
    return NextResponse.json(validation.error.format(), { status: 400 });

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

  const category = await prisma.category.findUnique({
    where: { id: body.categoryId },
  });

  if (!category || category.userId !== user!.id) {
    return NextResponse.json(
      { success: false, error: "Category not found" },
      { status: 404 },
    );
  }

  const subCategory = await prisma.subCategory.create({
    data: {
      name: body.name,
      catId: body.categoryId,
      budgeted: 0,
    },
  });

  return NextResponse.json({ success: true, subCategory });
}
