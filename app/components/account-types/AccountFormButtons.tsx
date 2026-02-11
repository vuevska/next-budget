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
    <div className="flex gap-2 pt-4">
      <Button
        onClick={onSave}
        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
        disabled={disabled}
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
