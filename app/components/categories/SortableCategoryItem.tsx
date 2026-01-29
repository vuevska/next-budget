"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Category, SubCategory } from "@prisma/client";
import { FaGripVertical, FaWallet, FaEllipsisH } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import AddSubCategoryForm from "./AddSubCategoryForm";
import SubCategoryTable from "./SubCategoryTable";

export function SortableCategoryItem({
  category,
  expandedAddSubCategory,
  onToggleAddSubCategory,
  onAddSubCategory,
}: Readonly<{
  category: Category & { SubCategory: SubCategory[] };
  expandedAddSubCategory: number | null;
  onToggleAddSubCategory: (categoryId: number) => void;
  onAddSubCategory: (categoryId: number, subCategory: SubCategory) => void;
}>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group">
      <div
        className={`bg-gradient-to-br rounded-2xl border-2 transition-all duration-200 overflow-hidden hover:shadow-md ${isDragging ? "shadow-xl ring-2 ring-indigo-500" : ""}`}
      >
        {/* Category Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-white/70 backdrop-blur-sm border-b-2 border-inherit">
          <div className="flex items-center gap-4">
            {/* Drag Handle */}
            <button
              {...attributes}
              {...listeners}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing transition-all"
              aria-label="Drag to reorder"
            >
              <FaGripVertical size={16} />
            </button>

            <div className="p-1 rounded-xl bg-white/80 text-slate-600 text-xl">
              <FaWallet />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {category.name}
              </h2>
            </div>
          </div>
          <button
            onClick={() => onToggleAddSubCategory(category.id)}
            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 font-medium text-sm ${
              expandedAddSubCategory === category.id
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 shadow-sm"
            }`}
          >
            <IoMdAdd size={20} />
          </button>
        </div>

        {/* Add SubCategory Form */}
        {expandedAddSubCategory === category.id && (
          <div className="px-6 py-4 bg-white/50 backdrop-blur-sm border-b-2 border-inherit">
            <AddSubCategoryForm
              categoryId={category.id}
              onAddSubCategory={onAddSubCategory}
              onCancel={() => onToggleAddSubCategory(category.id)}
            />
          </div>
        )}

        {/* SubCategories Table */}
        {category.SubCategory.length === 0 ? (
          <div className="text-center p-1">
            <div className="inline-flex items-center justify-center pt-3 rounded-full bg-white/60 mb-3">
              <FaEllipsisH size={18} className="text-slate-400" />
            </div>
          </div>
        ) : (
          <SubCategoryTable subCategories={category.SubCategory} />
        )}
      </div>
    </div>
  );
}
