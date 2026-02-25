import { NextRequest } from "next/server";
import prisma from "@/prisma/client";
import { registerSchema } from "@/app/lib/validationSchema";
import { hashPassword } from "@/app/lib/password-utils";
import { createErrorResponse, createSuccessResponse } from "@/app/lib/auth";
import { createDefaultCategories } from "@/app/lib/data/category";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = registerSchema.safeParse(body);
  if (!validation.success) {
    return createErrorResponse(JSON.stringify(validation.error.format()), 400);
  }

  const { email, password } = validation.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: {
      accounts: true,
    },
  });

  if (existingUser) {
    const hasGoogleAccount = existingUser.accounts.some(
      (account) => account.provider === "google",
    );

    if (hasGoogleAccount) {
      return createErrorResponse(
        "An account with this email already exists. Please sign in with Google.",
        409,
      );
    }

    return createErrorResponse(
      "An account with this email already exists.",
      409,
    );
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  await createDefaultCategories(user.id);

  return createSuccessResponse(
    { message: "User created successfully", user },
    201,
  );
}
