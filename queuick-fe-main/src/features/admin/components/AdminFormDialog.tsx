import React, { useEffect, useState } from "react";
import type { AdminUser } from "../types";
import { X } from "lucide-react";

interface AdminFormValues {
  username: string;
  password?: string;
  password2?: string;
  is_active?: boolean;
}

interface AdminFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  admin?: AdminUser | null;
  onClose: () => void;
  onSubmit: (values: AdminFormValues) => void;
  isSubmitting?: boolean;
}

const AdminFormDialog: React.FC<AdminFormDialogProps> = ({
  open,
  mode,
  admin,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && admin) {
      setUsername(admin.username || "");
      setIsActive(admin.is_active ?? true);
      setPassword("");
      setPassword2("");
    } else {
      setUsername("");
      setPassword("");
      setPassword2("");
      setIsActive(true);
    }
  }, [open, mode, admin]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create") {
      onSubmit({
        username,
        password,
        password2,
      });
      return;
    }

    onSubmit({
      username,
      is_active: isActive,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {mode === "create" ? "Create Admin Account" : "Edit Admin Account"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "create"
                ? "Add a new admin account."
                : "Update the selected admin account."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
              placeholder="Enter username"
            />
          </div>

          {mode === "create" && (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
                  placeholder="Enter password"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
                  placeholder="Confirm password"
                />
              </div>
            </>
          )}

          {mode === "edit" && (
            <label className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 px-3 py-3">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4"
              />
              <span className="text-sm text-foreground">Active account</span>
            </label>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                  ? "Create Admin"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminFormDialog;