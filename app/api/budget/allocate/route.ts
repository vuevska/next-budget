import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/lib/authOptions";
import prisma from "@/prisma/client";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { amount, subCategoryId } = body;

    if (!amount || !subCategoryId || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount or subcategory" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const subCategory = await prisma.subCategory.findUnique({
      where: { id: subCategoryId },
      include: { category: true },
    });

    if (!subCategory) {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: 404 },
      );
    }

    if (subCategory.category.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    //TODO: get the actual date
    const currentDate = new Date();
    const period = await prisma.period.findUnique({
      where: {
        month_year: {
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
        },
      },
    });

    if (!period) {
      return NextResponse.json({ error: "Period not found" }, { status: 404 });
    }

    const toBudget = await prisma.toBudget.findUnique({
      where: {
        periodId_userId: {
          periodId: period.id,
          userId: user.id,
        },
      },
    });

    if (!toBudget) {
      return NextResponse.json(
        { error: "To-budget record not found" },
        { status: 404 },
      );
    }

    if (amount > toBudget.amount) {
      return NextResponse.json(
        { error: "Insufficient budget to allocate" },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction([
      prisma.subCategory.update({
        where: { id: subCategoryId },
        data: {
          budgeted: {
            increment: amount,
          },
        },
      }),
      prisma.toBudget.update({
        where: {
          periodId_userId: {
            periodId: period.id,
            userId: user.id,
          },
        },
        data: {
          amount: {
            decrement: amount,
          },
        },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        subCategory: result[0],
        toBudget: result[1],
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Budget allocation error:", error);
    return NextResponse.json(
      { error: "Failed to allocate budget" },
      { status: 500 },
    );
  }
}
