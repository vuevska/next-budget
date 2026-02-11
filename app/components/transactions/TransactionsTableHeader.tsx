import { Button } from "@radix-ui/themes";
import { FiArrowLeft } from "react-icons/fi";
import FormattedAmount from "../FormattedAmount";
import { IoMdAdd } from "react-icons/io";
import { AccountType } from "@prisma/client";

type TransactionsTableHeaderProps = Readonly<{
  account: AccountType;
  onBack: () => void;
  onNewTransaction: () => void;
}>;

export default function TransactionsTableHeader({
  account,
  onBack,
  onNewTransaction,
}: TransactionsTableHeaderProps) {
  return (
    <div className="bg-slate-500 border-b border-slate-600 p-8 shadow-lg mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-2 mt-2">
        <div className="flex items-center gap-3 flex-shrink-0">
          <Button
            onClick={onBack}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            title="Go back"
          >
            <FiArrowLeft size={22} className="text-white" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">{account.name}</h1>
            <p className="text-indigo-100 text-sm mt-1">
              Balance: <FormattedAmount amount={account.amount} />
            </p>
          </div>
        </div>
        <div className="sm:flex-1"></div>
        <Button
          onClick={() => onNewTransaction}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm group w-full sm:w-auto flex-shrink-0"
        >
          <IoMdAdd
            size={18}
            className="group-hover:rotate-90 transition-transform"
          />
          New Transaction
        </Button>
      </div>
    </div>
  );
}
