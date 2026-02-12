"use client";

import { useRef, useState, forwardRef } from "react";
import { Category, SubCategory, ToBudget } from "@prisma/client";
import {
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import AddCategoryForm from "./AddCategoryForm";
import { persistCategoryOrder } from "@/app/lib/categories";
import { moveBudgetedAmount } from "@/app/lib/services/moveBudget";
import ToBudgetModal from "../budget/ToBudgetModal";
import { useRouter } from "next/navigation";
import CategoryHeader from "./CategoryHeader";
import EmptyCategories from "./EmptyCategories";
import CategoryTable from "./CategoryTable";

type SubCategoryWithBudgeted = SubCategory & { budgeted: number };

type CategoryListProps = Readonly<{
  categories: (Category & { SubCategory: SubCategory[] })[];
  onAccountClick?: (id: number) => void;
  toBeBudgeted: ToBudget | null;
}>;

export type CategoryListRef = {
  refreshToBudgeted: () => Promise<void>;
};

const CategoryList = forwardRef<CategoryListRef, CategoryListProps>(
  ({ categories, toBeBudgeted }: CategoryListProps, ref) => {
    const router = useRouter();
    const [categoryList, setCategoryList] = useState(categories);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [expandedAddSubCategory, setExpandedAddSubCategory] = useState<
      number | null
    >(null);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [showMoveBudgetModal, setShowMoveBudgetModal] = useState(false);
    const [moveFromSubCategoryId, setMoveFromSubCategoryId] = useState<
      number | null
    >(null);
    const handleBudgetedClick = (subCategory: SubCategory) => {
      setMoveFromSubCategoryId(subCategory.id);
      setShowMoveBudgetModal(true);
    };
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 8,
        },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      }),
    );

    const handleAddCategory = (
      newCategory: Category & { SubCategory: SubCategory[] },
    ) => {
      setCategoryList([newCategory, ...categoryList]);
      setShowAddCategory(false);
      router.refresh();
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
      router.refresh();
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

    const handleBudgetSuccess = async (
      allocatedAmount: number,
      updatedSubCategory?: SubCategoryWithBudgeted,
    ) => {
      if (updatedSubCategory) {
        setCategoryList(
          categoryList.map((cat) => ({
            ...cat,
            SubCategory: cat.SubCategory.map((subCat) =>
              subCat.id === updatedSubCategory.id
                ? { ...subCat, budgeted: updatedSubCategory.budgeted }
                : subCat,
            ),
          })),
        );
      }
      router.refresh();
    };

    const moveBudget = async (
      amount: number,
      fromSubCategoryId: number,
      toSubCategoryId: number,
    ) => {
      let result = null;
      try {
        result = await moveBudgetedAmount(
          amount,
          fromSubCategoryId,
          toSubCategoryId,
        );
      } catch (err) {
        console.error("Failed to move budget:", err);
      }

      if (!result) {
        setShowMoveBudgetModal(false);
        return;
      }

      const updateSubCategory = (subCat: SubCategory) => {
        if (subCat.id === result.fromSubCategory.id) {
          return {
            ...subCat,
            budgeted: result.fromSubCategory.budgeted,
          };
        }
        if (subCat.id === result.toSubCategory.id) {
          return {
            ...subCat,
            budgeted: result.toSubCategory.budgeted,
          };
        }
        return subCat;
      };

      setCategoryList((prev) =>
        prev.map((cat) => ({
          ...cat,
          SubCategory: cat.SubCategory.map(updateSubCategory),
        })),
      );

      setShowMoveBudgetModal(false);
      router.refresh();
    };

    return (
      <div className="w-full min-h-full bg-gradient-to-br from-slate-50 via-white to-slate-50 p-8">
        {/* Header Section */}
        <CategoryHeader
          amount={toBeBudgeted!.amount}
          setShowBudgetModal={() => setShowBudgetModal(true)}
          setShowAddCategory={() => setShowAddCategory(!showAddCategory)}
        />

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
          <EmptyCategories />
        ) : (
          <CategoryTable
            categoryList={categoryList}
            sensors={sensors}
            collisionDetection={closestCenter}
            expandedAddSubCategory={expandedAddSubCategory}
            setExpandedAddSubCategory={setExpandedAddSubCategory}
            handleAddSubCategory={handleAddSubCategory}
            handleBudgetedClick={handleBudgetedClick}
            showMoveBudgetModal={showMoveBudgetModal}
            setShowMoveBudgetModal={setShowMoveBudgetModal}
            moveFromSubCategoryId={moveFromSubCategoryId}
            moveBudget={moveBudget}
            handleDragEnd={handleDragEnd}
          />
        )}

        {/* Budget Allocation Modal */}
        <ToBudgetModal
          isOpen={showBudgetModal}
          onClose={() => setShowBudgetModal(false)}
          toBeBudgeted={toBeBudgeted!.amount}
          categories={categoryList}
          onSuccess={handleBudgetSuccess}
        />
      </div>
    );
  },
);

export default CategoryList;
