"use client";

import { Button } from "@radix-ui/themes";
import { FiX } from "react-icons/fi";
import { updateAccount } from "@/app/lib/services/account-type";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@radix-ui/themes/components/context-menu";
import ErrorMessage from "../ErrorMessage";
import { editAccountTypeSchema } from "@/app/lib/validationSchema";
import Portal from "../Portal";
import { useRouter } from "next/navigation";

type EditAccountFormValues = z.infer<typeof editAccountTypeSchema>;

type EditAccountModalProps = Readonly<{
  id: number;
  currentName: string;
  onClose: () => void;
}>;

export default function EditAccountModal({
  id,
  currentName,
  onClose,
}: EditAccountModalProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditAccountFormValues>({
    resolver: zodResolver(editAccountTypeSchema),
    defaultValues: { name: currentName },
  });

  const onSubmit = async (data: EditAccountFormValues) => {
    try {
      await updateAccount(id, data.name);
      onClose();
      router.refresh();
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
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-xl">
            <h2 className="text-xl font-bold text-slate-900">
              Edit Account
            </h2>
            <Button
              disabled={isSubmitting}
              onClick={onClose}
              className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <FiX size={24} className="text-slate-600" />
            </Button>
          </div>
          <form className="p-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                Account Name
              </Label>
              <ErrorMessage>{errors.name?.message}</ErrorMessage>
              <input
                type="text"
                {...register("name")}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                autoFocus
                disabled={isSubmitting}
              />
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-600">
                💡 <span className="font-medium">Note:</span> Amount cannot be
                edited here
              </p>
            </div>
            {errors.root && <ErrorMessage>{errors.root.message}</ErrorMessage>}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
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
