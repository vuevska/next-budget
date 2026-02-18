import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { createSubCategorySchema } from "@/app/lib/validationSchema";
import {
  createErrorResponse,
  createSuccessResponse,
  requireAuth,
} from "@/app/lib/auth";
import { getOrCreateCurrentPeriod } from "@/app/lib/data/budget";

export async function GET() {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const subCategories = await prisma.subCategory.findMany({
    where: {
      category: {
        userId: user.id,
      },
    },
  });
  return createSuccessResponse(subCategories, 200);
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const body = await req.json();
  const validation = createSubCategorySchema.safeParse(body);
  if (!validation.success)
    return createErrorResponse(JSON.stringify(validation.error.format()), 400);

  const category = await prisma.category.findUnique({
    where: { id: body.categoryId },
  });

  if (category?.userId !== user.id) {
    return createErrorResponse("Category not found", 404);
  }

  const period = await getOrCreateCurrentPeriod();

  const subCategory = await prisma.subCategory.create({
    data: {
      name: body.name,
      catId: body.categoryId,
    },
  });

  const subCategoryPeriod = await prisma.subCategoryPeriod.create({
    data: {
      periodId: period.id,
      subCategoryId: subCategory.id,
      budgeted: 0,
      spent: 0,
    },
  });

  return createSuccessResponse({ subCategory, subCategoryPeriod }, 201);
}
