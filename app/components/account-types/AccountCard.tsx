import { AccountType } from "@prisma/client";
import { Button } from "@radix-ui/themes";
import { FiEdit2 } from "react-icons/fi";
import FormattedAmount from "../FormattedAmount";

type AccountCardProps = Readonly<{
  account: AccountType;
  onEdit: (id: number, name: string) => void;
  onClick?: (id: number) => void;
}>;

export default function AccountCard({
  account,
  onEdit,
  onClick,
}: AccountCardProps) {
  return (
    <div className="w-full bg-slate-700 rounded-lg p-3 flex items-center justify-between hover:bg-slate-600 transition-all cursor-pointer group">
      <Button
        onClick={() => onClick?.(account.id)}
        className="flex-1 min-w-0 text-left"
      >
        <p className="text-white font-medium text-sm truncate group-hover:text-blue-400 transition-colors">
          {account.name}
        </p>
        <p className="text-slate-300 text-xs">
          <FormattedAmount amount={account.amount} />
        </p>
      </Button>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(account.id, account.name);
        }}
        className="ml-2 p-1.5 hover:bg-slate-500 rounded transition-colors"
        title="Edit account name"
      >
        <FiEdit2 size={16} className="text-slate-300" />
      </Button>
    </div>
  );
}
