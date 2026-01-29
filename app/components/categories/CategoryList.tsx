"use client";

import { useState } from "react";
import { Category, SubCategory } from "@prisma/client";
import { IoMdAdd } from "react-icons/io";
import { FaWallet, FaEllipsisH } from "react-icons/fa";
import SubCategoryTable from "./SubCategoryTable";
import AddCategoryForm from "./AddCategoryForm";
import AddSubCategoryForm from "./AddSubCategoryForm";

type CategoryListProps = Readonly<{
  categories: (Category & { SubCategory: SubCategory[] })[];
}>;

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
    <div className="w-full min-h-full bg-gradient-to-br from-slate-50 via-white to-slate-50 p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
              Budget Categories
            </p>
            <h1 className="text-4xl font-bold text-slate-900 mt-2">
              January 2026
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Manage and organize your spending categories
            </p>
          </div>
          <button
            onClick={() => setShowAddCategory(!showAddCategory)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm group"
          >
            <IoMdAdd
              size={18}
              className="group-hover:rotate-90 transition-transform"
            />
            New Category
          </button>
        </div>
      </div>

      {/* Add Category Form */}
      {showAddCategory && (
        <div className="mb-6 bg-white rounded-2xl border-2 border-indigo-100 p-6 shadow-sm">
          <AddCategoryForm
            onAddCategory={handleAddCategory}
            onCancel={() => setShowAddCategory(false)}
          />
        </div>
      )}

      {/* Categories Grid */}
      {categoryList.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <FaWallet size={32} className="text-slate-400" />
          </div>
          <h3 className="text-slate-800 text-lg font-semibold mb-2">
            No Categories Yet
          </h3>
          <p className="text-slate-600 text-sm mb-6">
            Start organizing your budget by creating your first category
          </p>
          <button
            onClick={() => setShowAddCategory(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200 font-medium"
          >
            <IoMdAdd size={18} />
            Create Category
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {categoryList.map((category) => (
            <div
              key={category.id}
              className={`bg-gradient-to-br  rounded-2xl border-2 transition-all duration-200 overflow-hidden hover:shadow-md`}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between px-6 py-5 bg-white/70 backdrop-blur-sm border-b-2 border-inherit">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl bg-white/80 text-slate-600 text-xl`}
                  >
                    <FaWallet />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {category.name}
                    </h2>
                    <p className="text-xs text-slate-600">
                      {category.SubCategory.length}{" "}
                      {category.SubCategory.length === 1
                        ? "subcategory"
                        : "subcategories"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setExpandedAddSubCategory(
                      expandedAddSubCategory === category.id
                        ? null
                        : category.id,
                    )
                  }
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
                    onAddSubCategory={handleAddSubCategory}
                    onCancel={() => setExpandedAddSubCategory(null)}
                  />
                </div>
              )}

              {/* SubCategories Table */}
              {category.SubCategory.length === 0 ? (
                <div className="text-center py-8 px-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/60 mb-3">
                    <FaEllipsisH size={18} className="text-slate-400" />
                  </div>
                  <p className="text-slate-600 text-sm font-medium">
                    No subcategories
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    Add your first subcategory to organize your expenses
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
