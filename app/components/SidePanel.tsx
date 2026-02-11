"use client";

import { Box } from "@radix-ui/themes";
import SignOutButton from "./signout/SignOutButton";
import { TbUserDollar } from "react-icons/tb";
import { AccountType } from "@prisma/client";
import AccountList from "./account-types/AccountList";

type SidePanelProps = Readonly<{
  accounts: AccountType[];
  user?: {
    name?: string | null;
    email?: string | null;
  };
  onSelectAccount?: (id: number | null) => void;
}>;

export default function SidePanel({
  accounts,
  user,
  onSelectAccount,
}: SidePanelProps) {
  return (
    <>
      <div className="m-2 p-5 text-white">
        <h2 className="text-xl font-bold">Next Budget</h2>
      </div>

      <Box className="flex-1 p-3 overflow-hidden">
        <AccountList
          accounts={accounts}
          onAccountClick={(id) => onSelectAccount?.(id)}
        />
      </Box>

      <div className="p-5 border-t border-slate-700">
        {user && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                <TbUserDollar size={28} color="white" />
              </div>

              <div>
                <p className="text-white font-medium text-sm">{user.name}</p>
                <p className="text-slate-400 text-xs">{user.email}</p>
              </div>
            </div>
            <SignOutButton />
          </div>
        )}
      </div>
    </>
  );
}
