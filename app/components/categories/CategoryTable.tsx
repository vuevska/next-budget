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
import { SubCategory, SubCategoryPeriod } from "@prisma/client";

type CategoryTableProps = Readonly<{
  categoryList: any[];
  sensors: ReturnType<typeof useSensors>;
  collisionDetection: typeof closestCenter;
  expandedAddSubCategory: number | null;
  setExpandedAddSubCategory: (id: number | null) => void;
  handleAddSubCategory: (
    categoryId: number,
    newSubCategory: SubCategory,
    newSubCategoryPeriod: SubCategoryPeriod,
  ) => void;
  handleBudgetedClick: (subCategory: any) => void;
  showMoveBudgetModal: boolean;
  setShowMoveBudgetModal: (show: boolean) => void;
  moveFromSubCategoryId: number | null;
  moveBudget: (amount: number, fromId: number, toId: number) => Promise<void>;
  handleDragEnd: (event: DragEndEvent) => void;
  onCategoryRenamed?: (categoryId: number, newName: string) => void;
  onSubCategoryRenamed?: (subCategoryId: number, newName: string) => void;
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
  onCategoryRenamed,
  onSubCategoryRenamed,
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
              onCategoryRenamed={onCategoryRenamed}
              onSubCategoryRenamed={onSubCategoryRenamed}
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
