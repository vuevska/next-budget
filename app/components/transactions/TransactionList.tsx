"use client";

import { useState, useEffect } from "react";
import { AccountType, Transaction, SubCategory } from "@prisma/client";
import AddTransactionModal from "./AddTransactionModal";
import {
  deleteTransaction,
  getTransactions,
} from "@/app/lib/services/transactions";
import LoadingTransactions from "./LoadingTransactions";
import EmptyTransactions from "./EmptyTransactions";
import TransactionsTable from "./TransactionsTable";
import { getSubCategories } from "@/app/lib/services/sub-category";
import DeleteTransactionModal from "./DeleteTransactionModal";
import { useRouter } from "next/navigation";
import TransactionsTableHeader from "./TransactionsTableHeader";

type TransactionListViewProps = Readonly<{
  account: AccountType;
  onBack: () => void;
}>;

type TransactionWithSubCategory = Transaction & { subCategory: SubCategory };

export default function TransactionList({
  account,
  onBack,
}: TransactionListViewProps) {
  const router = useRouter();
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
        const data = await getTransactions(account.id);
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

    router.refresh();
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
        setTransactions((prev) => prev.filter((t) => t.id !== id));

        router.refresh();

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
        subCategories={subCategories}
        onDelete={handleDeleteTransaction}
      />
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      <TransactionsTableHeader
        account={account}
        onBack={onBack}
        onNewTransaction={() => setIsModalOpen(true)}
      />

      <div className="flex-1 overflow-auto">{renderTransactionContent()}</div>

      {isModalOpen && (
        <AddTransactionModal
          userId={account.userId}
          accountId={account.id}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddTransaction}
          subCategories={subCategories}
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
