"use client";
import { AccountType } from "@prisma/client";
import { Button } from "@radix-ui/themes";
import { FiEdit2 } from "react-icons/fi";

interface AccountCardProps {
  account: AccountType;
  onEdit: (id: number, name: string) => void;
}

export default function AccountCard({ account, onEdit }: AccountCardProps) {
  const CURRENCY = "мкд";
  return (
    <div className="bg-slate-700 rounded-lg p-3 flex items-center justify-between hover:bg-slate-600 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">
          {account.name}
        </p>
        <p className="text-slate-300 text-xs">
          {account.amount.toFixed(2)} {CURRENCY}
        </p>
      </div>
      <Button
        onClick={() => onEdit(account.id, account.name)}
        className="ml-2 p-1.5 hover:bg-slate-500 rounded transition-colors"
        title="Edit account name"
      >
        <FiEdit2 size={16} className="text-slate-300" />
      </Button>
    </div>
  );
}
