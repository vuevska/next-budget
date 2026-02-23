"use client";
import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SubCategory, SubCategoryPeriod } from "@prisma/client";
import { FaGripVertical, FaWallet, FaEllipsisH } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { FiCheck, FiX } from "react-icons/fi";
import AddSubCategoryForm from "./AddSubCategoryForm";
import SubCategoryTable from "./SubCategoryTable";
import { updateCategory } from "@/app/lib/services/category";

export function SortableCategoryItem({
  category,
  expandedAddSubCategory,
  onToggleAddSubCategory,
  onAddSubCategory,
  onBudgetedClick,
  onCategoryRenamed,
  onSubCategoryRenamed,
}: Readonly<{
  category: any;
  expandedAddSubCategory: number | null;
  onToggleAddSubCategory: (categoryId: number) => void;
  onAddSubCategory: (
    categoryId: number,
    subCategory: SubCategory,
    subCategoryPeriod: SubCategoryPeriod,
  ) => void;
  onAccountClick?: (id: number) => void;
  onBudgetedClick?: (subCategory: any) => void;
  onCategoryRenamed?: (categoryId: number, newName: string) => void;
  onSubCategoryRenamed?: (subCategoryId: number, newName: string) => void;
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

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === category.name) {
      setEditName(category.name);
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await updateCategory(category.id, trimmed);
      onCategoryRenamed?.(category.id, trimmed);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to rename category:", err);
      setEditName(category.name);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditName(category.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
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
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    disabled={isSaving}
                    className="text-lg font-bold text-slate-900 bg-white border-2 border-indigo-300 rounded-lg px-3 py-1 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all w-48"
                    maxLength={255}
                  />
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                    aria-label="Save"
                  >
                    <FiCheck size={16} />
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="p-1.5 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                    aria-label="Cancel"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <h2
                  className="text-lg font-bold text-slate-900 cursor-pointer hover:text-indigo-600 transition-colors"
                  onDoubleClick={() => setIsEditing(true)}
                  title="Double-click to edit"
                >
                  {category.name}
                </h2>
              )}
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
          <SubCategoryTable
            subCategories={category.SubCategory}
            onBudgetedClick={onBudgetedClick}
            onSubCategoryRenamed={onSubCategoryRenamed}
          />
        )}
      </div>
    </div>
  );
}
