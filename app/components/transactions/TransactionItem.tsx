"use client";

import { Transaction, SubCategory } from "@prisma/client";
import { useState } from "react";
import { FiTrash2, FiEdit2 } from "react-icons/fi";
import { Button } from "@radix-ui/themes";
import FormattedAmount from "../FormattedAmount";

type TransactionWithSubCategory = Transaction & { subCategory: SubCategory };

type TransactionItemProps = Readonly<{
  transaction: TransactionWithSubCategory;
  onDelete: (id: number) => void;
}>;

export default function TransactionItem({
  transaction,
  onDelete,
}: TransactionItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        onDelete(transaction.id);
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction");
    } finally {
      setIsDeleting(false);
    }
  };

  const date = new Date(transaction.date);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="bg-white rounded-lg p-4 hover:bg-slate-50 transition-all border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md">
      <div className="flex items-center justify-between">
        {/* Left Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            {/* Category Badge */}
            <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-700">
              {transaction.subCategory.name}
            </div>

            {/* Type Badge */}
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                transaction.isInflow
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {transaction.isInflow ? "Inflow" : "Outflow"}
            </div>
          </div>

          <h3 className="text-slate-900 font-semibold text-base truncate">
            {transaction.payee}
          </h3>
          <p className="text-slate-600 text-sm mt-1 truncate">
            {transaction.description}
          </p>

          <div className="flex items-center gap-2 mt-2 text-slate-500 text-xs">
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{formattedTime}</span>
          </div>
        </div>

        {/* Right Content - Amount & Actions */}
        <div className="flex items-center gap-4 ml-4">
          <div className="text-right">
            <p
              className={`text-xl font-bold ${
                transaction.isInflow ? "text-green-600" : "text-red-600"
              }`}
            >
              {transaction.isInflow ? "+" : "-"}
              <FormattedAmount amount={transaction.amount} />
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Edit transaction"
              disabled={isDeleting}
            >
              <FiEdit2 size={16} className="text-slate-600" />
            </Button>
            <Button
              onClick={handleDelete}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete transaction"
              disabled={isDeleting}
            >
              <FiTrash2
                size={16}
                className={isDeleting ? "text-slate-400" : "text-red-600"}
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
