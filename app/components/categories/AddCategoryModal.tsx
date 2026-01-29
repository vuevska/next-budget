"use client";

import React, { useState } from "react";
import { Category, SubCategory } from "@prisma/client";
import { Dialog, Box } from "@radix-ui/themes";
import { createCategory } from "@/app/lib/categories";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (category: Category & { SubCategory: SubCategory[] }) => void;
}

export default function AddCategoryModal({
  isOpen,
  onClose,
  onAddCategory,
}: AddCategoryModalProps) {
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
      if (result.success) {
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
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content className="max-w-md">
        <Dialog.Title>Add New Category</Dialog.Title>
        <form onSubmit={handleSubmit}>
          <Box className="my-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g., Groceries, Utilities"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </Box>

          <Dialog.Close asChild>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition duration-200 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Category"}
              </button>
            </div>
          </Dialog.Close>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
