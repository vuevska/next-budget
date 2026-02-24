"use client";

import { SubCategory, SubCategoryPeriod } from "@prisma/client";
import { createSubCategorySchema } from "@/app/lib/validationSchema";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSubCategory } from "@/app/lib/services/sub-category";
import { FiCheck, FiX } from "react-icons/fi";
import { Button } from "@radix-ui/themes";
import ErrorMessage from "../ErrorMessage";

type SubCategoryFormValues = z.infer<typeof createSubCategorySchema>;

type AddSubCategoryFormProps = Readonly<{
  categoryId: number;
  onAddSubCategory: (categoryId: number, subCategory: SubCategory, subCategoryPeriod: SubCategoryPeriod) => void;
  onCancel: () => void;
}>;

export default function AddSubCategoryForm({
  categoryId,
  onAddSubCategory,
  onCancel,
}: AddSubCategoryFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SubCategoryFormValues>({
    resolver: zodResolver(createSubCategorySchema),
  });

  const onSubmit = async (data: SubCategoryFormValues) => {
    try {
      const result = await createSubCategory(categoryId, data.name);
      onAddSubCategory(categoryId, result.subCategory, result.subCategoryPeriod);
    } catch (err: any) {
      setError("root", {
        type: "manual",
        message: err?.message || "Unexpected error",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex items-center gap-2"
    >
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0" />
      <input
        type="text"
        {...register("name")}
        placeholder="New subcategory name…"
        className="flex-1 min-w-0 px-2.5 py-1 text-sm font-medium text-slate-900 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-all placeholder:text-slate-400"
        disabled={isSubmitting}
        autoFocus
      />
      <Button
        type="submit"
        disabled={isSubmitting}
        className="p-1.5 rounded-md text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Add subcategory"
        title="Add"
      >
        <FiCheck size={15} />
      </Button>
      <Button
        onClick={onCancel}
        className="p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
        disabled={isSubmitting}
        aria-label="Cancel"
        title="Cancel"
      >
        <FiX size={15} />
      </Button>
      <ErrorMessage>{errors.name?.message}</ErrorMessage>
    </form>
  );
}
