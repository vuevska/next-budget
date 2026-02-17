import {
  createErrorResponse,
  createSuccessResponse,
  requireAuth,
} from "@/app/lib/auth";
import { editAccountTypeSchema } from "@/app/lib/validationSchema";
import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const body = await request.json();
  const validation = editAccountTypeSchema.safeParse(body);
  if (!validation.success)
    return NextResponse.json(validation.error.format(), { status: 400 });
  const { name } = body;

  const resolvedParams = await params;
  const id = Number.parseInt(resolvedParams.id);

  if (Number.isNaN(id)) {
    return createErrorResponse("Invalid account type ID", 400);
  }

  const accountType = await prisma.accountType.findUnique({
    where: { id },
  });
  if (!accountType) return createErrorResponse("Account type not found", 404);

  const updatedIssue = await prisma.accountType.update({
    where: { id: accountType.id },
    data: {
      name,
    },
  });

  return createSuccessResponse(updatedIssue, 201);
}
