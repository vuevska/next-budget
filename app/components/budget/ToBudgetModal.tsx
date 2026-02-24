"use client";

import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import Portal from "../Portal";
import FormattedAmount from "../FormattedAmount";
import { budgetAmountInput } from "@/app/lib/validationSchema";
import { Label } from "@radix-ui/themes/components/context-menu";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ErrorMessage from "../ErrorMessage";
import { allocateBudget } from "@/app/lib/services/budget";
import { z } from "zod";
import { CategoryBudgetView } from "../categories/CategoryList";
import { Button } from "@radix-ui/themes";

export type BudgetAmountInput = z.infer<typeof budgetAmountInput>;

type ToBudgetModalProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
  toBeBudgeted: number;
  categories: CategoryBudgetView[];
  onSuccess: (amount: number, updatedSubCategory?: any) => void;
  month: number;
  year: number;
}>;

export default function ToBudgetModal({
  isOpen,
  onClose,
  toBeBudgeted,
  categories,
  onSuccess,
  month,
  year,
}: ToBudgetModalProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<BudgetAmountInput>({
    resolver: zodResolver(budgetAmountInput),
    defaultValues: {
      amount: 0,
      categoryId: categories.length > 0 ? categories[0].id : undefined,
      subCategoryId: undefined,
    },
  });

  const categoryId = watch("categoryId");
  const currentCategory = categories.find((cat) => cat.id === categoryId);
  const amountValue = watch("amount") || 0;
  const remaining = toBeBudgeted - amountValue;
  const isValidAmount = amountValue > 0 && amountValue <= toBeBudgeted;
  const isValidSubCategory = watch("subCategoryId") !== undefined;

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: BudgetAmountInput) => {
    try {
      const result = await allocateBudget(
        data.amount,
        data.subCategoryId,
        month,
        year,
      );
      onSuccess(data.amount, result.subCategoryPeriod);
      onClose();
    } catch (err: any) {
      setError("root", {
        type: "manual",
        message: err?.message || "Unexpected error",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 border border-slate-200">
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-xl">
            <h2 className="text-xl font-bold text-slate-900">Allocate Budget</h2>
            <Button
              onClick={onClose}
              className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <FiX size={24} className="text-slate-600" />
            </Button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-2">
                Available to Budget
              </p>
              <p className="text-3xl font-bold text-green-700">
                <FormattedAmount amount={toBeBudgeted} />
              </p>
            </div>
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                Amount to Allocate
              </Label>
              <input
                type="number"
                placeholder="0.00"
                {...register("amount", { valueAsNumber: true })}
                min="0"
                max={toBeBudgeted}
                step="0.01"
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                disabled={isSubmitting}
              />
              <ErrorMessage>{errors.amount?.message}</ErrorMessage>
              {amountValue > 0 && (
                <div className="mt-2 text-sm text-slate-600">
                  <p>
                    Remaining after allocation:{" "}
                    <span
                      className={
                        remaining < 0
                          ? "font-semibold text-red-600"
                          : "font-semibold text-green-600"
                      }
                    >
                      <FormattedAmount amount={remaining} />
                    </span>
                  </p>
                </div>
              )}
            </div>
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </Label>
              <select
                {...register("categoryId", { valueAsNumber: true })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                disabled={isSubmitting}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ErrorMessage>{errors.categoryId?.message}</ErrorMessage>
            </div>
            {Boolean(categoryId && currentCategory) && (
              <div>
                <Label className="block text-sm font-medium text-slate-700 mb-2">
                  Sub-category
                </Label>
                {currentCategory?.SubCategory.length === 0 ? (
                  <div className="px-4 py-2.5 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-600 text-sm">
                    No sub-categories in this category. Please create one first.
                  </div>
                ) : (
                  <select
                    {...register("subCategoryId", { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    disabled={isSubmitting}
                  >
                    <option value="">Select a subcategory</option>
                    {currentCategory?.SubCategory.map((subCat) => (
                      <option key={subCat.id} value={subCat.id}>
                        {subCat.name}
                        {typeof (subCat as any).periodBudgeted === "number" &&
                          (subCat as any).periodBudgeted > 0 &&
                          ` (Current: ${(subCat as any).periodBudgeted})`}
                      </option>
                    ))}
                  </select>
                )}
                <ErrorMessage>{errors.subCategoryId?.message}</ErrorMessage>
              </div>
            )}
            {errors.root && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {errors.root.message}
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !isValidAmount || !isValidSubCategory}
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Allocating..." : "Allocate"}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
