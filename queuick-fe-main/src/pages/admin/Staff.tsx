import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

import { adminApi } from "@/features/admin/api";
import type {
  StaffFormValues,
  AdminUser,
  UpdateAdminPayload,
} from "@/features/admin/types";
import type { User } from "@/features/user/types";
import { getErrorMessage, setFieldErrors } from "@/lib/errorUtils";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import StaffFormDialog from "@/features/admin/components/StaffFormDialog";
import StaffTable from "@/features/admin/components/StaffTable";
import AdminTable from "@/features/admin/components/AdminTable";
import AdminFormDialog from "@/features/admin/components/AdminFormDialog";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

const DEFAULT_FORM_VALUES: StaffFormValues = {
  username: "",
  service_id: "",
  password: "",
  password2: "",
};

type AdminFormValues = {
  username: string;
  password?: string;
  password2?: string;
  is_active?: boolean;
};

const AdminStaffPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<number | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    type: "staff" | "admin";
    id: number;
    name: string;
  } | null>(null);

  const { data: staffData, isLoading: isStaffLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: adminApi.listStaff,
  });

  const staff = useMemo(() => staffData?.staff ?? [], [staffData]);

  const { data: adminsData, isLoading: isAdminsLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: adminApi.listAdmins,
  });

  const admins = useMemo(() => adminsData?.admins ?? [], [adminsData]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    setError,
    formState: { errors },
  } = useForm<StaffFormValues>({
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const invalidateStaff = () =>
    queryClient.invalidateQueries({ queryKey: ["staff"] });

  const invalidateAdmins = () =>
    queryClient.invalidateQueries({ queryKey: ["admins"] });

  const handleMutationError = (error: unknown, fallbackMessage: string) => {
    const apiError = error as {
      response?: { data?: { errors?: Record<string, string | string[]> } };
    };

    if (apiError.response?.data?.errors) {
      setFieldErrors(setError, apiError.response.data.errors);
    }

    toast.error(getErrorMessage(error, fallbackMessage));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStaffId(null);
    reset(DEFAULT_FORM_VALUES);
  };

  const handleOpenModal = () => {
    setEditingStaffId(null);
    reset(DEFAULT_FORM_VALUES);
    setIsModalOpen(true);
  };

  const closeAdminModal = () => {
    setIsAdminModalOpen(false);
    setEditingAdminId(null);
    setSelectedAdmin(null);
  };

  const handleOpenAdminModal = () => {
    setEditingAdminId(null);
    setSelectedAdmin(null);
    setIsAdminModalOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  const createStaffMutation = useMutation({
    mutationFn: adminApi.createStaff,
    onSuccess: async () => {
      await invalidateStaff();
      toast.success("Staff member created successfully");
      closeModal();
    },
    onError: (error: unknown) =>
      handleMutationError(error, "Failed to create staff member"),
  });

  const updateStaffMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<StaffFormValues>;
    }) => adminApi.updateStaff(id, data),
    onSuccess: async () => {
      await invalidateStaff();
    },
    onError: (error: unknown) =>
      handleMutationError(error, "Failed to update staff member"),
  });

  const resetStaffPasswordMutation = useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: number;
      data: {
        new_password: string;
        confirm_password: string;
      };
    }) => adminApi.resetStaffPassword(userId, data),
    onError: (error: unknown) =>
      handleMutationError(error, "Failed to reset staff password"),
  });

  const deleteStaffMutation = useMutation({
    mutationFn: adminApi.deleteStaff,
    onSuccess: async () => {
      await invalidateStaff();
      toast.success("Staff member deleted successfully");
      closeDeleteDialog();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete staff member"));
      closeDeleteDialog();
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: adminApi.createAdmin,
    onSuccess: async () => {
      await invalidateAdmins();
      toast.success("Admin account created successfully");
      closeAdminModal();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create admin account"));
    },
  });

  const updateAdminMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateAdminPayload;
    }) => adminApi.updateAdmin(id, data),
    onSuccess: async () => {
      await invalidateAdmins();
      toast.success("Admin account updated successfully");
      closeAdminModal();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update admin account"));
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: adminApi.deleteAdmin,
    onSuccess: async () => {
      await invalidateAdmins();
      toast.success("Admin account deleted successfully");
      closeDeleteDialog();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete admin account"));
      closeDeleteDialog();
    },
  });

  const onSubmit: SubmitHandler<StaffFormValues> = async (formData) => {
    if (editingStaffId !== null) {
      const hasPasswordChange =
        !!formData.password?.trim() && !!formData.password2?.trim();

      const updateData: Partial<StaffFormValues> = {
        username: formData.username,
        service_id: formData.service_id,
      };

      try {
        await updateStaffMutation.mutateAsync({
          id: editingStaffId,
          data: updateData,
        });

        if (hasPasswordChange) {
          await resetStaffPasswordMutation.mutateAsync({
            userId: editingStaffId,
            data: {
              new_password: formData.password!.trim(),
              confirm_password: formData.password2!.trim(),
            },
          });
        }

        await invalidateStaff();
        toast.success(
          hasPasswordChange
            ? "Staff member updated and password reset successfully"
            : "Staff member updated successfully",
        );
        closeModal();
      } catch {
        // handled by mutation onError
      }

      return;
    }

    createStaffMutation.mutate(formData);
  };

  const handleAdminSubmit = (formData: AdminFormValues) => {
    if (editingAdminId !== null) {
      updateAdminMutation.mutate({
        id: editingAdminId,
        data: {
          username: formData.username,
          is_active: formData.is_active,
        },
      });
      return;
    }

    createAdminMutation.mutate({
      username: formData.username,
      password: formData.password || "",
      password2: formData.password2 || "",
    });
  };

  const handleEdit = (staffMember: User) => {
    setEditingStaffId(staffMember.id);
    reset({
      username: staffMember.username,
      service_id: staffMember.assigned_service?.id?.toString() ?? "",
      password: "",
      password2: "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    const staffMember = staff.find((member) => member.id === id);

    setDeleteTarget({
      type: "staff",
      id,
      name: staffMember?.username || "this staff member",
    });
  };

  const handleEditAdmin = (admin: AdminUser) => {
    setEditingAdminId(admin.id);
    setSelectedAdmin(admin);
    setIsAdminModalOpen(true);
  };

  const handleDeleteAdmin = (id: number) => {
    const admin = admins.find((item) => item.id === id);

    setDeleteTarget({
      type: "admin",
      id,
      name: admin?.username || "this admin account",
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "staff") {
      deleteStaffMutation.mutate(deleteTarget.id);
      return;
    }

    deleteAdminMutation.mutate(deleteTarget.id);
  };

  const isDeleting =
    deleteStaffMutation.isPending || deleteAdminMutation.isPending;

  if (isStaffLoading || isAdminsLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ecffd8_0%,#f7fdf1_26%,#fffef8_58%,#f8fafc_100%)]">
        <div className="container mx-auto flex min-h-[70vh] items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-[#2c990f]/15 bg-white/85 px-10 py-8 shadow-[0_20px_50px_rgba(44,153,15,0.10)] backdrop-blur">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2c990f]/15 border-b-[#dcbc34]" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-semibold text-brand-green">
                Loading user management...
              </p>
              <p className="text-xs text-muted-foreground">
                Preparing staff and admin account data
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ecffd8_0%,#f7fdf1_26%,#fffef8_58%,#f8fafc_100%)]">
        <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-8">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(44,153,15,0.18)_0%,rgba(255,255,255,0.96)_42%,rgba(255,248,214,0.96)_76%,rgba(220,188,52,0.18)_100%)] px-6 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur md:px-8">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.30)_0%,rgba(255,255,255,0.06)_100%)]" />
            <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-[#dff6a8]/50 blur-3xl" />
            <div className="absolute -right-10 -top-8 h-44 w-44 rounded-full bg-[#2c990f]/20 blur-3xl" />
            <div className="absolute -bottom-10 left-20 h-32 w-32 rounded-full bg-[#dcbc34]/25 blur-3xl" />

            <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-3">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-brand-green md:text-3xl">
                    User Management
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Manage staff members, admin accounts, and their access
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center rounded-full border border-[#dcbc34]/25 bg-white/80 px-3 py-1 text-xs text-slate-600 shadow-sm">
                  Total staff: {staff.length}
                </div>
                <div className="inline-flex items-center rounded-full border border-[#dcbc34]/25 bg-white/80 px-3 py-1 text-xs text-slate-600 shadow-sm">
                  Total admins: {admins.length}
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[1.75rem] border border-[#2c990f]/10 bg-white/90 shadow-[0_16px_40px_rgba(0,0,0,0.06)] backdrop-blur">
            <div className="h-1.5 w-full bg-[linear-gradient(90deg,#2c990f_0%,#8fd336_45%,#dcbc34_100%)]" />

            <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
              <div>
                <h2 className="text-base font-bold text-brand-green">
                  Staff Members
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create, update, and manage staff user accounts and assignments.
                </p>
              </div>

              <Button
                onClick={handleOpenModal}
                size="sm"
                className="gap-2 rounded-xl bg-[linear-gradient(90deg,#2c990f_0%,#38a916_100%)] px-4 text-white shadow-[0_10px_20px_rgba(44,153,15,0.22)] hover:bg-[#24820c]"
              >
                Add Staff
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="px-5 pb-5 md:px-6 md:pb-6">
              <div className="overflow-hidden rounded-4xl border border-[#dcbc34]/10 bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(252,255,247,1)_100%)]">
                <StaffTable
                  isLoading={isStaffLoading}
                  staffData={staff}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isDeleting={deleteStaffMutation.isPending}
                />
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[1.75rem] border border-[#2c990f]/10 bg-white/90 shadow-[0_16px_40px_rgba(0,0,0,0.06)] backdrop-blur">
            <div className="h-1.5 w-full bg-[linear-gradient(90deg,#2c990f_0%,#8fd336_45%,#dcbc34_100%)]" />

            <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
              <div>
                <h2 className="text-base font-bold text-brand-green">
                  Admin Accounts
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create, update, and manage admin user accounts.
                </p>
              </div>

              <Button
                onClick={handleOpenAdminModal}
                size="sm"
                className="gap-2 rounded-xl bg-[linear-gradient(90deg,#2c990f_0%,#38a916_100%)] px-4 text-white shadow-[0_10px_20px_rgba(44,153,15,0.22)] hover:bg-[#24820c]"
              >
                Add Admin
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="px-5 pb-5 md:px-6 md:pb-6">
              <div className="overflow-hidden rounded-4xl border border-[#dcbc34]/10 bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(252,255,247,1)_100%)]">
                <AdminTable
                  isLoading={isAdminsLoading}
                  adminData={admins}
                  onEdit={handleEditAdmin}
                  onDelete={handleDeleteAdmin}
                  isDeleting={deleteAdminMutation.isPending}
                />
              </div>
            </div>
          </section>

          <StaffFormDialog
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            isEditing={editingStaffId !== null}
            register={register}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            errors={errors}
            watch={watch}
            setValue={setValue}
            control={control}
            isSubmitting={
              createStaffMutation.isPending ||
              updateStaffMutation.isPending ||
              resetStaffPasswordMutation.isPending
            }
          />

          <AdminFormDialog
            open={isAdminModalOpen}
            mode={editingAdminId !== null ? "edit" : "create"}
            admin={selectedAdmin}
            onClose={closeAdminModal}
            onSubmit={handleAdminSubmit}
            isSubmitting={
              createAdminMutation.isPending || updateAdminMutation.isPending
            }
          />
        </div>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={closeDeleteDialog}
        title={
          deleteTarget?.type === "staff"
            ? "Delete Staff Member?"
            : "Delete Admin Account?"
        }
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`
            : "This action cannot be undone."
        }
        confirmText={
          deleteTarget?.type === "staff" ? "Delete Staff" : "Delete Admin"
        }
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  );
};

export default AdminStaffPage;