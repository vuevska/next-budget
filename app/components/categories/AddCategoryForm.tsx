"use client";

import React, { useState } from "react";
import { Category, SubCategory } from "@prisma/client";
import { createCategory } from "@/app/lib/categories";
import { IoMdClose } from "react-icons/io";

interface AddCategoryFormProps {
  onAddCategory: (category: Category & { SubCategory: SubCategory[] }) => void;
  onCancel: () => void;
}

export default function AddCategoryForm({
  onAddCategory,
  onCancel,
}: AddCategoryFormProps) {
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      setError("Category name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await createCategory(categoryName.trim());
      if (result.success && result.category) {
        onAddCategory(result.category);
        setCategoryName("");
      } else {
        setError(result.error || "Failed to create category");
      }
    } catch (err) {
      setError("An error occurred while creating the category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Category Name
        </label>
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="e.g., Groceries, Utilities, Entertainment"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm"
          disabled={loading}
          autoFocus
        />
        {error && (
          <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 px-3 py-1.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-150 font-medium text-xs"
          disabled={loading}
        >
          <IoMdClose size={14} />
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition duration-150 font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create Category"}
        </button>
      </div>
    </form>
  );
}
