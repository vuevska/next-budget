import {
  createErrorResponse,
  createSuccessResponse,
  requireAuth,
  verifySubCategoryOwnership,
} from "@/app/lib/auth";
import { createSubCategorySchema } from "@/app/lib/validationSchema";
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
    return createErrorResponse("Invalid subcategory ID", 400);
  }

  const ownsSubCategory = await verifySubCategoryOwnership(id, user.id);
  if (!ownsSubCategory) {
    return createErrorResponse("Subcategory not found", 404);
  }

  const body = await request.json();
  const validation = createSubCategorySchema.safeParse(body);
  if (!validation.success) {
    return createErrorResponse(JSON.stringify(validation.error.format()), 400);
  }

  const updatedSubCategory = await prisma.subCategory.update({
    where: { id },
    data: { name: body.name },
    include: { category: true },
  });

  return createSuccessResponse(updatedSubCategory, 200);
}
