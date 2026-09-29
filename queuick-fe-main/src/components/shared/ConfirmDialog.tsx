import React from "react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  isLoading = false,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#2c990f]/10 bg-[linear-gradient(180deg,#ffffff_0%,#fffdf7_100%)] shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
        
        {/* Header */}
        <div className="border-b border-border/40 px-6 py-4">
          <h2 className="text-lg font-bold text-brand-green">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            disabled={isLoading}
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-60"
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;