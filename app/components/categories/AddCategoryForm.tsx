import { Category, SubCategory } from "@prisma/client";
import { createCategory } from "@/app/lib/categories";
import { IoMdClose } from "react-icons/io";
import z from "zod";
import { createCategorySchema } from "@/app/lib/validationSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/themes/components/context-menu";
import { Button } from "@radix-ui/themes";
import ErrorMessage from "../ErrorMessage";

type CategoryFormValues = z.infer<typeof createCategorySchema>;

type AddCategoryFormProps = Readonly<{
  onAddCategory: (category: Category & { SubCategory: SubCategory[] }) => void;
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <div>
        <Label className="block text-xs font-semibold text-gray-700 mb-1">
          Category Name
        </Label>
        <ErrorMessage>{errors.name?.message}</ErrorMessage>
        <input
          type="text"
          {...register("name")}
          placeholder="e.g., Groceries, Utilities, Entertainment"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm"
          disabled={isSubmitting}
          autoFocus
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 px-3 py-1.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-150 font-medium text-xs"
          disabled={isSubmitting}
        >
          <IoMdClose size={14} />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition duration-150 font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : "Create Category"}
        </Button>
      </div>
    </form>
  );
}
