"use client";

import React, { useState } from "react";
import { SubCategory } from "@prisma/client";
import { createSubCategory } from "@/app/lib/categories";
import { IoMdClose } from "react-icons/io";
import { createSubCategorySchema } from "@/app/lib/validationSchema";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/themes/components/context-menu";
import ErrorMessage from "../ErrorMessage";
import { Button } from "@radix-ui/themes";

type SubCategoryFormValues = z.infer<typeof createSubCategorySchema>;

type AddSubCategoryFormProps = Readonly<{
  categoryId: number;
  onAddSubCategory: (categoryId: number, subCategory: SubCategory) => void;
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
      onAddSubCategory(categoryId, result.subCategory);
    } catch (err: any) {
      setError("root", {
        type: "manual",
        message: err?.message || "Unexpected error",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <div className="grid gap-2">
        <div>
          <Label className="block text-xs font-semibold text-gray-700 mb-1">
            Sub-Category Name
          </Label>
          <ErrorMessage>{errors.name?.message}</ErrorMessage>
          <input
            type="text"
            {...register("name")}
            placeholder="e.g., Vegetables, Internet"
            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-xs"
            disabled={isSubmitting}
            autoFocus
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 px-2 py-1.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-150 font-medium text-xs"
          disabled={isSubmitting}
        >
          <IoMdClose size={12} />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition duration-150 font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Adding..." : "Add Subcategory"}
        </Button>
      </div>
    </form>
  );
}
