"use client";

import { useState, useRef } from "react";
import { AccountType, Category } from "@prisma/client";
import CategoryList, { type CategoryListRef } from "./categories/CategoryList";
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
  categories: initialCategories,
}: LayoutContentProps) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [categories, setCategories] = useState(initialCategories);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null,
  );
  const { data: session } = useSession();
  const categoryListRef = useRef<CategoryListRef>(null);

  const selectedAccount = selectedAccountId
    ? accounts.find((a) => a.id === selectedAccountId)
    : null;

  const handleAccountUpdate = (updatedAccount: AccountType) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc)),
    );
  };

  const handleAccountCreate = (newAccount: AccountType) => {
    setAccounts((prev) => [...prev, newAccount]);
    // Refresh the to-be-budgeted amount in CategoryList
    categoryListRef.current?.refreshToBudgeted();
  };

  const handleCategoriesUpdate = (
    updatedCategories: (Category & { SubCategory: any[] })[],
  ) => {
    setCategories(updatedCategories);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <SidePanelWrapper>
        <SidePanel
          accounts={accounts}
          user={session?.user}
          onSelectAccount={setSelectedAccountId}
          onAccountCreate={handleAccountCreate}
        />
      </SidePanelWrapper>

      <main className="flex-1 h-full overflow-y-auto">
        {selectedAccount ? (
          <TransactionListView
            account={selectedAccount}
            onBack={() => setSelectedAccountId(null)}
            onAccountUpdate={handleAccountUpdate}
            onCategoriesUpdate={handleCategoriesUpdate}
          />
        ) : (
          <CategoryList
            ref={categoryListRef}
            categories={categories}
          />
        )}
      </main>
    </div>
  );
}
