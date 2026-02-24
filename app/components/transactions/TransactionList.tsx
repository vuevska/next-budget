"use client";

import { useState, useEffect } from "react";
import { AccountType, Transaction, SubCategory, Payee } from "@prisma/client";
import AddTransactionModal from "./AddTransactionModal";
import EditTransactionModal from "./EditTransactionModal";
import {
  deleteTransaction,
  getTransactions,
} from "@/app/lib/services/transactions";
import LoadingTransactions from "./LoadingTransactions";
import EmptyTransactions from "./EmptyTransactions";
import TransactionsTable from "./TransactionsTable";
import { getSubCategories } from "@/app/lib/services/sub-category";
import { getPayees } from "@/app/lib/services/payees";
import DeleteTransactionModal from "./DeleteTransactionModal";
import { useRouter } from "next/navigation";
import TransactionsTableHeader from "./TransactionsTableHeader";

type TransactionListViewProps = Readonly<{
  account: AccountType;
  onBack: () => void;
}>;

type TransactionWithRelations = Transaction & {
  subCategory: SubCategory | null;
  payee: Payee;
  linkedTransactionId?: number | null;
};

export default function TransactionList({
  account,
  onBack,
}: TransactionListViewProps) {
  const router = useRouter();
  const [transactions, setTransactions] = useState<
    TransactionWithRelations[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [payees, setPayees] = useState<Payee[]>([]);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<
    number | null
  >(null);
  const [editingTransaction, setEditingTransaction] = useState<
    TransactionWithRelations | null
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

  useEffect(() => {
    const fetchPayees = async () => {
      try {
        const data = await getPayees();
        setPayees(data);
      } catch (err) {
        console.error("Failed to load payees", err);
      }
    };

    fetchPayees();
  }, []);

  const handleAddTransaction = (newTransaction: TransactionWithRelations) => {
    setTransactions((prev) => [newTransaction, ...prev]);

    router.refresh();
  };

  const handleUpdateTransaction = (updatedTransaction: TransactionWithRelations) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t))
    );

    router.refresh();
  };

  const handleEditTransaction = (transaction: TransactionWithRelations) => {
    setEditingTransaction(transaction);
  };

  const handleDeleteTransaction = async (id: number) => {
    setDeleteConfirmationId(id);
  };

  const confirmDeleteTransaction = async () => {
    const id = deleteConfirmationId;
    if (!id) return;

    try {
      const response = await deleteTransaction(id);
      if (response?.status === 200) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));

        router.refresh();

        setDeleteConfirmationId(null);
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setDeleteConfirmationId(null);
    }
  };

  // Check if the transaction being deleted is a transfer
  const deletingTransaction = deleteConfirmationId
    ? transactions.find((t) => t.id === deleteConfirmationId)
    : null;
  const isDeletingTransfer = !!(deletingTransaction as any)?.linkedTransactionId;

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
        onEdit={handleEditTransaction}
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
          payees={payees}
          onPayeesUpdate={setPayees}
        />
      )}

      {editingTransaction && (
        <EditTransactionModal
          userId={account.userId}
          accountId={account.id}
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onUpdate={handleUpdateTransaction}
          subCategories={subCategories}
          payees={payees}
          onPayeesUpdate={setPayees}
        />
      )}

      {deleteConfirmationId !== null && (
        <DeleteTransactionModal
          onCancel={() => setDeleteConfirmationId(null)}
          onConfirm={confirmDeleteTransaction}
          isTransfer={isDeletingTransfer}
        />
      )}
    </div>
  );
}
