import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { serviceApi } from "@/features/services/api";
import { getErrorMessage, setFieldErrors } from "@/lib/errorUtils";
import type { ServiceWindow } from "@/features/services/types";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Monitor, ArrowLeft } from "lucide-react";
import ServiceWindowFormDialog from "@/features/services/components/ServiceWindowFormDialog";

const GRID_COLS =
  "grid grid-cols-[80px_1fr_1.2fr_100px_80px] items-center gap-4 px-6";

const ColumnHeaders = () => (
  <div
    className={`${GRID_COLS} bg-[linear-gradient(90deg,rgba(44,153,15,0.05)_0%,rgba(255,255,255,1)_55%,rgba(220,188,52,0.06)_100%)] py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70`}
  >
    <span>Number</span>
    <span>Name</span>
    <span>Description</span>
    <span>Status</span>
    <span className="text-right">Actions</span>
  </div>
);

const AdminServiceWindowsPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWindow, setEditingWindow] = useState<ServiceWindow | null>(
    null,
  );

  const { data: windowsData, isLoading } = useQuery({
    queryKey: ["windows", serviceId],
    queryFn: () => serviceApi.getServiceWindows(Number(serviceId)),
    enabled: !!serviceId,
  });

  const { data: servicesData } = useQuery({
    queryKey: ["services"],
    queryFn: serviceApi.getAllServices,
  });

  const currentService = servicesData?.services?.find(
    (s: any) => s.id === Number(serviceId),
  );

  const AUTO_CREATED_WINDOW_PREFIX = `${currentService?.name || "Service"} Window ${(windowsData?.windows?.length || 0) + 1}`;

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      serviceApi.createServiceWindow(Number(serviceId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["windows", serviceId] });
      toast.success("Window created successfully");
      setIsModalOpen(false);
      reset();
    },
    onError: (error: any) => {
      const data = error.response?.data;
      if (data?.errors) {
        setFieldErrors(setError, data.errors);
      }
      toast.error(getErrorMessage(error, "Failed to create window"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      serviceApi.updateWindow(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["windows", serviceId] });
      toast.success("Window updated successfully");
      setIsModalOpen(false);
      setEditingWindow(null);
      reset();
    },
    onError: (error: any) => {
      const data = error.response?.data;
      if (data?.errors) {
        setFieldErrors(setError, data.errors);
      }
      toast.error(getErrorMessage(error, "Failed to update window"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: serviceApi.deleteWindow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["windows", serviceId] });
      toast.success("Window deleted successfully");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed to delete window"));
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: AUTO_CREATED_WINDOW_PREFIX,
      window_number: 1,
      description: "",
      status: "active",
    },
  });

  const openCreateModal = () => {
    setEditingWindow(null);
    reset({
      name: AUTO_CREATED_WINDOW_PREFIX,
      window_number: (windowsData?.windows?.length || 0) + 1,
      description: "",
      status: "active",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (window: ServiceWindow) => {
    setEditingWindow(window);
    setValue("name", window.name);
    setValue("window_number", window.window_number);
    setValue("description", window.description);
    setValue("status", window.status);
    setIsModalOpen(true);
  };

  const onSubmit = (data: any) => {
    if (editingWindow) {
      updateMutation.mutate({ id: editingWindow.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ecffd8_0%,#f7fdf1_26%,#fffef8_58%,#f8fafc_100%)]">
        <div className="container mx-auto flex min-h-[70vh] items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-[#2c990f]/15 bg-white/85 px-10 py-8 shadow-[0_20px_50px_rgba(44,153,15,0.10)] backdrop-blur">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2c990f]/15 border-b-[#dcbc34]" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-semibold text-brand-green">
                Loading service windows...
              </p>
              <p className="text-xs text-muted-foreground">
                Preparing window configurations
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ecffd8_0%,#f7fdf1_26%,#fffef8_58%,#f8fafc_100%)]">
      <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(44,153,15,0.18)_0%,rgba(255,255,255,0.96)_42%,rgba(255,248,214,0.96)_76%,rgba(220,188,52,0.18)_100%)] px-6 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur md:px-8">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.30)_0%,rgba(255,255,255,0.06)_100%)]" />
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-[#dff6a8]/50 blur-3xl" />
          <div className="absolute -right-10 -top-8 h-44 w-44 rounded-full bg-brand-green/20 blur-3xl" />
          <div className="absolute -bottom-10 left-20 h-32 w-32 rounded-full bg-[#dcbc34]/25 blur-3xl" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-fit gap-2 rounded-full border border-[#2c990f]/15 bg-white/75 px-3 text-brand-green shadow-sm hover:bg-[#f6fff0]"
                onClick={() => navigate("/admin/services")}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Services
              </Button>

              <div>
                <h1 className="text-2xl font-black tracking-tight text-brand-green md:text-3xl">
                  {currentService?.name || "Service"} - Windows
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Manage service windows and counters
                </p>
              </div>
            </div>

            <div className="inline-flex items-center rounded-full border border-[#dcbc34]/25 bg-white/80 px-3 py-1 text-xs text-slate-600 shadow-sm">
              Total windows: {windowsData?.windows?.length || 0}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[1.75rem] border border-[#2c990f]/10 bg-white/90 shadow-[0_16px_40px_rgba(0,0,0,0.06)] backdrop-blur">
          <div className="h-1.5 w-full bg-[linear-gradient(90deg,#2c990f_0%,#8fd336_45%,#dcbc34_100%)]" />

          <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
            <div>
              <h2 className="text-base font-bold text-brand-green">
                All Windows
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Create, update, and organize service counters and windows.
              </p>
            </div>

            <Button
              onClick={openCreateModal}
              size="sm"
              className="gap-2 rounded-xl bg-[linear-gradient(90deg,#2c990f_0%,#38a916_100%)] px-4 text-white shadow-[0_10px_20px_rgba(44,153,15,0.22)] hover:bg-[#24820c]"
            >
              Add Window
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="px-5 pb-5 md:px-6 md:pb-6">
            <div className="overflow-hidden rounded-4xl border border-[#dcbc34]/10 bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(252,255,247,1)_100%)]">
              <ColumnHeaders />

              {windowsData?.windows?.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 border-t border-[#2c990f]/8 py-16 text-sm text-muted-foreground">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(44,153,15,0.10)_0%,rgba(220,188,52,0.14)_100%)]">
                    <Monitor className="size-8 text-[#2c990f]/55" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-brand-green">
                      No windows found for this service.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Add your first window to start organizing counters.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[#2c990f]/8">
                  {windowsData?.windows?.map((window: ServiceWindow) => (
                    <div
                      key={window.id}
                      className={`group ${GRID_COLS} py-3.5 transition-all duration-150 hover:bg-[linear-gradient(90deg,rgba(44,153,15,0.04)_0%,rgba(255,255,255,1)_60%,rgba(220,188,52,0.05)_100%)]`}
                    >
                      <span className="text-sm font-bold text-brand-green">
                        #{window.window_number}
                      </span>

                      <span className="text-sm font-semibold text-foreground">
                        {window.name}
                      </span>

                      <span className="text-sm text-muted-foreground">
                        {window.description || (
                          <span className="italic text-muted-foreground/50">
                            No description
                          </span>
                        )}
                      </span>

                      <div>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                            window.status === "active"
                              ? "border border-emerald-500/20 bg-emerald-500/12 text-emerald-700"
                              : "border border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          {window.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(window)}
                          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-brand-green/10 hover:text-[#2c990f]"
                          title="Edit"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this window?",
                              )
                            ) {
                              deleteMutation.mutate(window.id);
                            }
                          }}
                          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <ServiceWindowFormDialog
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          isEditing={Boolean(editingWindow)}
          register={register}
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          control={control}
          errors={errors}
        />
      </div>
    </div>
  );
};

export default AdminServiceWindowsPage;
