import { z } from "zod";

export const createAccountTypeSchema = z.object({
  name: z.string().min(1, "Name is required.").max(255),
  amount: z.number().gt(-1, "Amount must be a positive number."),
});

export const editAccountTypeSchema = z.object({
  name: z.string().min(1, "Name is required.").max(255),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required.").max(255),
});

export const createSubCategorySchema = z.object({
  name: z.string().min(1, "Name is required.").max(255),
});

export const createTransactionSchema = z
  .object({
    amount: z.number().gt(-1, "Amount must be a positive number."),
    payeeId: z.number({ required_error: "Payee is required." }).int(),
    description: z.string().optional(),
    date: z.coerce.date({
      required_error: "Date is required",
      invalid_type_error: "Invalid date",
    }),
    subCatId: z.number().nullable(),
    isInflow: z.boolean(),
    isTransfer: z.boolean().optional(),
  })
  .refine((data) => data.isTransfer || data.isInflow || data.subCatId !== null, {
    message: "Subcategory is required for outflows",
    path: ["subCatId"],
  });

export const budgetAmountInput = z.object({
  amount: z.number().gt(-1, "Amount must be a positive number."),
  categoryId: z.number().int("Category is required."),
  subCategoryId: z.number().int("Subcategory is required."),
});

export const moveBudgetSchema = z.object({
  amount: z.number().gt(0, "Amount must be greater than 0"),
  fromSubCategoryId: z.number(),
  toSubCategoryId: z.number(),
});

export const createPayeeSchema = z.object({
  name: z.string().min(1, "Name is required.").max(255),
});

export const registerSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  confirmPassword: z.string(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});