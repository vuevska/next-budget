"use client";

import { Button, Text } from "@radix-ui/themes";
import { FiX } from "react-icons/fi";
import AccountFormButtons from "./AccountFormButtons";
import { createAccount } from "@/app/lib/accountTypes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAccountTypeSchema } from "@/app/lib/validationSchema";
import { z } from "zod";
import { Label } from "@radix-ui/themes/components/context-menu";
import ErrorMessage from "../ErrorMessage";

type AccountFormValues = z.infer<typeof createAccountTypeSchema>;

interface AddAccountModalProps {
  onClose: () => void;
  onAdd: (account: any) => void;
}

export default function AddAccountModal({
  onClose,
  onAdd,
}: AddAccountModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AccountFormValues>({
    resolver: zodResolver(createAccountTypeSchema),
  });

  const onSubmit = async (data: AccountFormValues) => {
    try {
      const created = await createAccount(data.name, data.amount);
      onAdd(created);
      reset();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-96 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Add New Account</h3>
          <Button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <FiX size={24} />
          </Button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label className="block text-sm font-medium text-slate-300 mb-2">
              Account Name
            </Label>
            <ErrorMessage>{errors.name?.message}</ErrorMessage>
            <input
              placeholder="e.g., Savings, Checking"
              className="w-full rounded border p-2 text-slate-800"
              {...register("name")}
            />
          </div>
          <div>
            <Label className="block text-sm font-medium text-slate-300 mb-2 mt-3">
              Starting Balance
            </Label>
            <ErrorMessage>{errors.amount?.message}</ErrorMessage>
            <input
              type="number"
              className="w-full rounded border p-2 text-slate-800"
              placeholder="0 мкд"
              {...register("amount", { valueAsNumber: true })}
            />
          </div>

          <AccountFormButtons
            onSave={handleSubmit(onSubmit)}
            onCancel={onClose}
            saveLabel="Add Account"
          />
        </form>
      </div>
    </div>
  );
}
