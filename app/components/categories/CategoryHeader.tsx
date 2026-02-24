import FormattedAmount from "../FormattedAmount";
import { Button } from "@radix-ui/themes";
import { IoMdAdd } from "react-icons/io";

type CategoryHeaderProps = Readonly<{
  amount: number;
  setShowBudgetModal: () => void;
  showAddCategory: boolean;
  setShowAddCategory: () => void;
  month: number;
  year: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}>;

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CategoryHeader = ({
  amount,
  setShowBudgetModal,
  showAddCategory,
  setShowAddCategory,
  month,
  year,
  onPrevMonth,
  onNextMonth,
}: CategoryHeaderProps) => {
  const monthLabel = `${monthNames[month - 1]} ${year}`;

  return (
    <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
      <div className="flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button
            onClick={onPrevMonth}
            className="px-2 py-1 text-sm bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg"
          >
            ◀
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
            {monthLabel}
          </h1>
          <Button
            onClick={onNextMonth}
            className="px-2 py-1 text-sm bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg"
          >
            ▶
          </Button>
        </div>
        <p className="text-slate-600 text-sm mt-1">
          Manage your spending categories
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 w-full sm:w-auto sm:flex-1 sm:justify-center">
        {amount > 0 && (
          <Button
            onClick={setShowBudgetModal}
            className="bg-white rounded-xl border-2 border-green-200 p-4 shadow-sm hover:shadow-md hover:border-green-300 transition-all duration-200 cursor-pointer group w-full sm:w-auto"
          >
            <p className="text-xs font-normal text-slate-500 uppercase tracking-wide mb-1 group-hover:text-green-600 transition-colors">
              To be Budgeted
            </p>
            <p className="text-xl font-bold text-green-600 group-hover:scale-105 transition-transform origin-left">
              <FormattedAmount amount={amount} />
            </p>
          </Button>
        )}
      </div>

      <Button
        onClick={setShowAddCategory}
        disabled={showAddCategory}
        className={`flex items-center justify-center gap-2 px-5 py-3 text-white rounded-xl transition-all duration-200 shadow-lg font-medium text-sm group w-full sm:w-auto flex-shrink-0 ${
          showAddCategory
            ? "bg-indigo-400 cursor-not-allowed opacity-60 shadow-none"
            : "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl"
        }`}
      >
        <IoMdAdd
          size={18}
          className={showAddCategory ? "" : "group-hover:rotate-90 transition-transform"}
        />
        New Category
      </Button>
    </div>
  );
};

export default CategoryHeader;
