import { Button } from "@radix-ui/themes";

type AccountFormButtonsProps = Readonly<{
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  disabled: boolean;
}>;

export default function AccountFormButtons({
  onSave,
  onCancel,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  disabled,
}: AccountFormButtonsProps) {
  return (
    <div className="flex gap-3 pt-4">
      <Button
        onClick={onSave}
        className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        disabled={disabled}
      >
        {saveLabel}
      </Button>
      <Button
        onClick={onCancel}
        className="flex-1 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-medium transition-colors disabled:opacity-50"
      >
        {cancelLabel}
      </Button>
    </div>
  );
}
