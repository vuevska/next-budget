"use client";

import { useRef, useState } from "react";
import { Category, SubCategory } from "@prisma/client";
import { IoMdAdd } from "react-icons/io";
import { FaWallet, FaEllipsisH, FaGripVertical } from "react-icons/fa";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SubCategoryTable from "./SubCategoryTable";
import AddCategoryForm from "./AddCategoryForm";
import AddSubCategoryForm from "./AddSubCategoryForm";
import { persistCategoryOrder } from "@/app/lib/categories";

type CategoryListProps = Readonly<{
  categories: (Category & { SubCategory: SubCategory[] })[];
}>;

function SortableCategoryItem({
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
        className={`bg-gradient-to-br rounded-2xl border-2 transition-all duration-200 overflow-hidden hover:shadow-md ${
          isDragging ? "shadow-xl ring-2 ring-indigo-500" : ""
        }`}
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

            <div className="p-3 rounded-xl bg-white/80 text-slate-600 text-xl">
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
    </div>
  );
}

export default function CategoryList({ categories }: CategoryListProps) {
  const [categoryList, setCategoryList] = useState(categories);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [expandedAddSubCategory, setExpandedAddSubCategory] = useState<
    number | null
  >(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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

  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categoryList.findIndex((i) => i.id === active.id);
    const newIndex = categoryList.findIndex((i) => i.id === over.id);
    const newItems = arrayMove(categoryList, oldIndex, newIndex);

    setCategoryList(newItems);

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      persistCategoryOrder(newItems.map(({ id }) => ({ id })));
    }, 200);
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categoryList.map((cat) => cat.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {categoryList.map((category) => (
                <SortableCategoryItem
                  key={category.id}
                  category={category}
                  expandedAddSubCategory={expandedAddSubCategory}
                  onToggleAddSubCategory={(categoryId) =>
                    setExpandedAddSubCategory(
                      expandedAddSubCategory === categoryId ? null : categoryId,
                    )
                  }
                  onAddSubCategory={handleAddSubCategory}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
