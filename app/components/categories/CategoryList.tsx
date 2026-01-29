"use client";

import React, { useState } from "react";
import { Category, SubCategory } from "@prisma/client";
import { IoMdAdd } from "react-icons/io";
import SubCategoryTable from "./SubCategoryTable";
import AddCategoryForm from "./AddCategoryForm";
import AddSubCategoryForm from "./AddSubCategoryForm";

interface CategoryListProps {
  categories: (Category & { SubCategory: SubCategory[] })[];
}

export default function CategoryList({ categories }: CategoryListProps) {
  const [categoryList, setCategoryList] = useState(categories);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [expandedAddSubCategory, setExpandedAddSubCategory] = useState<
    number | null
  >(null);

  const handleAddCategory = (
    newCategory: Category & { SubCategory: SubCategory[] },
  ) => {
    setCategoryList([...categoryList, newCategory]);
    setShowAddCategory(false);
  };

  const handleAddSubCategory = (
    categoryId: number,
    newSubCategory: SubCategory,
  ) => {
    setCategoryList(
      categoryList.map((cat) =>
        cat.id === categoryId
          ? { ...cat, SubCategory: [...cat.SubCategory, newSubCategory] }
          : cat,
      ),
    );
    setExpandedAddSubCategory(null);
  };

  return (
    <div className="w-full h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 p-5">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">
            January 2026
          </h1>
        </div>
        <button
          onClick={() => setShowAddCategory(!showAddCategory)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-950 hover:bg-slate-800 text-white rounded-lg transition shadow-sm text-sm"
        >
          <IoMdAdd size={18} />
          Add Category
        </button>
      </div>

      {/* Add Category Form */}
      {showAddCategory && (
        <div className="mb-3 bg-white rounded-lg border border-slate-200 p-4">
          <AddCategoryForm
            onAddCategory={handleAddCategory}
            onCancel={() => setShowAddCategory(false)}
          />
        </div>
      )}

      {/* Categories */}
      {categoryList.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
          <IoMdAdd size={32} className="mx-auto text-slate-400 mb-3" />
          <p className="text-slate-600 text-sm font-medium">
            No categories yet
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Create your first category to get started
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {categoryList.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg border border-slate-200"
            >
              {/* Category Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 border-b border-slate-200">
                <h2 className="text-sm font-semibold text-slate-800">
                  {category.name}
                </h2>
                <button
                  onClick={() =>
                    setExpandedAddSubCategory(
                      expandedAddSubCategory === category.id
                        ? null
                        : category.id,
                    )
                  }
                  className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                >
                  <IoMdAdd size={16} />
                </button>
              </div>

              {/* Add SubCategory Form */}
              {expandedAddSubCategory === category.id && (
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <AddSubCategoryForm
                    categoryId={category.id}
                    onAddSubCategory={handleAddSubCategory}
                    onCancel={() => setExpandedAddSubCategory(null)}
                  />
                </div>
              )}

              {/* SubCategories Table */}
              {category.SubCategory.length === 0 ? (
                <div className="text-center py-4 px-4">
                  <p className="text-slate-400 text-xs font-medium">
                    No subcategories yet
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    Click the + button to add one
                  </p>
                </div>
              ) : (
                <SubCategoryTable subCategories={category.SubCategory} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
