"use client";

import { useEffect, useRef, useState, forwardRef } from "react";
import {
  Category,
  SubCategory,
  SubCategoryPeriod,
  ToBudget,
} from "@prisma/client";
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
import { persistCategoryOrder } from "@/app/lib/services/category";
import {
  getBudgetPeriodSnapshot,
  moveBudgetedAmount,
} from "@/app/lib/services/budget";
import ToBudgetModal from "../budget/ToBudgetModal";
import { useRouter } from "next/navigation";
import CategoryHeader from "./CategoryHeader";
import EmptyCategories from "./EmptyCategories";
import CategoryTable from "./CategoryTable";

export type CategoryBudgetView = Category & {
  SubCategory: (SubCategoryPeriod & {
    subCategory: SubCategory;
  })[];
};

export type CategoryListProps = Readonly<{
  categories: CategoryBudgetView[];
  onAccountClick?: (id: number) => void;
  toBeBudgeted: ToBudget | null;
}>;

export type CategoryListRef = {
  refreshToBudgeted: () => Promise<void>;
};

const CategoryList = forwardRef<CategoryListRef, CategoryListProps>(
  ({ categories, toBeBudgeted }: CategoryListProps, ref) => {
    const router = useRouter();
    const [categoryList, setCategoryList] = useState<CategoryBudgetView[]>(
      categories as any,
    );
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
    const now = new Date();
    const [activeMonth, setActiveMonth] = useState(now.getMonth() + 1);
    const [activeYear, setActiveYear] = useState(now.getFullYear());
    const [toBudgetAmount, setToBudgetAmount] = useState(
      toBeBudgeted?.amount ?? 0,
    );

    useEffect(() => {
      setToBudgetAmount(toBeBudgeted?.amount ?? 0);
    }, [toBeBudgeted]);

    const refreshSnapshot = async (month: number, year: number) => {
      const snapshot = await getBudgetPeriodSnapshot(month, year);
      setCategoryList(snapshot.categories);
      setToBudgetAmount(snapshot.toBudget?.amount ?? 0);
    };

    useEffect(() => {
      refreshSnapshot(activeMonth, activeYear).catch((err) => {
        console.error("Failed to load budget snapshot", err);
      });
    }, [activeMonth, activeYear]);
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

    const handleAddCategory = (newCategory: CategoryBudgetView) => {
      setCategoryList([newCategory, ...categoryList]);
      setShowAddCategory(false);
      router.refresh();
    };

    const handleAddSubCategory = (
      categoryId: number,
      newSubCategory: SubCategory,
      newSubCategoryPeriod: SubCategoryPeriod,
    ) => {
      const subCategoryWithBudget: SubCategoryPeriod = {
        ...newSubCategory,
        budgeted: 0,
        spent: 0,
        periodId: activeMonth,
        createdAt: new Date(),
        updatedAt: new Date(),
        subCategoryId: newSubCategory.id,
      };
      setCategoryList((prevList) =>
      prevList.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              SubCategory: [...cat.SubCategory, subCategoryWithBudget as any],
            }
          : cat
      )
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
      updatedSubCategory?: SubCategoryPeriod,
    ) => {
      await refreshSnapshot(activeMonth, activeYear);
    };

    const handlePrevMonth = () => {
      if (activeMonth === 1) {
        setActiveMonth(12);
        setActiveYear((y) => y - 1);
      } else {
        setActiveMonth((m) => m - 1);
      }
    };

    const handleNextMonth = () => {
      if (activeMonth === 12) {
        setActiveMonth(1);
        setActiveYear((y) => y + 1);
      } else {
        setActiveMonth((m) => m + 1);
      }
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
          activeMonth,
          activeYear,
        );
      } catch (err) {
        console.error("Failed to move budget:", err);
      }

      if (!result) {
        setShowMoveBudgetModal(false);
        return;
      }

      setShowMoveBudgetModal(false);
      await refreshSnapshot(activeMonth, activeYear);
    };

    const handleCategoryRenamed = (categoryId: number, newName: string) => {
      setCategoryList((prev) =>
        prev.map((cat) =>
          cat.id === categoryId ? { ...cat, name: newName } : cat,
        ),
      );
    };

    const handleSubCategoryRenamed = (
      subCategoryId: number,
      newName: string,
    ) => {
      setCategoryList((prev) =>
        prev.map((cat) => ({
          ...cat,
          SubCategory: cat.SubCategory.map((sub: any) =>
            sub.id === subCategoryId || sub.subCategoryId === subCategoryId
              ? { ...sub, name: newName }
              : sub,
          ),
        })),
      );
    };

    return (
      <div className="w-full min-h-full bg-gradient-to-br from-slate-50 via-white to-slate-50 p-8">
        {/* Header Section */}
        <CategoryHeader
          amount={toBudgetAmount}
          setShowBudgetModal={() => setShowBudgetModal(true)}
          showAddCategory={showAddCategory}
          setShowAddCategory={() => setShowAddCategory(true)}
          month={activeMonth}
          year={activeYear}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        {/* Add Category Form */}
        {showAddCategory && (
          <div className="mb-4 bg-white rounded-xl border border-slate-200 px-3 sm:px-4 py-2.5 shadow-sm">
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
            onCategoryRenamed={handleCategoryRenamed}
            onSubCategoryRenamed={handleSubCategoryRenamed}
          />
        )}

        {/* Budget Allocation Modal */}
        <ToBudgetModal
          isOpen={showBudgetModal}
          onClose={() => setShowBudgetModal(false)}
          toBeBudgeted={toBudgetAmount}
          categories={categoryList}
          onSuccess={handleBudgetSuccess}
          month={activeMonth}
          year={activeYear}
        />
      </div>
    );
  },
);

export default CategoryList;
