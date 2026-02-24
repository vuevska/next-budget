"use client";

import { useState, useRef, useEffect } from "react";
import { formatMKD } from "@/app/lib/formatMKD";
import { SubCategory } from "@prisma/client";
import { FiCheck, FiX } from "react-icons/fi";
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
          className="font-medium text-slate-900 bg-white border-2 border-indigo-300 rounded-md px-2 py-0.5 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all w-32"
          maxLength={255}
        />
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleSave}
          disabled={isSaving}
          className="p-1 rounded bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
          aria-label="Save"
        >
          <FiCheck size={12} />
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleCancel}
          disabled={isSaving}
          className="p-1 rounded bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
          aria-label="Cancel"
        >
          <FiX size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 truncate">
      <div className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
      <span
        className="font-medium text-slate-900 truncate cursor-pointer hover:text-indigo-600 transition-colors"
        onDoubleClick={() => setIsEditing(true)}
        title="Double-click to edit"
      >
        {subCategory.name}
      </span>
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
      <table className="w-full text-xs table-fixed">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-2 sm:px-4 py-2 text-left font-medium text-slate-600 w-[40%]">
              Name
            </th>
            <th className="px-2 sm:px-4 py-2 text-right font-medium text-slate-600 w-[20%]">
              Budgeted
            </th>
            <th className="px-2 sm:px-4 py-2 text-right font-medium text-slate-600 w-[20%]">
              Spent
            </th>
            <th className="px-2 sm:px-4 py-2 text-right font-medium text-slate-600 w-[20%]">
              Available
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {subCategories.map((subCategory) => {
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

            return (
              <tr
                key={subCategory.id}
                className="bg-white hover:bg-slate-50 transition-colors"
              >
                <td className="px-2 sm:px-4 py-2">
                  <EditableSubCategoryName
                    subCategory={subCategory}
                    onRenamed={onSubCategoryRenamed}
                  />
                  {/* Budget usage bar — shows how much of the budgeted amount has been spent */}
                  {budgeted > 0 && (
                    <div className="mt-1.5 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} transition-all duration-300`}
                        style={{
                          width: `${Math.min(percentSpent, 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </td>

                <td className="px-2 sm:px-4 py-2 text-right">
                  <button
                    type="button"
                    className="font-medium text-slate-700 hover:text-indigo-600 focus:outline-none focus:underline"
                    onClick={
                      onBudgetedClick
                        ? () => onBudgetedClick(subCategory)
                        : undefined
                    }
                  >
                    {budgeted > 0 ? `+${formatMKD(budgeted)}` : formatMKD(budgeted)}
                  </button>
                </td>

                <td className="px-2 sm:px-4 py-2 text-right">
                  <span className="font-medium text-rose-600 text-xs">
                    {spent > 0 ? `\u2212${formatMKD(spent)}` : formatMKD(spent)}
                  </span>
                </td>

                <td className="px-2 sm:px-4 py-2 text-right">
                  <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
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
