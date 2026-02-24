import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import {
  requireAuth,
  createErrorResponse,
  createSuccessResponse,
  verifyAccountTypeOwnership,
} from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult;

  const { searchParams } = new URL(request.url);
  const accountTypeIdParam = searchParams.get("accountTypeId");

  if (!accountTypeIdParam) {
    return createErrorResponse("accountTypeId is required", 400);
  }

  const accountTypeId = parseInt(accountTypeIdParam, 10);
  if (isNaN(accountTypeId)) {
    return createErrorResponse("Invalid accountTypeId", 400);
  }

  const ownsAccount = await verifyAccountTypeOwnership(accountTypeId, user.id);
  if (!ownsAccount) {
    return createErrorResponse("Unauthorized access to account", 403);
  }

  const currentAccount = await prisma.accountType.findUnique({
    where: { id: accountTypeId },
  });

  if (!currentAccount) {
    return createErrorResponse("Account not found", 404);
  }

  const excludePayeeName = `Transfer to/from: ${currentAccount.name}`;

  const transferPayees = await prisma.payee.findMany({
    where: {
      userId: user.id,
      isSystem: true,
      name: {
        startsWith: "Transfer to/from:",
        not: excludePayeeName,
      },
    },
    orderBy: { name: "asc" },
  });

  return createSuccessResponse(transferPayees, 200);
}
