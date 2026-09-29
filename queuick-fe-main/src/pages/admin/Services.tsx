import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { serviceApi } from "@/features/services/api";
import type {
  QueueService,
  ServiceFormValues,
  ServiceMutationPayload,
} from "@/features/services/types";
import { getErrorMessage, setFieldErrors } from "@/lib/errorUtils";

import { Button } from "@/components/ui/button";
import ServiceFormDialog from "@/features/services/components/ServiceFormDialog";
import ServiceTable from "@/features/services/components/ServiceTable";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

const DEFAULT_FORM_VALUES: ServiceFormValues = {
  name: "",
  description: "",
  prefix: "",
  average_service_time: 5,
  is_active: true,
  num_windows: 1,
};

const AdminServicesPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ NEW: delete modal state
  const [deleteService, setDeleteService] = useState<QueueService | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: serviceApi.getAllServices,
  });

  const services = useMemo(() => data?.services ?? [], [data]);

  const invalidateServices = () =>
    queryClient.invalidateQueries({ queryKey: ["services"] });

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
    setEditingServiceId(null);
    reset(DEFAULT_FORM_VALUES);
  };

  const closeDeleteDialog = () => {
    setDeleteService(null);
  };

  const createMutation = useMutation({
    mutationFn: serviceApi.createService,
    onSuccess: async () => {
      await invalidateServices();
      toast.success("Service created successfully");
      closeModal();
    },
    onError: (error: unknown) =>
      handleMutationError(error, "Failed to create service"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ServiceMutationPayload }) =>
      serviceApi.updateService(id, data),
    onSuccess: async () => {
      await invalidateServices();
      toast.success("Service updated successfully");
      closeModal();
    },
    onError: (error: unknown) =>
      handleMutationError(error, "Failed to update service"),
  });

  const deleteMutation = useMutation({
    mutationFn: serviceApi.deleteService,
    onSuccess: async () => {
      await invalidateServices();
      toast.success("Service deleted successfully");
      closeDeleteDialog();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete service"));
      closeDeleteDialog();
    },
  });

  const openCreateModal = () => {
    setEditingServiceId(null);
    reset(DEFAULT_FORM_VALUES);
    setIsModalOpen(true);
  };

  const openEditModal = (service: QueueService) => {
    setEditingServiceId(service.id);
    reset({
      name: service.name,
      description: service.description,
      prefix: service.prefix,
      average_service_time: service.average_service_time,
      is_active: service.is_active,
    });
    setIsModalOpen(true);
  };

  // ✅ UPDATED delete handler
  const handleDelete = (service: QueueService) => {
    setDeleteService(service);
  };

  const confirmDelete = () => {
    if (!deleteService) return;
    deleteMutation.mutate(deleteService.id);
  };

  const onSubmit: SubmitHandler<ServiceFormValues> = (formValues) => {
    if (editingServiceId !== null) {
      updateMutation.mutate({ id: editingServiceId, data: formValues });
      return;
    }
    createMutation.mutate(formValues);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ecffd8_0%,#f7fdf1_26%,#fffef8_58%,#f8fafc_100%)]">
        <div className="container mx-auto flex min-h-[70vh] items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-[#2c990f]/15 bg-white/85 px-10 py-8 shadow-[0_20px_50px_rgba(44,153,15,0.10)] backdrop-blur">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2c990f]/15 border-b-[#dcbc34]" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-semibold text-brand-green">
                Loading services...
              </p>
              <p className="text-xs text-muted-foreground">
                Preparing service configurations
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

          {/* HEADER */}
          <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(44,153,15,0.18)_0%,rgba(255,255,255,0.96)_42%,rgba(255,248,214,0.96)_76%,rgba(220,188,52,0.18)_100%)] px-6 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur md:px-8">
            <div className="relative">
              <h1 className="text-2xl font-black text-brand-green md:text-3xl">
                Services
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage your queue services and their configurations
              </p>
            </div>
          </section>

          {/* TABLE */}
          <section className="overflow-hidden rounded-[1.75rem] border border-[#2c990f]/10 bg-white/90 shadow">
            <div className="flex justify-between p-6">
              <h2 className="font-bold text-brand-green">All Services</h2>

              <Button onClick={openCreateModal} size="sm">
                <Plus className="h-4 w-4" />
                Add Service
              </Button>
            </div>

            <ServiceTable
              services={services}
              onEdit={openEditModal}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
            />
          </section>

          <ServiceFormDialog
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            isEditing={editingServiceId !== null}
            register={register}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            control={control}
            errors={errors}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      </div>

      {/* ✅ DELETE CONFIRM */}
      <ConfirmDialog
        open={deleteService !== null}
        onClose={closeDeleteDialog}
        title="Delete Service?"
        description={
          deleteService
            ? `Delete "${deleteService.name}"? This cannot be undone.`
            : ""
        }
        confirmText="Delete Service"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};

export default AdminServicesPage;