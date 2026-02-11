"use client";

import { useState, useRef } from "react";
import { AccountType, Category, ToBudget, User } from "@prisma/client";
import CategoryList, { type CategoryListRef } from "./categories/CategoryList";
import SidePanelWrapper from "./SidePanelWrapper";
import SidePanel from "./SidePanel";
import TransactionList from "./transactions/TransactionList";

type LayoutContentProps = Readonly<{
  accounts: AccountType[];
  categories: (Category & { SubCategory: any[] })[];
  user: User;
  toBeBudgeted: ToBudget | null;
}>;

export default function LayoutContent({
  accounts,
  categories,
  user,
  toBeBudgeted,
}: LayoutContentProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null,
  );
  const categoryListRef = useRef<CategoryListRef>(null);

  const selectedAccount =
    accounts.find((a) => a.id === selectedAccountId) ?? null;

  return (
    <div className="flex h-screen overflow-hidden">
      <SidePanelWrapper>
        <SidePanel
          accounts={accounts}
          user={user}
          onSelectAccount={setSelectedAccountId}
        />
      </SidePanelWrapper>

      <main className="flex-1 h-full overflow-y-auto">
        {selectedAccount ? (
          <TransactionList
            account={selectedAccount}
            onBack={() => setSelectedAccountId(null)}
          />
        ) : (
          <CategoryList
            ref={categoryListRef}
            categories={categories}
            toBeBudgeted={toBeBudgeted}
          />
        )}
      </main>
    </div>
  );
}
