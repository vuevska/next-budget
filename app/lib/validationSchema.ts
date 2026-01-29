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