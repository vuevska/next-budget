import { createCategory } from "@/app/lib/services/category";
import z from "zod";
import { createCategorySchema } from "@/app/lib/validationSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ErrorMessage from "../ErrorMessage";
import { CategoryBudgetView } from "./CategoryList";
import { FiCheck, FiX } from "react-icons/fi";
import { Button } from "@radix-ui/themes";

type CategoryFormValues = z.infer<typeof createCategorySchema>;

type AddCategoryFormProps = Readonly<{
  onAddCategory: (category: CategoryBudgetView) => void;
  onCancel: () => void;
}>;

export default function AddCategoryForm({
  onAddCategory,
  onCancel,
}: AddCategoryFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
  });

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      const created = await createCategory(data.name);
      onAddCategory(created);
      reset();
    } catch (err: any) {
      setError("root", {
        type: "manual",
        message: err?.message || "Unexpected error",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex items-center gap-2"
    >
      <input
        type="text"
        {...register("name")}
        placeholder="New category name…"
        className="flex-1 min-w-0 px-2.5 py-1 text-sm font-medium text-slate-900 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-all placeholder:text-slate-400"
        disabled={isSubmitting}
        autoFocus
      />
      <Button
        type="submit"
        disabled={isSubmitting}
        className="p-1.5 rounded-md text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Create category"
        title="Create"
      >
        <FiCheck size={15} />
      </Button>
      <Button
        onClick={onCancel}
        className="p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
        disabled={isSubmitting}
        aria-label="Cancel"
        title="Cancel"
      >
        <FiX size={15} />
      </Button>
      <ErrorMessage>{errors.name?.message}</ErrorMessage>
    </form>
  );
}
