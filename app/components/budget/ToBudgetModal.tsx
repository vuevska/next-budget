"use client";

import { useEffect } from "react";
import { Category, SubCategory } from "@prisma/client";
import { IoMdClose } from "react-icons/io";
import Portal from "../Portal";
import FormattedAmount from "../FormattedAmount";
import { budgetAmountInput } from "@/app/lib/validationSchema";
import { Label } from "@radix-ui/themes/components/context-menu";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ErrorMessage from "../ErrorMessage";
import { allocateBudget } from "@/app/lib/services/budget";
import { z } from "zod";

export type BudgetAmountInput = z.infer<typeof budgetAmountInput>;

type ToBudgetModalProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
  toBeBudgeted: number;
  categories: (Category & { SubCategory: SubCategory[] })[];
  onSuccess: (amount: number, updatedSubCategory?: any) => void;
}>;

export default function ToBudgetModal({
  isOpen,
  onClose,
  toBeBudgeted,
  categories,
  onSuccess,
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
      const result = await allocateBudget(data.amount, data.subCategoryId);
      onSuccess(data.amount, result.subCategory);
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5 flex items-center justify-between border-b border-indigo-200">
            <h2 className="text-xl font-bold text-white">Allocate Budget</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-indigo-500 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <IoMdClose size={24} className="text-white" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Available Amount Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-2">
                Available to Budget
              </p>
              <p className="text-3xl font-bold text-green-700">
                <FormattedAmount amount={toBeBudgeted} />
              </p>
            </div>

            {/* Amount Input */}
            <div>
              <Label className="block text-sm font-semibold text-slate-700 mb-2">
                Amount to Allocate
              </Label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.00"
                  {...register("amount", { valueAsNumber: true })}
                  min="0"
                  max={toBeBudgeted}
                  step="0.01"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
                  disabled={isSubmitting}
                />
              </div>
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

            {/* Category Selection */}
            <div>
              <Label className="block text-sm font-semibold text-slate-700 mb-2">
                Category
              </Label>
              <select
                {...register("categoryId", { valueAsNumber: true })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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

            {/* Subcategory Selection */}
            {categoryId && currentCategory && (
              <div>
                <Label className="block text-sm font-semibold text-slate-700 mb-2">
                  Sub-category
                </Label>
                {currentCategory.SubCategory.length === 0 ? (
                  <div className="px-4 py-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-600 text-sm">
                    No sub-categories in this category. Please create one first.
                  </div>
                ) : (
                  <select
                    {...register("subCategoryId", { valueAsNumber: true })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={isSubmitting}
                  >
                    <option value="">Select a subcategory</option>
                    {currentCategory.SubCategory.map((subCat) => (
                      <option key={subCat.id} value={subCat.id}>
                        {subCat.name}
                        {subCat.budgeted > 0 && (
                          <span className="text-slate-500">
                            {" "}
                            (Current:{" "}
                            <FormattedAmount amount={subCat.budgeted} />)
                          </span>
                        )}
                      </option>
                    ))}
                  </select>
                )}
                <ErrorMessage>{errors.subCategoryId?.message}</ErrorMessage>
              </div>
            )}

            {/* Error Message */}
            {errors.root && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {errors.root.message}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isValidAmount || !isValidSubCategory}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-slate-300 disabled:to-slate-400 text-white font-medium rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Allocating..." : "Allocate"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
