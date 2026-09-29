import api from "@/api/client";
import type {
  ServiceMutationPayload,
  ServiceListResponse,
  ServiceDetailResponse,
  ServiceStatsResponse,
  ServiceWindow,
} from "./types";

type ServiceWindowMutationResponse = {
  success?: boolean;
  message?: string;
  window?: ServiceWindow;
  service_active?: boolean;
};

export const serviceApi = {
  // ── Service Management ──────────────────────────────

  getAllServices: async (): Promise<ServiceListResponse> => {
    const response = await api.get("/services/");
    return response.data;
  },

  createService: async (
    data: ServiceMutationPayload,
  ): Promise<ServiceDetailResponse> => {
    const response = await api.post("/services/create/", data);
    return response.data;
  },

  updateService: async (
    id: number,
    data: Partial<ServiceMutationPayload>,
  ): Promise<ServiceDetailResponse> => {
    const response = await api.patch(`/services/${id}/update/`, data);
    return response.data;
  },

  deleteService: async (id: number): Promise<void> => {
    await api.delete(`/services/${id}/delete/`);
  },

  getServiceStats: async (id: number): Promise<ServiceStatsResponse> => {
    const response = await api.get(`/services/${id}/stats/`);
    return response.data;
  },

  // ── Window Management ───────────────────────────────

  getServiceWindows: async (
    serviceId: number,
  ): Promise<{ windows: ServiceWindow[] }> => {
    const response = await api.get(`/services/${serviceId}/windows/`);
    return response.data;
  },

  createServiceWindow: async (
    serviceId: number,
    data: Record<string, unknown>,
  ): Promise<ServiceWindow> => {
    const response = await api.post(
      `/services/${serviceId}/windows/create/`,
      data,
    );
    const payload = response.data as
      | ServiceWindow
      | ServiceWindowMutationResponse;
    return (
      (payload as ServiceWindowMutationResponse).window ||
      (payload as ServiceWindow)
    );
  },

  updateWindow: async (
    windowId: number,
    data: Record<string, unknown>,
  ): Promise<ServiceWindow> => {
    const response = await api.patch(`/windows/${windowId}/update/`, data);
    const payload = response.data as
      | ServiceWindow
      | ServiceWindowMutationResponse;
    return (
      (payload as ServiceWindowMutationResponse).window ||
      (payload as ServiceWindow)
    );
  },

  deleteWindow: async (windowId: number): Promise<void> => {
    await api.delete(`/windows/${windowId}/delete/`);
  },
};
