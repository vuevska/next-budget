"use client";

import { SubCategory, Transaction } from "@prisma/client";
import { useMemo } from "react";
import FilterRow from "./FilterRow";
import TransactionRow from "./TransactionRow";
import { useTransactionFilters } from "./filter/useTransactionFilters";
import { filterTransactions } from "./filter/transactionFilters";

type TransactionWithSubCategory = Transaction & {
  subCategory: SubCategory | null;
};

interface TransactionsTableProps {
  transactions: TransactionWithSubCategory[];
  subCategories: SubCategory[];
  onDelete: (id: number) => void;
}

const TransactionsTable = ({
  transactions,
  subCategories,
  onDelete,
}: TransactionsTableProps) => {
  const { filters, handleFilterChange, clearFilters } = useTransactionFilters();

  const filteredTransactions = useMemo(() => {
    return filterTransactions(transactions, filters);
  }, [transactions, filters]);

  return (
    <div className="p-3">
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="px-6 py-3 text-left font-semibold text-slate-700">
                Date
              </th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700">
                Payee
              </th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700">
                Description
              </th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700">
                Category
              </th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700">
                Amount
              </th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700">
                Type
              </th>
              <th className="px-6 py-3 text-center font-semibold text-slate-700">
                Action
              </th>
            </tr>
            <FilterRow
              filters={filters}
              subCategories={subCategories}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No transactions match the selected filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filteredTransactions.length > 0 && (
        <div className="mt-3 text-sm text-slate-600">
          Showing {filteredTransactions.length} of {transactions.length}{" "}
          transaction{transactions.length === 1 ? "" : "s"}
        </div>
      )}
    </div>
  );
};

export default TransactionsTable;
