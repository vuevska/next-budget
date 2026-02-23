import {
  createErrorResponse,
  createSuccessResponse,
  requireAuth,
  verifyCategoryOwnership,
} from "@/app/lib/auth";
import { createCategorySchema } from "@/app/lib/validationSchema";
import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult;

  const resolvedParams = await params;
  const id = Number.parseInt(resolvedParams.id);

  if (Number.isNaN(id)) {
    return createErrorResponse("Invalid category ID", 400);
  }

  const ownsCategory = await verifyCategoryOwnership(id, user.id);
  if (!ownsCategory) {
    return createErrorResponse("Category not found", 404);
  }

  const body = await request.json();
  const validation = createCategorySchema.safeParse(body);
  if (!validation.success) {
    return createErrorResponse(JSON.stringify(validation.error.format()), 400);
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: { name: body.name },
    include: { SubCategory: true },
  });

  return createSuccessResponse(updatedCategory, 200);
}
