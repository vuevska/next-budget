"use client";

import { FiX } from "react-icons/fi";
import { Button } from "@radix-ui/themes";
import Portal from "../Portal";
import { Transaction, SubCategory } from "@prisma/client";
import { Label } from "@radix-ui/themes/components/context-menu";
import z from "zod";
import { createTransactionSchema } from "@/app/lib/validationSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ErrorMessage from "../ErrorMessage";
import { createTransaction } from "@/app/lib/transactions";

export type CreateTransactionInput = z.infer<typeof createTransactionSchema> & {
  accountId: number;
};

type NewTransactionModalProps = Readonly<{
  accountId: number;
  onClose: () => void;
  onAdd: (transaction: Transaction & { subCategory: SubCategory }) => void;
}>;

export default function NewTransactionModal({
  accountId,
  onClose,
  onAdd,
}: NewTransactionModalProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
  });


  const onSubmit = async (data: CreateTransactionInput) => {
    try {
      const payload = {
        ...data,
        accountTypeId: accountId,
      };
      const created = await createTransaction(payload);

      onAdd(created);
      onClose();
    } catch (err: any) {
      setError("root", {
        type: "manual",
        message: err?.message || "Unexpected error",
      });
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 border border-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-blue-50">
            <h2 className="text-xl font-bold text-slate-900">
              New Transaction
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <FiX size={24} className="text-slate-600" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {/* Amount */}
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                Amount
              </Label>
              <ErrorMessage>{errors.amount?.message}</ErrorMessage>

              <input
                type="number"
                placeholder="0.00 мкд"
                {...register("amount", { valueAsNumber: true })}
                step="0.01"
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            {/* Payee */}
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                Payee
              </Label>
              <ErrorMessage>{errors.payee?.message}</ErrorMessage>
              <input
                type="text"
                {...register("payee")}
                placeholder="e.g., Coffee Shop"
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </Label>
              <input
                type="text"
                {...register("description")}
                placeholder="e.g., Morning coffee"
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            {/* Date */}
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                Date
              </Label>
              <input
                type="date"
                {...register("date", { valueAsDate: true })}
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            {/* SubCategory */}
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </Label>
              <select
                {...register("subCatId", { valueAsNumber: true })}
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                <option value="">Select a category...</option>
                <option value="1">General</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Note: Proper category selection coming soon
              </p>
            </div>

            {/* Transaction Type */}
            <div className="flex items-center gap-3">
              <Label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isInflow")}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  Inflow
                </span>
              </Label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
