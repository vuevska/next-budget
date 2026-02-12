import {
  closestCenter,
  DndContext,
  DragEndEvent,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableCategoryItem } from "./SortableCategoryItem";
import MoveBudgetModal from "./MoveBudgetModal";
import { Category, SubCategory } from "@prisma/client";

type CategoryTableProps = Readonly<{
  categoryList: (Category & { SubCategory: SubCategory[] })[];
  sensors: ReturnType<typeof useSensors>;
  collisionDetection: typeof closestCenter;
  expandedAddSubCategory: number | null;
  setExpandedAddSubCategory: (id: number | null) => void;
  handleAddSubCategory: (
    categoryId: number,
    newSubCategory: SubCategory,
  ) => void;
  handleBudgetedClick: (subCategory: SubCategory) => void;
  showMoveBudgetModal: boolean;
  setShowMoveBudgetModal: (show: boolean) => void;
  moveFromSubCategoryId: number | null;
  moveBudget: (amount: number, fromId: number, toId: number) => Promise<void>;
  handleDragEnd: (event: DragEndEvent) => void;
}>;

const CategoryTable = ({
  categoryList,
  sensors,
  collisionDetection,
  expandedAddSubCategory,
  setExpandedAddSubCategory,
  handleAddSubCategory,
  handleBudgetedClick,
  showMoveBudgetModal,
  setShowMoveBudgetModal,
  moveFromSubCategoryId,
  moveBudget,
  handleDragEnd,
}: CategoryTableProps) => {
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
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
  );
};

export default CategoryTable;
