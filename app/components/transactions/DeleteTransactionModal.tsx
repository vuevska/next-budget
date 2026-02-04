import React from "react";
import Portal from "../Portal";
import { FiX } from "react-icons/fi";
import { Button } from "@radix-ui/themes";

type DeleteTransactionModalProps = Readonly<{
  onCancel: () => void;
  onConfirm: () => void;
}>;

const DeleteTransactionModal = ({
  onCancel,
  onConfirm,
}: DeleteTransactionModalProps) => {
  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 border border-slate-200">
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-red-50 to-red-50">
            <h2 className="text-lg font-bold text-slate-900">
              Delete Transaction
            </h2>
            <Button
              onClick={onCancel}
              className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <FiX size={24} className="text-slate-600" />
            </Button>
          </div>

          <div className="p-6">
            <p className="text-slate-700 mb-6">
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </p>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-medium transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={onConfirm}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default DeleteTransactionModal;
