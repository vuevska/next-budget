import { Button } from "@radix-ui/themes";
import { FiX } from "react-icons/fi";
import AccountFormButtons from "./AccountFormButtons";
import { createAccount } from "@/app/lib/accountTypes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAccountTypeSchema } from "@/app/lib/validationSchema";
import { z } from "zod";
import { Label } from "@radix-ui/themes/components/context-menu";
import ErrorMessage from "../ErrorMessage";
import Portal from "../Portal";

type AccountFormValues = z.infer<typeof createAccountTypeSchema>;

type AddAccountModalProps = Readonly<{
  onClose: () => void;
  onAdd: (account: any) => void;
}>;

export default function AddAccountModal({
  onClose,
  onAdd,
}: AddAccountModalProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
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
    } catch (err: any) {
      setError("root", {
        type: "manual",
        message: err?.message || "Unexpected error",
      });
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-2xl p-8 w-96 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                Add New Account
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Create a new account to track your finances
              </p>
            </div>
            <Button
              disabled={isSubmitting}
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors hover:bg-slate-100 rounded-lg p-2"
            >
              <FiX size={24} />
            </Button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label className="block text-sm font-semibold text-slate-700 mb-2">
                Account Name
              </Label>
              <ErrorMessage>{errors.name?.message}</ErrorMessage>
              <input
                placeholder="e.g., Savings, Checking"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                {...register("name")}
              />
            </div>
            <div>
              <Label className="block text-sm font-semibold text-slate-700 mb-2">
                Starting Balance
              </Label>
              <ErrorMessage>{errors.amount?.message}</ErrorMessage>
              <input
                type="number"
                step="0.01"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="0.00 мкд"
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
    </Portal>
  );
}
