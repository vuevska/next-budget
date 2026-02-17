import { getServerSession } from "next-auth";
import authOptions from "@/app/lib/authOptions";
import prisma from "@/prisma/client";
import { NextResponse } from "next/server";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string | null;
}

/**
 * Validates the current session and returns the authenticated user as a plain object
 * @returns {Promise<AuthenticatedUser | null>} The authenticated user or null if not authenticated
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  if (!user?.email) {
    return null;
  }
  return user as AuthenticatedUser;
}

/**
 * Middleware to ensure user is authenticated and returns the user as a plain object
 * @returns {Promise<NextResponse | AuthenticatedUser>} Returns error response if not authenticated, user data if authenticated
 */
export async function requireAuth(): Promise<NextResponse | AuthenticatedUser> {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return user;
}

/**
 * Checks if a subcategory belongs to the current user
 * @param subCategoryId - The ID of the subcategory to check
 * @param userId - The ID of the user to verify ownership
 * @returns {Promise<boolean>} True if the subcategory belongs to the user, false otherwise
 */
export async function verifySubCategoryOwnership(
  subCategoryId: number,
  userId: string,
): Promise<boolean> {
  const subCategory = await prisma.subCategory.findUnique({
    where: { id: subCategoryId },
    include: {
      category: {
        select: {
          userId: true,
        },
      },
    },
  });

  return subCategory?.category?.userId === userId;
}

/**
 * Checks if an account type belongs to the current user
 * @param accountTypeId - The ID of the account type to check
 * @param userId - The ID of the user to verify ownership
 * @returns {Promise<boolean>} True if the account type belongs to the user, false otherwise
 */
export async function verifyAccountTypeOwnership(
  accountTypeId: number,
  userId: string,
): Promise<boolean> {
  const accountType = await prisma.accountType.findUnique({
    where: { id: accountTypeId },
    select: {
      userId: true,
    },
  });

  return accountType?.userId === userId;
}

/**
 * Checks if a category belongs to the current user
 * @param categoryId - The ID of the category to check
 * @param userId - The ID of the user to verify ownership
 * @returns {Promise<boolean>} True if the category belongs to the user, false otherwise
 */
export async function verifyCategoryOwnership(
  categoryId: number,
  userId: string,
): Promise<boolean> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: {
      userId: true,
    },
  });

  return category?.userId === userId;
}

/**
 * Standardized error response helper
 * @param message - Error message
 * @param status - HTTP status code
 * @returns {NextResponse} Formatted error response
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Standardized success response helper
 * @param data - Response data
 * @param status - HTTP status code
 * @returns {NextResponse} Formatted success response
 */
export function createSuccessResponse(
  data: any,
  status: number = 200,
): NextResponse {
  return NextResponse.json(data, { status });
}
