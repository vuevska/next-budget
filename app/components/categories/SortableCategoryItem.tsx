"use client";
import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SubCategory, SubCategoryPeriod } from "@prisma/client";
import { FaGripVertical } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { FiCheck, FiX, FiEdit2 } from "react-icons/fi";
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
    <div ref={setNodeRef} style={style}>
      <div className={`border-b border-slate-200 last:border-b-0 ${isDragging ? "ring-2 ring-indigo-300" : ""}`}>
        {/* Category Header — compact row */}
        <div className="flex items-center px-3 sm:px-4 py-2 bg-slate-50" style={{ display: 'grid', gridTemplateColumns: '40% 20% 20% 20%', alignItems: 'center' }}>
          <div className="flex items-center gap-2 min-w-0">
            <button
              {...attributes}
              {...listeners}
              className="p-1 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing transition-colors shrink-0"
              aria-label="Drag to reorder"
            >
              <FaGripVertical size={12} />
            </button>

            {isEditing ? (
              <div className="flex items-center gap-1.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSave}
                  disabled={isSaving}
                  className="text-sm font-semibold text-slate-900 bg-white border border-indigo-300 rounded px-2 py-0.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all w-36 sm:w-48"
                  maxLength={255}
                />
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleSave}
                  disabled={isSaving}
                  className="p-0.5 rounded text-emerald-500 hover:text-emerald-600 transition-colors"
                  aria-label="Save"
                >
                  <FiCheck size={14} />
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="p-0.5 rounded text-rose-400 hover:text-rose-500 transition-colors"
                  aria-label="Cancel"
                >
                  <FiX size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 group/edit min-w-0">
                <span className="text-sm font-semibold text-slate-700 truncate">
                  {category.name}
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-0.5 rounded text-slate-300 hover:text-indigo-500 opacity-0 group-hover/edit:opacity-100 transition-all shrink-0"
                  aria-label="Edit category name"
                >
                  <FiEdit2 size={12} />
                </button>
              </div>
            )}

            <button
              onClick={() => {
                if (expandedAddSubCategory !== category.id) {
                  onToggleAddSubCategory(category.id);
                }
              }}
              disabled={expandedAddSubCategory === category.id}
              className={`p-1 rounded transition-colors shrink-0 ${
                expandedAddSubCategory === category.id
                  ? "text-indigo-400 opacity-50 cursor-not-allowed"
                  : "text-slate-300 hover:text-slate-500"
              }`}
              aria-label="Add subcategory"
            >
              <IoMdAdd size={16} />
            </button>
          </div>
          <span className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 sm:px-4">Budgeted</span>
          <span className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 sm:px-4">Spent</span>
          <span className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 sm:px-4">Available</span>
        </div>

        {/* Add SubCategory Form */}
        {expandedAddSubCategory === category.id && (
          <div className="px-3 sm:px-5 py-2 bg-white border-t border-slate-100">
            <AddSubCategoryForm
              categoryId={category.id}
              onAddSubCategory={onAddSubCategory}
              onCancel={() => onToggleAddSubCategory(category.id)}
            />
          </div>
        )}

        {/* SubCategories */}
        {category.SubCategory.length === 0 ? (
          <div className="px-3 sm:px-4 py-2 text-center">
            <span className="text-xs text-slate-300 italic">No subcategories</span>
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
