import { Button } from "@radix-ui/themes";

interface AccountFormButtonsProps {
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
  cancelLabel?: string;
}

export default function AccountFormButtons({
  onSave,
  onCancel,
  saveLabel = "Save",
  cancelLabel = "Cancel",
}: AccountFormButtonsProps) {
  return (
    <div className="flex gap-2 pt-4">
      <Button
        onClick={onSave}
        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
      >
        {saveLabel}
      </Button>
      <Button
        onClick={onCancel}
        className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition-colors"
      >
        {cancelLabel}
      </Button>
    </div>
  );
}
