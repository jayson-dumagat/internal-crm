import { Modal } from "../ui/modal";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Delete",
  isPending = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} className="max-w-md p-6" showCloseButton={false}>
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={isPending} className="h-10 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={isPending} className="h-10 rounded-lg bg-error-500 px-4 text-sm font-medium text-white hover:bg-error-600 disabled:opacity-50">{isPending ? "Deleting..." : confirmLabel}</button>
        </div>
      </div>
    </Modal>
  );
}
