"use client";

import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Category, SubCategory } from "@prisma/client";
import { IoMdAdd } from "react-icons/io";
import { FaWallet } from "react-icons/fa";
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
} from "@dnd-kit/sortable";
import AddCategoryForm from "./AddCategoryForm";
import { persistCategoryOrder, getToBeBudgeted } from "@/app/lib/categories";
import { moveBudgetedAmount } from "@/app/lib/moveBudget";
import { SortableCategoryItem } from "./SortableCategoryItem";
import FormattedAmount from "../FormattedAmount";
import ToBudgetModal from "../budget/ToBudgetModal";
import { Button } from "@radix-ui/themes";
import MoveBudgetModal from "./MoveBudgetModal";

type SubCategoryWithBudgeted = SubCategory & { budgeted: number };

type CategoryListProps = Readonly<{
  categories: (Category & { SubCategory: SubCategory[] })[];
  onAccountClick?: (id: number) => void;
}>;

export type CategoryListRef = {
  refreshToBudgeted: () => Promise<void>;
};

const CategoryList = forwardRef<CategoryListRef, CategoryListProps>(
  ({ categories, onAccountClick }: CategoryListProps, ref) => {
    const [categoryList, setCategoryList] = useState(categories);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [expandedAddSubCategory, setExpandedAddSubCategory] = useState<
      number | null
    >(null);
    const [toBeBudgeted, setToBeBudgeted] = useState(0);
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

    useEffect(() => {
      const fetchToBeBudgeted = async () => {
        try {
          const amount = await getToBeBudgeted();
          setToBeBudgeted(amount);
        } catch (error) {
          console.error("Failed to fetch to-be-budgeted amount:", error);
        }
      };

      fetchToBeBudgeted();
    }, []);

    useImperativeHandle(ref, () => ({
      refreshToBudgeted: async () => {
        try {
          const amount = await getToBeBudgeted();
          setToBeBudgeted(amount);
        } catch (error) {
          console.error("Failed to refresh to-be-budgeted amount:", error);
        }
      },
    }));

    const handleAddCategory = (
      newCategory: Category & { SubCategory: SubCategory[] },
    ) => {
      setCategoryList([newCategory, ...categoryList]);
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

    const handleBudgetSuccess = async (
      allocatedAmount: number,
      updatedSubCategory?: SubCategoryWithBudgeted,
    ) => {
      try {
        const newAmount = await getToBeBudgeted();
        setToBeBudgeted(newAmount);

        // Refresh the subcategory budgeted amount in the UI
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
      } catch (error) {
        console.error("Failed to refresh budget amounts:", error);
      }
    };

    const moveBudget = async (
      amount: number,
      fromSubCategoryId: number,
      toSubCategoryId: number,
    ) => {
      let result = null;
      let error = null;
      try {
        result = await moveBudgetedAmount(
          amount,
          fromSubCategoryId,
          toSubCategoryId,
        );
      } catch (err) {
        error = err;
      }
      if (result) {
        setCategoryList((prev) =>
          prev.map((cat) => {
            return {
              ...cat,
              SubCategory: cat.SubCategory.map((subCat) => {
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
              }),
            };
          }),
        );
      }
      setShowMoveBudgetModal(false);
    };

    return (
      <div className="w-full min-h-full bg-gradient-to-br from-slate-50 via-white to-slate-50 p-8">
        {/* Header Section */}

        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="flex-shrink-0">
            <h1 className="text-4xl font-bold text-slate-900 mt-2">
              January 2026
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Manage your spending categories
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 w-full sm:w-auto sm:flex-1 sm:justify-center">
            {toBeBudgeted > 0 && (
              <Button
                onClick={() => setShowBudgetModal(true)}
                className="bg-white rounded-xl border-2 border-green-200 p-4 shadow-sm hover:shadow-md hover:border-green-300 transition-all duration-200 cursor-pointer group w-full sm:w-auto"
              >
                <p className="text-xs font-normal text-slate-500 uppercase tracking-wide mb-1 group-hover:text-green-600 transition-colors">
                  To be Budgeted
                </p>
                <p className="text-xl font-bold text-green-600 group-hover:scale-105 transition-transform origin-left">
                  <FormattedAmount amount={toBeBudgeted} />
                </p>
              </Button>
            )}
          </div>

          <Button
            onClick={() => setShowAddCategory(!showAddCategory)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm group w-full sm:w-auto flex-shrink-0"
          >
            <IoMdAdd
              size={18}
              className="group-hover:rotate-90 transition-transform"
            />
            New Category
          </Button>
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
          <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
              <FaWallet size={18} className="text-slate-400" />
            </div>
            <h3 className="text-slate-800 text-lg font-semibold mb-1">
              No Categories Yet
            </h3>
            <p className="text-slate-600 text-sm">
              Start organizing your budget by creating your first category
            </p>
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
                        expandedAddSubCategory === categoryId
                          ? null
                          : categoryId,
                      )
                    }
                    onAddSubCategory={handleAddSubCategory}
                    onBudgetedClick={handleBudgetedClick}
                  />
                ))}
                {/* Move Budget Modal */}
                {showMoveBudgetModal && moveFromSubCategoryId !== null && (
                  <MoveBudgetModal
                    isOpen={showMoveBudgetModal}
                    onClose={() => setShowMoveBudgetModal(false)}
                    categories={categoryList}
                    defaultFromSubCategoryId={moveFromSubCategoryId}
                    onMove={moveBudget}
                  />
                )}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Budget Allocation Modal */}
        <ToBudgetModal
          isOpen={showBudgetModal}
          onClose={() => setShowBudgetModal(false)}
          toBeBudgeted={toBeBudgeted}
          categories={categoryList}
          onSuccess={handleBudgetSuccess}
        />
      </div>
    );
  },
);

CategoryList.displayName = "CategoryList";

export default CategoryList;
