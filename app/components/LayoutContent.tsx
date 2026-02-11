"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import { AccountType, Category, User } from "@prisma/client";
import CategoryList, { type CategoryListRef } from "./categories/CategoryList";
import TransactionListView from "./transactions/TransactionListView";
import SidePanelWrapper from "./SidePanelWrapper";
import SidePanel from "./SidePanel";

type LayoutContentProps = Readonly<{
  accounts: AccountType[];
  categories: (Category & { SubCategory: any[] })[];
  user: User;
}>;

export default function LayoutContent({
  accounts: initialAccounts,
  categories: initialCategories,
  user,
}: LayoutContentProps) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [categories, setCategories] = useState(initialCategories);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null,
  );
  const categoryListRef = useRef<CategoryListRef>(null);

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId],
  );

  const handleAccountUpdate = useCallback((updatedAccount: AccountType) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc)),
    );
  }, []);

  const handleAccountCreate = useCallback((newAccount: AccountType) => {
    setAccounts((prev) => [...prev, newAccount]);
    categoryListRef.current?.refreshToBudgeted();
  }, []);

  const handleCategoriesUpdate = useCallback(
    (updatedCategories: (Category & { SubCategory: any[] })[]) => {
      setCategories(updatedCategories);
    },
    [],
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <SidePanelWrapper>
        <SidePanel
          accounts={accounts}
          user={user}
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
          <CategoryList ref={categoryListRef} categories={categories} />
        )}
      </main>
    </div>
  );
}
