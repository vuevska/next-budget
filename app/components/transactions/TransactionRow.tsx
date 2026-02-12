import { SubCategory, Transaction } from "@prisma/client";
import { Button } from "@radix-ui/themes";
import { FiTrash2 } from "react-icons/fi";
import FormattedAmount from "../FormattedAmount";
import { formatDate } from "@/app/lib/formatDate";

type TransactionWithSubCategory = Transaction & {
  subCategory: SubCategory | null;
};

interface TransactionRowProps {
  transaction: TransactionWithSubCategory;
  onDelete: (id: number) => void;
}

const TransactionRow = ({ transaction, onDelete }: TransactionRowProps) => {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-3 text-slate-900 font-medium">
        {formatDate(transaction.date)}
      </td>
      <td className="px-6 py-3 text-slate-900">{transaction.payee}</td>
      <td className="px-6 py-3 text-slate-600">{transaction.description}</td>
      <td className="px-6 py-3 text-slate-600">
        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
          {transaction.subCategory
            ? transaction.subCategory.name
            : "To be Budgeted"}
        </span>
      </td>
      <td className="px-6 py-3 text-right font-semibold">
        <span
          className={transaction.isInflow ? "text-green-600" : "text-red-600"}
        >
          {transaction.isInflow ? "+" : "-"}
          <FormattedAmount amount={transaction.amount} />
        </span>
      </td>
      <td className="px-6 py-3 text-center">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            transaction.isInflow
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {transaction.isInflow ? "Inflow" : "Outflow"}
        </span>
      </td>
      <td className="px-6 py-3 text-center">
        <Button
          onClick={() => onDelete(transaction.id)}
          className="p-2 hover:bg-red-100 rounded-lg transition-colors inline-flex"
          title="Delete transaction"
        >
          <FiTrash2 size={16} className="text-red-600" />
        </Button>
      </td>
    </tr>
  );
};

export default TransactionRow;
