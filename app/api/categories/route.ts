import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import {
  requireAuth,
  createErrorResponse,
  createSuccessResponse,
} from "@/app/lib/auth";
import { createCategorySchema } from "@/app/lib/validationSchema";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult;

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    include: { SubCategory: true },
    orderBy: { order: "asc" },
  });

  return createSuccessResponse(categories);
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult;

  const body = await req.json();
  const validation = createCategorySchema.safeParse(body);

  if (!validation.success) {
    return createErrorResponse(JSON.stringify(validation.error.format()), 400);
  }

  await prisma.category.updateMany({
    where: { userId: user.id },
    data: { order: { increment: 1 } },
  });

  const category = await prisma.category.create({
    data: {
      name: body.name,
      order: 0,
      user: {
        connect: { id: user.id },
      },
    },
    include: { SubCategory: true },
  });

  return createSuccessResponse(category, 201);
}
