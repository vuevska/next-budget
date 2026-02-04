"use client";

import { useState } from "react";
import { AccountType, Category } from "@prisma/client";
import CategoryList from "./categories/CategoryList";
import TransactionListView from "./transactions/TransactionListView";
import { useSession } from "next-auth/react";
import SidePanelWrapper from "./SidePanelWrapper";
import SidePanel from "./SidePanel";

type LayoutContentProps = Readonly<{
  accounts: AccountType[];
  categories: (Category & { SubCategory: any[] })[];
}>;

export default function LayoutContent({
  accounts: initialAccounts,
  categories,
}: LayoutContentProps) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null,
  );
  const { data: session } = useSession();

  const selectedAccount = selectedAccountId
    ? accounts.find((a) => a.id === selectedAccountId)
    : null;

  const handleAccountUpdate = (updatedAccount: AccountType) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc)),
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <SidePanelWrapper>
        <SidePanel
          accounts={accounts}
          user={session?.user}
          onSelectAccount={setSelectedAccountId}
        />
      </SidePanelWrapper>

      <main className="flex-1 h-full overflow-y-auto">
        {selectedAccount ? (
          <TransactionListView
            account={selectedAccount}
            onBack={() => setSelectedAccountId(null)}
            onAccountUpdate={handleAccountUpdate}
          />
        ) : (
          <CategoryList categories={categories} />
        )}
      </main>
    </div>
  );
}
