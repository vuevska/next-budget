import { useState, useEffect } from "react";
import { AccountType, Transaction, SubCategory } from "@prisma/client";
import { FiArrowLeft } from "react-icons/fi";
import { Button } from "@radix-ui/themes";
import NewTransactionModal from "./NewTransactionModal";
import { deleteTransaction, getTransactions } from "@/app/lib/transactions";
import LoadingTransactions from "./LoadingTransactions";
import EmptyTransactions from "./EmptyTransactions";
import TransactionsTable from "./TransactionsTable";
import { getSubCategories } from "@/app/lib/categories";
import FormattedAmount from "../FormattedAmount";
import DeleteTransactionModal from "./DeleteTransactionModal";
import { IoMdAdd } from "react-icons/io";

type TransactionListViewProps = Readonly<{
  account: AccountType;
  onBack: () => void;
  onAccountUpdate: (account: AccountType) => void;
  onCategoriesUpdate?: (categories: any[]) => void;
}>;

type TransactionWithSubCategory = Transaction & { subCategory: SubCategory };

export default function TransactionListView({
  account,
  onBack,
  onAccountUpdate,
  onCategoriesUpdate,
}: TransactionListViewProps) {
  const [transactions, setTransactions] = useState<
    TransactionWithSubCategory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<
    number | null
  >(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getTransactions(account);
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [account.id]);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const data = await getSubCategories();
        setSubCategories(data);
      } catch (err) {
        console.error("Failed to load subcategories", err);
      }
    };

    fetchSubcategories();
  }, []);

  const handleAddTransaction = (newTransaction: TransactionWithSubCategory) => {
    setTransactions((prev) => [newTransaction, ...prev]);

    const amountChange = newTransaction.isInflow
      ? newTransaction.amount
      : -newTransaction.amount;

    const updatedAccount = {
      ...account,
      amount: account.amount + amountChange,
    };

    onAccountUpdate(updatedAccount);
  };

  const handleDeleteTransaction = async (id: number) => {
    setDeleteConfirmationId(id);
  };

  const confirmDeleteTransaction = async () => {
    const id = deleteConfirmationId;
    if (!id) return;

    try {
      const response = await deleteTransaction(id);
      if (response?.data?.success) {
        const deletedTransaction = transactions.find((t) => t.id === id);

        setTransactions((prev) => prev.filter((t) => t.id !== id));

        if (deletedTransaction) {
          const amountChange = deletedTransaction.isInflow
            ? -deletedTransaction.amount
            : deletedTransaction.amount;

          const updatedAccount = {
            ...account,
            amount: account.amount + amountChange,
          };

          onAccountUpdate(updatedAccount);
        }

        setDeleteConfirmationId(null);
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setDeleteConfirmationId(null);
    }
  };

  const renderTransactionContent = () => {
    if (loading) {
      return <LoadingTransactions />;
    }

    if (transactions.length === 0) {
      return <EmptyTransactions onCreateClick={() => setIsModalOpen(true)} />;
    }

    return (
      <TransactionsTable
        transactions={transactions}
        onDelete={handleDeleteTransaction}
      />
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
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
            onClick={() => setIsModalOpen(true)}
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

      <div className="flex-1 overflow-auto">{renderTransactionContent()}</div>

      {isModalOpen && (
        <NewTransactionModal
          accountId={account.id}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddTransaction}
          subCategories={subCategories}
          onCategoriesUpdate={onCategoriesUpdate}
        />
      )}

      {deleteConfirmationId !== null && (
        <DeleteTransactionModal
          onCancel={() => setDeleteConfirmationId(null)}
          onConfirm={confirmDeleteTransaction}
        />
      )}
    </div>
  );
}
