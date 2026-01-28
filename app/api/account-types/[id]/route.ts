import authOptions from "@/app/lib/authOptions";
import { editAccountTypeSchema } from "@/app/lib/validationSchema";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({}, { status: 401 });

  const body = await request.json();
  const validation = editAccountTypeSchema.safeParse(body);
  if (!validation.success)
    return NextResponse.json(validation.error.format(), { status: 400 });
  const { name } = body;

  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "Invalid account type ID" },
      { status: 400 },
    );
  }

  const accountType = await prisma.accountType.findUnique({
    where: { id },
  });
  if (!accountType) {
    return NextResponse.json(
      { error: "Account type not found" },
      { status: 404 },
    );
  }

  if (!accountType)
    return NextResponse.json(
      { error: "Invalid account type" },
      { status: 404 },
    );

  const updatedIssue = await prisma.accountType.update({
    where: { id: accountType.id },
    data: {
      name,
    },
  });

  return NextResponse.json(updatedIssue);
}
