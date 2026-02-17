import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import {
  createErrorResponse,
  createSuccessResponse,
  requireAuth,
} from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const body = await req.json();
  const { categories } = body;

  if (!Array.isArray(categories)) {
    return createErrorResponse("Invalid request", 400);
  }

  const userCategories = await prisma.category.findMany({
    where: {
      id: { in: categories.map((c: any) => c.id) },
      userId: user.id,
    },
  });

  if (userCategories.length !== categories.length) {
    return createErrorResponse("Some categories not found", 404);
  }

  await prisma.$transaction(
    categories.map((cat: { id: number }, index: number) =>
      prisma.category.update({
        where: { id: cat.id },
        data: { order: index },
      }),
    ),
  );

  return createSuccessResponse({ success: true });
}
