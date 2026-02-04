import { Button } from "@radix-ui/themes";
import React from "react";

interface EmptyTransactionsProps {
  onCreateClick: () => void;
}

const EmptyTransactions = ({ onCreateClick }: EmptyTransactionsProps) => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-6xl mb-4">📭</div>
        <p className="text-slate-700 text-lg">No transactions yet</p>
        <p className="text-slate-600 text-sm mt-2">
          Create your first transaction to get started
        </p>
        <Button
          onClick={onCreateClick}
          className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white rounded-lg font-medium"
        >
          Create Transaction
        </Button>
      </div>
    </div>
  );
};

export default EmptyTransactions;
