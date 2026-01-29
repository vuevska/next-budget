import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import authOptions from "@/app/lib/authOptions";
import { createAccountTypeSchema } from "@/app/lib/validationSchema";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({}, { status: 401 });

  const body = await request.json();
  const validation = createAccountTypeSchema.safeParse(body);
  if (!validation.success)
    return NextResponse.json(validation.error.format(), { status: 400 });

  if (!session.user?.email) return NextResponse.json({}, { status: 401 });

  const newAccountType = await prisma.accountType.create({
    data: {
      name: body.name,
      amount: body.amount,
      user: {
        connect: { email: session.user.email },
      },
    },
  });

  return NextResponse.json(newAccountType, { status: 201 });
}
