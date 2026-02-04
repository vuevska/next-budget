import { useState, useEffect } from "react";
import { AccountType, Transaction, SubCategory } from "@prisma/client";
import { FiArrowLeft, FiPlus, FiTrash2 } from "react-icons/fi";
import { Button } from "@radix-ui/themes";
import FormattedAmount from "../FormattedAmount";
import NewTransactionModal from "./NewTransactionModal";
import { formatDate } from "@/app/lib/formatDate";
import { deleteTransaction, getTransactions } from "@/app/lib/transactions";

type TransactionListViewProps = Readonly<{
  account: AccountType;
  onBack: () => void;
}>;

type TransactionWithSubCategory = Transaction & { subCategory: SubCategory };

export default function TransactionListView({
  account,
  onBack,
}: TransactionListViewProps) {
  const [transactions, setTransactions] = useState<
    TransactionWithSubCategory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getTransactions(account);
        setTransactions(data);
      } catch (error) {
        //todo change to seterror
        console.error("Error fetching transactions:", error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [account.id]);

  const handleAddTransaction = (newTransaction: TransactionWithSubCategory) => {
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const handleDeleteTransaction = async (id: number) => {
    if (
      !confirm("Are you sure you want to delete this transaction with id " + id)
    )
      return;

    try {
      const response = await deleteTransaction(id);
      if (response?.data?.success) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction");
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="bg-slate-500 border-b border-slate-600 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={onBack}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Go back"
            >
              <FiArrowLeft size={22} className="text-white" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">{account.name}</h1>
              <p className="text-indigo-100 text-sm mt-1">Account Details</p>
            </div>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 transition-all text-white rounded-lg font-medium shadow-lg"
          >
            <FiPlus size={20} />
            <span>New Transaction</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading transactions...</p>
            </div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-slate-700 text-lg">No transactions yet</p>
              <p className="text-slate-600 text-sm mt-2">
                Create your first transaction to get started
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white rounded-lg font-medium"
              >
                Create Transaction
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Transactions Table */}
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
                    <th className="px-6 py-3 text-right font-semibold text-slate-700">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-700">
                      Type
                    </th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-3 text-slate-900 font-medium">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-3 text-slate-900">
                        {transaction.payee}
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                          {transaction.subCategory.name}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-semibold">
                        <span
                          className={
                            transaction.isInflow
                              ? "text-green-600"
                              : "text-red-600"
                          }
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
                          onClick={() =>
                            handleDeleteTransaction(transaction.id)
                          }
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors inline-flex"
                          title="Delete transaction"
                        >
                          <FiTrash2 size={16} className="text-red-600" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <NewTransactionModal
          accountId={account.id}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddTransaction}
        />
      )}
    </div>
  );
}
