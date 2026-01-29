"use client";

import React, { useState } from "react";
import { SubCategory } from "@prisma/client";
import { createSubCategory } from "@/app/lib/categories";
import { IoMdClose } from "react-icons/io";

type AddSubCategoryFormProps = Readonly<{
  categoryId: number;
  onAddSubCategory: (categoryId: number, subCategory: SubCategory) => void;
  onCancel: () => void;
}>;

export default function AddSubCategoryForm({
  categoryId,
  onAddSubCategory,
  onCancel,
}: AddSubCategoryFormProps) {
  const [subCategoryName, setSubCategoryName] = useState("");
  const [budgeted, setBudgeted] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subCategoryName.trim()) {
      setError("Subcategory name is required");
      return;
    }

    if (!budgeted.trim() || isNaN(parseFloat(budgeted))) {
      setError("Please enter a valid budget amount");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await createSubCategory(
        categoryId,
        subCategoryName.trim(),
        parseFloat(budgeted),
      );
      if (result.success && result.subCategory) {
        onAddSubCategory(categoryId, result.subCategory);
        setSubCategoryName("");
        setBudgeted("");
      } else {
        setError(result.error || "Failed to create subcategory");
      }
    } catch (err) {
      setError("An error occurred while creating the subcategory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Subcategory Name
          </label>
          <input
            type="text"
            value={subCategoryName}
            onChange={(e) => setSubCategoryName(e.target.value)}
            placeholder="e.g., Vegetables, Internet"
            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-xs"
            disabled={loading}
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Budget Amount
          </label>
          <input
            type="number"
            step="0.01"
            value={budgeted}
            onChange={(e) => setBudgeted(e.target.value)}
            placeholder="0.00"
            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-xs"
            disabled={loading}
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 px-2 py-1.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-150 font-medium text-xs"
          disabled={loading}
        >
          <IoMdClose size={12} />
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition duration-150 font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Adding..." : "Add Subcategory"}
        </button>
      </div>
    </form>
  );
}
