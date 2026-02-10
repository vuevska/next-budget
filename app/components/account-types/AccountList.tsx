import { useState, useEffect } from "react";
import { AccountType } from "@prisma/client";
import { FiPlus } from "react-icons/fi";
import { Button } from "@radix-ui/themes";
import AccountCard from "./AccountCard";
import AddAccountModal from "./AddAccountModal";
import EditAccountModal from "./EditAccountModal";

type AccountListProps = Readonly<{
  accounts: AccountType[];
  onAccountClick?: (id: number) => void;
  onAccountCreate?: (account: AccountType) => void;
}>;

export default function AccountList({
  accounts,
  onAccountClick,
  onAccountCreate,
}: AccountListProps) {
  const [accountsList, setAccountsList] = useState(accounts);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<{
    id: number;
    name: string;
  } | null>(null);

  useEffect(() => {
    setAccountsList(accounts);
  }, [accounts]);

  const handleAddAccount = (account: AccountType) => {
    setAccountsList((prev) => [...prev, account]);
    onAccountCreate?.(account);
  };

  const handleEditAccount = (updated: AccountType) => {
    setAccountsList((prev) =>
      prev.map((acc) => (acc.id === updated.id ? updated : acc)),
    );
  };

  return (
    <>
      <div className="space-y-2 overflow-y-auto h-full pr-1">
        {accountsList.map((account) => (
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
        <AddAccountModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddAccount}
        />
      )}

      {editingAccount && (
        <EditAccountModal
          id={editingAccount.id}
          currentName={editingAccount.name}
          onClose={() => setEditingAccount(null)}
          onSave={handleEditAccount}
        />
      )}
    </>
  );
}
