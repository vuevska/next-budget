import { Button, Callout } from "@radix-ui/themes";
import { FiX } from "react-icons/fi";
import AccountFormButtons from "./AccountFormButtons";
import { updateAccount } from "@/app/lib/accountTypes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@radix-ui/themes/components/context-menu";
import ErrorMessage from "../ErrorMessage";
import { editAccountTypeSchema } from "@/app/lib/validationSchema";
import Portal from "../Portal";

type EditAccountFormValues = z.infer<typeof editAccountTypeSchema>;

type EditAccountModalProps = Readonly<{
  id: number;
  currentName: string;
  onClose: () => void;
  onSave: (updated: any) => void;
}>;

export default function EditAccountModal({
  id,
  currentName,
  onClose,
  onSave,
}: EditAccountModalProps) {
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
      const updated = await updateAccount(id, data.name);
      onSave(updated);
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
                Edit Account
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Update your account information
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

          {errors.root && (
            <Callout.Root color="red" className="mb-4">
              <Callout.Text>{errors.root?.message}</Callout.Text>
            </Callout.Root>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label className="block text-sm font-semibold text-slate-700 mb-2">
                Account Name
              </Label>
              <ErrorMessage>{errors.name?.message}</ErrorMessage>
              <input
                type="text"
                {...register("name")}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                autoFocus
              />
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-600">
                💡 <span className="font-medium">Note:</span> Amount cannot be
                edited here
              </p>
            </div>

            <AccountFormButtons
              onSave={handleSubmit(onSubmit)}
              onCancel={onClose}
              saveLabel="Save Changes"
            />
          </form>
        </div>
      </div>
    </Portal>
  );
}
