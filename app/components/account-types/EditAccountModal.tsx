"use client";

import { useState } from "react";
import { Button } from "@radix-ui/themes";
import { FiX } from "react-icons/fi";
import AccountFormButtons from "./AccountFormButtons";
import { updateAccount } from "@/app/lib/accountTypes";
import { Label } from "@radix-ui/themes/components/context-menu";

interface EditAccountModalProps {
  id: number;
  currentName: string;
  onClose: () => void;
  onSave: (updated: any) => void;
}

export default function EditAccountModal({
  id,
  currentName,
  onClose,
  onSave,
}: EditAccountModalProps) {
  const [name, setName] = useState(currentName);

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      const updated = await updateAccount(id, name);
      onSave(updated);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-96 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Edit Account</h3>
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
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-slate-500"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
          <p className="text-sm text-slate-400">Amount cannot be edited here</p>
          <AccountFormButtons onSave={handleSave} onCancel={onClose} />
        </div>
      </div>
    </div>
  );
}
