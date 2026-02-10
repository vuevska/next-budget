"use client";
import { useState } from "react";
import { Category, SubCategory } from "@prisma/client";
import { IoMdClose } from "react-icons/io";
import Portal from "../Portal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ErrorMessage from "../ErrorMessage";
import FormattedAmount from "../FormattedAmount";
import { moveBudgetSchema } from "@/app/lib/validationSchema";
import { Label } from "@radix-ui/themes/components/context-menu";
import { Button } from "@radix-ui/themes";

export type MoveBudgetInput = z.infer<typeof moveBudgetSchema>;

export default function MoveBudgetModal({
  isOpen,
  onClose,
  categories,
  defaultFromSubCategoryId,
  onMove,
}: Readonly<{
  isOpen: boolean;
  onClose: () => void;
  categories: (Category & { SubCategory: SubCategory[] })[];
  defaultFromSubCategoryId: number;
  onMove: (
    amount: number,
    fromSubCategoryId: number,
    toSubCategoryId: number,
  ) => void;
}>) {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MoveBudgetInput>({
    resolver: zodResolver(moveBudgetSchema),
    defaultValues: {
      amount: 0,
      fromSubCategoryId: defaultFromSubCategoryId,
      toSubCategoryId: undefined,
    },
  });

  const fromSubCategoryId = watch("fromSubCategoryId");

  const allSubCategories = categories.flatMap((cat) => cat.SubCategory);
  const fromSubCategory = allSubCategories.find(
    (s) => s.id === fromSubCategoryId,
  );

  const maxAmount = fromSubCategory ? fromSubCategory.budgeted : 0;

  const onSubmit = (data: MoveBudgetInput) => {
    if (data.fromSubCategoryId === data.toSubCategoryId) {
      setError("Cannot move to the same subcategory.");
      return;
    }
    if (data.amount > maxAmount) {
      setError("Amount exceeds available budgeted in source subcategory.");
      return;
    }
    setError(null);
    onMove(data.amount, data.fromSubCategoryId, data.toSubCategoryId);
    onClose();
    reset();
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5 flex items-center justify-between border-b border-indigo-200">
            <h2 className="text-xl font-bold text-white">
              Move Budgeted Amount
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-indigo-500 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <IoMdClose size={24} className="text-white" />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div>
              <Label className="block text-sm font-semibold text-slate-700 mb-2">
                From Sub-category
              </Label>
              <select
                {...register("fromSubCategoryId", { valueAsNumber: true })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                defaultValue={defaultFromSubCategoryId}
                disabled={isSubmitting}
              >
                {allSubCategories.map((subCat) => (
                  <option key={subCat.id} value={subCat.id}>
                    {subCat.name} (Budgeted:{" "}
                    <FormattedAmount amount={subCat.budgeted} />)
                  </option>
                ))}
              </select>
              <ErrorMessage>{errors.fromSubCategoryId?.message}</ErrorMessage>
            </div>
            <div>
              <Label className="block text-sm font-semibold text-slate-700 mb-2">
                To Sub-category
              </Label>
              <select
                {...register("toSubCategoryId", { valueAsNumber: true })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="">Select a subcategory</option>
                {allSubCategories.map((subCat) => (
                  <option key={subCat.id} value={subCat.id}>
                    {subCat.name} (Budgeted:{" "}
                    <FormattedAmount amount={subCat.budgeted} />)
                  </option>
                ))}
              </select>
              <ErrorMessage>{errors.toSubCategoryId?.message}</ErrorMessage>
            </div>
            <div>
              <Label className="block text-sm font-semibold text-slate-700 mb-2">
                Amount
              </Label>
              <input
                type="number"
                {...register("amount", { valueAsNumber: true })}
                min={1}
                max={maxAmount}
                step="0.01"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
                disabled={isSubmitting}
              />
              <ErrorMessage>{errors.amount?.message}</ErrorMessage>
              {fromSubCategory && (
                <div className="mt-2 text-xs text-slate-600">
                  Max available:{" "}
                  <FormattedAmount amount={fromSubCategory.budgeted} />
                </div>
              )}
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </Button>
              <Button
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-slate-300 disabled:to-slate-400 text-white font-medium rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Moving..." : "Move"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
