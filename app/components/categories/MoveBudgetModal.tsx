"use client";
import { useState } from "react";
import { FiX } from "react-icons/fi";
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
  categories: any[];
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
  const maxAmount = fromSubCategory ? (fromSubCategory.periodBudgeted ?? 0) : 0;

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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 border border-slate-200">
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-xl">
            <h2 className="text-xl font-bold text-slate-900">
              Move Budgeted Amount
            </h2>
            <Button
              onClick={onClose}
              className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <FiX size={24} className="text-slate-600" />
            </Button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                From
              </Label>
              <select
                {...register("fromSubCategoryId", { valueAsNumber: true })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                defaultValue={defaultFromSubCategoryId}
                disabled={isSubmitting}
              >
                {allSubCategories.map((subCat) => (
                  <option key={subCat.id} value={subCat.id}>
                    {subCat.name} (Budgeted:{" "}
                    <FormattedAmount amount={subCat.periodBudgeted ?? 0} />)
                  </option>
                ))}
              </select>
              <ErrorMessage>{errors.fromSubCategoryId?.message}</ErrorMessage>
            </div>
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                To
              </Label>
              <select
                {...register("toSubCategoryId", { valueAsNumber: true })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                disabled={isSubmitting}
              >
                <option value="">Select a subcategory</option>
                {allSubCategories.map((subCat) => (
                  <option key={subCat.id} value={subCat.id}>
                    {subCat.name} (Budgeted:{" "}
                    <FormattedAmount amount={subCat.periodBudgeted ?? 0} />)
                  </option>
                ))}
              </select>
              <ErrorMessage>{errors.toSubCategoryId?.message}</ErrorMessage>
            </div>
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                Amount
              </Label>
              <input
                type="number"
                {...register("amount", { valueAsNumber: true })}
                min={1}
                max={maxAmount}
                step="0.01"
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                disabled={isSubmitting}
              />
              <ErrorMessage>{errors.amount?.message}</ErrorMessage>
              {fromSubCategory && (
                <div className="mt-2 text-xs text-slate-600">
                  Max available: <FormattedAmount amount={maxAmount} />
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
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Moving..." : "Move"}
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
