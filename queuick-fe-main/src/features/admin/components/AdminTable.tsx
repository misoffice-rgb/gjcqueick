import React from "react";
import type { AdminUser } from "../types";
import { Pencil, Trash2, UserCircle } from "lucide-react";

interface AdminTableProps {
  isLoading: boolean;
  adminData?: AdminUser[];
  onEdit: (admin: AdminUser) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

const GRID_COLS =
  "grid grid-cols-[1.2fr_120px_80px] min-w-[500px] items-center gap-4 px-6";

const ColumnHeaders = () => (
  <div
    className={`${GRID_COLS} py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60`}
  >
    <span>Admin Username</span>
    <span>Status</span>
    <span className="text-right">Actions</span>
  </div>
);

const AdminTable: React.FC<AdminTableProps> = ({
  isLoading,
  adminData,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  if (isLoading) {
    return (
      <div className="w-full overflow-x-auto rounded-2xl border border-border/50 bg-card">
        <div className="min-w-[600px]">
          <ColumnHeaders />
          <div className="flex items-center justify-center border-t border-border/30 py-16 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="size-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              Loading admin accounts...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!adminData || adminData.length === 0) {
    return (
      <div className="w-full overflow-x-auto rounded-2xl border border-border/50 bg-card">
        <div className="min-w-[600px]">
          <ColumnHeaders />
          <div className="flex flex-col items-center justify-center gap-2 border-t border-border/30 py-16 text-sm text-muted-foreground">
            <UserCircle className="size-10 text-muted-foreground/30" />
            No admin accounts found.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border/50 bg-card">
      <div className="min-w-[600px]">
        <ColumnHeaders />
        <div className="divide-y divide-border/30">
          {adminData.map((admin) => (
            <div
              key={admin.id}
              className={`group ${GRID_COLS} py-3.5 transition-colors duration-150 hover:bg-muted/40`}
            >
              {/* Admin username */}
              <span className="text-sm font-medium text-foreground">
                {admin.username}
              </span>

              {/* Status badge */}
              <div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    admin.is_active
                      ? "bg-emerald-500/15 text-emerald-600"
                      : "bg-red-500/15 text-red-600"
                  }`}
                >
                  {admin.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => onEdit(admin)}
                  className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  title="Edit"
                >
                  <Pencil className="size-3.5" />
                </button>

                <button
                  onClick={() => onDelete(admin.id)}
                  className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  title="Delete"
                  disabled={isDeleting}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminTable;
