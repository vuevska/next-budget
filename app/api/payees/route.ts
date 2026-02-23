import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import {
  requireAuth,
  createErrorResponse,
  createSuccessResponse,
} from "@/app/lib/auth";
import { createPayeeSchema } from "@/app/lib/validationSchema";

export async function GET() {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult;

  const payees = await prisma.payee.findMany({
    where: { userId: user.id, isSystem: false },
    orderBy: { name: "asc" },
  });

  return createSuccessResponse(payees, 200);
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult;

  const body = await request.json();
  const validation = createPayeeSchema.safeParse(body);
  if (!validation.success) {
    return createErrorResponse(JSON.stringify(validation.error.format()), 400);
  }

  const existing = await prisma.payee.findUnique({
    where: {
      name_userId: {
        name: body.name,
        userId: user.id,
      },
    },
  });

  if (existing) {
    return createSuccessResponse(existing, 200);
  }

  const payee = await prisma.payee.create({
    data: {
      name: body.name,
      userId: user.id,
    },
  });

  return createSuccessResponse(payee, 201);
}
