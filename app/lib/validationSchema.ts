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

export const createTransactionSchema = z.object({
  amount: z.number().gt(-1, "Amount must be a positive number."),
  payee: z.string().min(1, "Payee is required.").max(255),
  description: z.string().optional(),
  date: z.coerce.date({
    required_error: "Date is required",
    invalid_type_error: "Invalid date",
  }),
  subCatId: z.number(),
  isInflow: z.boolean(),
});
