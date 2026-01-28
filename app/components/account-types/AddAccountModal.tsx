"use client";

import { useState } from "react";
import { Button } from "@radix-ui/themes";
import { FiX } from "react-icons/fi";
import AccountFormButtons from "./AccountFormButtons";
import { createAccount } from "@/app/lib/accountTypes";
import { Label } from "@radix-ui/themes/components/context-menu";

interface AddAccountModalProps {
  onClose: () => void;
  onAdd: (account: any) => void;
}

export default function AddAccountModal({
  onClose,
  onAdd,
}: AddAccountModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const handleAdd = async () => {
    if (!name.trim()) return;
    try {
      const created = await createAccount(name, parseFloat(amount) || 0);
      onAdd(created);
      setName("");
      setAmount("");
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-96 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Add New Account</h3>
          <Button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <FiX size={24} />
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-slate-300 mb-2">
              Account Name
            </Label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Savings, Checking"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-slate-500"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Label className="block text-sm font-medium text-slate-300 mb-2 mt-3">
              Starting Balance
            </Label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0 мкд"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-slate-500"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <AccountFormButtons
            onSave={handleAdd}
            onCancel={onClose}
            saveLabel="Add Account"
          />
        </div>
      </div>
    </div>
  );
}
