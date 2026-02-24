"use client";

import { FiX } from "react-icons/fi";
import { Button } from "@radix-ui/themes";
import Portal from "../Portal";
import { Transaction, SubCategory, Payee } from "@prisma/client";
import { Label } from "@radix-ui/themes/components/context-menu";
import z from "zod";
import { createTransactionSchema } from "@/app/lib/validationSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ErrorMessage from "../ErrorMessage";
import { updateTransaction } from "@/app/lib/services/transactions";
import { useEffect, useState } from "react";
import { getCategories } from "@/app/lib/data/category";
import PayeeCombobox from "./PayeeCombobox";
import { createPayee } from "@/app/lib/services/payees";

export type UpdateTransactionInput = z.infer<typeof createTransactionSchema> & {
  accountId: number;
};

type TransactionWithPayee = Transaction & {
  subCategory: SubCategory | null;
  payee: Payee;
  linkedTransactionId?: number | null;
};

type EditTransactionModalProps = Readonly<{
  userId: string;
  accountId: number;
  transaction: TransactionWithPayee;
  onClose: () => void;
  onUpdate: (transaction: TransactionWithPayee) => void;
  subCategories: SubCategory[];
  payees: Payee[];
  onPayeesUpdate: (payees: Payee[]) => void;
  onCategoriesUpdate?: (categories: any[]) => void;
}>;

export default function EditTransactionModal({
  userId,
  accountId,
  transaction,
  onClose,
  onUpdate,
  subCategories,
  payees,
  onPayeesUpdate,
  onCategoriesUpdate,
}: EditTransactionModalProps) {
  const isTransfer = !!(transaction as any).linkedTransactionId;

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      amount: transaction.amount,
      payeeId: transaction.payeeId,
      description: transaction.description || "",
      date: new Date(transaction.date).toISOString().split("T")[0] as any,
      subCatId: transaction.subCatId,
      isInflow: transaction.isInflow,
      isTransfer: isTransfer,
    },
  });

  const [isInflow, setIsInflow] = useState(transaction.isInflow);
  const [selectedPayeeId, setSelectedPayeeId] = useState<number | null>(
    transaction.payeeId,
  );

  useEffect(() => {
    if (isInflow || isTransfer) {
      setValue("subCatId", null);
    }
  }, [isInflow, isTransfer, setValue]);

  const handlePayeeChange = (payeeId: number | null) => {
    setSelectedPayeeId(payeeId);
    if (payeeId !== null) {
      setValue("payeeId", payeeId, { shouldValidate: true });
    }
  };

  const handleCreatePayee = async (name: string) => {
    const newPayee = await createPayee(name);
    onPayeesUpdate([...payees, newPayee]);
    return newPayee;
  };

  const onSubmit = async (data: UpdateTransactionInput) => {
    try {
      const payload = {
        ...data,
        accountTypeId: accountId,
      };
      const updated = await updateTransaction(transaction.id, payload);

      onUpdate(updated);

      if (onCategoriesUpdate) {
        const updatedCategories = await getCategories(userId);
        onCategoriesUpdate(updatedCategories);
      }

      reset();
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
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-blue-50">
            <h2 className="text-xl font-bold text-slate-900">
              {isTransfer ? "Edit Transfer" : "Edit Transaction"}
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
              <div className="flex items-end gap-3 mb-2">
                <div className="flex-1">
                  <Label className="block text-sm font-medium text-slate-700 mb-2">
                    Amount
                  </Label>
                </div>
                <Label className="flex items-center gap-2 cursor-pointer pb-1">
                  <input
                    type="checkbox"
                    {...register("isInflow")}
                    onChange={(e) => setIsInflow(e.target.checked)}
                    disabled={isTransfer}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                  />
                  <span className={`text-sm font-medium ${isTransfer ? "text-slate-400" : "text-slate-700"}`}>
                    Inflow
                  </span>
                </Label>
              </div>
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
              <ErrorMessage>{errors.payeeId?.message}</ErrorMessage>
              <PayeeCombobox
                payees={payees}
                value={selectedPayeeId}
                onChange={handlePayeeChange}
                onCreatePayee={handleCreatePayee}
                error={errors.payeeId?.message}
                disabled={isTransfer}
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

            {/* SubCategory — disabled for transfers */}
            <select
              {...register("subCatId", { valueAsNumber: true })}
              disabled={isInflow || isTransfer}
              className={`w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors ${
                isTransfer ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <option value="">Select a category...</option>
              {subCategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-medium transition-colors disabled:opacity-50"
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
