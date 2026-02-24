"use client";

import { useState, useMemo } from "react";
import { AccountType } from "@prisma/client";
import { FiPlus } from "react-icons/fi";
import { Button } from "@radix-ui/themes";
import AccountCard from "./AccountCard";
import AddAccountModal from "./AddAccountModal";
import EditAccountModal from "./EditAccountModal";
import FormattedAmount from "../FormattedAmount";

type AccountListProps = Readonly<{
  accounts: AccountType[];
  onAccountClick?: (id: number) => void;
}>;

export default function AccountList({
  accounts,
  onAccountClick,
}: AccountListProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const totalAmount = useMemo(
    () => accounts.reduce((sum, acc) => sum + acc.amount, 0),
    [accounts]
  );

  return (
    <>
      <div className="space-y-2 overflow-y-auto h-full pr-1">
        <div className="flex items-center justify-between px-1 pb-2 mb-1 border-b border-slate-600">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total</span>
          <span className="text-white text-sm font-bold">
            <FormattedAmount amount={totalAmount} />
          </span>
        </div>
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onEdit={(id, name) => setEditingAccount({ id, name })}
            onClick={onAccountClick}
          />
        ))}

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 transition-colors text-white rounded-lg text-sm font-medium"
        >
          <FiPlus size={18} />
          <span>Add Account</span>
        </Button>
      </div>

      {isAddModalOpen && (
        <AddAccountModal onClose={() => setIsAddModalOpen(false)} />
      )}

      {editingAccount && (
        <EditAccountModal
          id={editingAccount.id}
          currentName={editingAccount.name}
          onClose={() => setEditingAccount(null)}
        />
      )}
    </>
  );
}
