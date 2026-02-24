"use client";

import { useState, useRef, useEffect } from "react";
import { formatMKD } from "@/app/lib/formatMKD";
import { SubCategory } from "@prisma/client";
import { FiCheck, FiX, FiEdit2 } from "react-icons/fi";
import { updateSubCategory } from "@/app/lib/services/sub-category";

type SubCategoryTableProps = Readonly<{
  subCategories: (SubCategory & {
    periodBudgeted?: number;
    periodSpent?: number;
    rollover?: number;
    available?: number;
  })[];
  onBudgetedClick?: (subCategory: any) => void;
  onSubCategoryRenamed?: (subCategoryId: number, newName: string) => void;
}>;

function EditableSubCategoryName({
  subCategory,
  onRenamed,
}: {
  subCategory: SubCategory;
  onRenamed?: (subCategoryId: number, newName: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(subCategory.name);
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
    if (!trimmed || trimmed === subCategory.name) {
      setEditName(subCategory.name);
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await updateSubCategory(subCategory.id, trimmed);
      onRenamed?.(subCategory.id, trimmed);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to rename subcategory:", err);
      setEditName(subCategory.name);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditName(subCategory.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          ref={inputRef}
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          disabled={isSaving}
          className="font-medium text-slate-900 bg-white border border-indigo-300 rounded px-2 py-0.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all w-36 sm:w-44"
          maxLength={255}
        />
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleSave}
          disabled={isSaving}
          className="p-0.5 rounded text-emerald-500 hover:text-emerald-600 transition-colors"
          aria-label="Save"
        >
          <FiCheck size={13} />
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleCancel}
          disabled={isSaving}
          className="p-0.5 rounded text-rose-400 hover:text-rose-500 transition-colors"
          aria-label="Cancel"
        >
          <FiX size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 truncate group/edit">
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0" />
      <span className="font-medium text-slate-700 truncate text-sm">
        {subCategory.name}
      </span>
      <button
        onClick={() => setIsEditing(true)}
        className="p-0.5 rounded text-slate-300 hover:text-indigo-500 opacity-0 group-hover/edit:opacity-100 transition-all shrink-0"
        aria-label="Edit subcategory name"
      >
        <FiEdit2 size={11} />
      </button>
    </div>
  );
}

export default function SubCategoryTable({
  subCategories,
  onBudgetedClick,
  onSubCategoryRenamed,
}: SubCategoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm table-fixed">
        <tbody>
          {subCategories.map((subCategory, index) => {
            const budgeted = subCategory.periodBudgeted ?? 0;
            const spent = subCategory.periodSpent ?? 0;
            const rollover = subCategory.rollover ?? 0;
            const available =
              subCategory.available ?? rollover + budgeted - spent;
            const percentSpent = (spent / (budgeted || 1)) * 100 || 0;

            const barColor =
              percentSpent > 100
                ? "bg-rose-400"
                : percentSpent > 75
                  ? "bg-amber-400"
                  : "bg-emerald-400";

            const isLast = index === subCategories.length - 1;

            return (
              <tr
                key={subCategory.id}
                className={`bg-white hover:bg-slate-50/60 transition-colors ${
                  !isLast ? "border-b border-slate-100" : ""
                }`}
              >
                <td className="px-3 sm:px-5 py-2 w-[40%]">
                  <EditableSubCategoryName
                    subCategory={subCategory}
                    onRenamed={onSubCategoryRenamed}
                  />
                  {/* Budget usage bar */}
                  {budgeted > 0 && (
                    <div className="mt-1 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} transition-all duration-500 ease-out`}
                        style={{
                          width: `${Math.min(percentSpent, 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </td>

                <td className="px-2 sm:px-4 py-2 text-right w-[20%]">
                  <button
                    type="button"
                    className="font-medium text-slate-600 hover:text-indigo-600 focus:outline-none focus:underline transition-colors"
                    onClick={
                      onBudgetedClick
                        ? () => onBudgetedClick(subCategory)
                        : undefined
                    }
                  >
                    {budgeted > 0 ? `+${formatMKD(budgeted)}` : formatMKD(budgeted)}
                  </button>
                </td>

                <td className="px-2 sm:px-4 py-2 text-right w-[20%]">
                  <span className="font-medium text-rose-500">
                    {spent > 0 ? `\u2212${formatMKD(spent)}` : formatMKD(spent)}
                  </span>
                </td>

                <td className="px-2 sm:px-4 py-2 text-right w-[20%]">
                  <span
                    className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      available < 0
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {formatMKD(available)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
