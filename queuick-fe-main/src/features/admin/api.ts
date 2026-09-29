import api from "@/api/client";
import type { User } from "../user/types";
import type {
  StaffFormValues,
  ListStaffResponse,
  GetSmsSettingsResponse,
  UpdateSmsSettingsPayload,
  GetAdminDashboardAnalyticsResponse,
  GetServiceAnalyticsResponse,
  GetSystemSettingsResponse,
  UpdateSystemSettingsPayload,
  CreateAdminPayload,
  CreateAdminResponse,
  ListAdminsResponse,
  UpdateAdminPayload,
  UpdateAdminResponse,
  DeleteAdminResponse,
  ResetStaffPasswordResponse,
  WindowAnalyticsResponse,
} from "./types";

export type AnalyticsQueryParams = {
  date?: string;
  start_date?: string;
  end_date?: string;
  service_id?: number;
};

export const adminApi = {
  listStaff: async (): Promise<ListStaffResponse> => {
    const response = await api.get("/auth/admin/staff/list/");
    return response.data;
  },

  getSystemSettings: async (): Promise<GetSystemSettingsResponse> => {
    const response = await api.get("/admin/system-settings/");
    return response.data;
  },

  updateSystemSettings: async (
    data: UpdateSystemSettingsPayload,
  ): Promise<{ success: boolean; message: string; settings: any }> => {
    const response = await api.patch("/admin/system-settings/update/", data);
    return response.data;
  },

  createStaff: async (data: StaffFormValues): Promise<User> => {
    const response = await api.post("/auth/admin/staff/create/", data);
    return response.data;
  },

  updateStaff: async (
    id: number,
    data: Partial<StaffFormValues>,
  ): Promise<User> => {
    const response = await api.patch(`/auth/admin/staff/${id}/update/`, data);
    return response.data;
  },

  deleteStaff: async (id: number): Promise<void> => {
    await api.delete(`/auth/admin/staff/${id}/delete/`);
  },

  resetStaffPassword: async (
    userId: number,
    data: {
      new_password: string;
      confirm_password: string;
    },
  ): Promise<ResetStaffPasswordResponse> => {
    const response = await api.post(
      `/auth/admin/staff/${userId}/reset-password/`,
      data,
    );
    return response.data;
  },

  getSmsSettings: async (): Promise<GetSmsSettingsResponse> => {
    const response = await api.get("/admin/sms-settings/");
    return response.data;
  },

  updateGlobalSmsSettings: async (
    data: UpdateSmsSettingsPayload,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.patch("/admin/sms-settings/global/", data);
    return response.data;
  },

  updateServiceSmsSettings: async (
    serviceId: number,
    data: UpdateSmsSettingsPayload,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.patch(
      `/admin/sms-settings/service/${serviceId}/`,
      data,
    );
    return response.data;
  },

  resetServiceSmsSettings: async (
    serviceId: number,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(
      `/admin/sms-settings/service/${serviceId}/reset/`,
    );
    return response.data;
  },

  getDashboardAnalytics: async (
    params?: AnalyticsQueryParams,
  ): Promise<GetAdminDashboardAnalyticsResponse> => {
    const response = await api.get("/admin/analytics/", { params });
    return response.data;
  },

  getServiceAnalytics: async (
    serviceId: number,
  ): Promise<GetServiceAnalyticsResponse> => {
    const response = await api.get(`/admin/analytics/service/${serviceId}/`);
    return response.data;
  },

  getWindowAnalytics: async (
    serviceId: number,
    params?: {
      date?: string;
      start_date?: string;
      end_date?: string;
    },
  ): Promise<WindowAnalyticsResponse> => {
    const response = await api.get(`/admin/analytics/window/${serviceId}/`, {
      params,
    });
    return response.data;
  },

  exportTicketsCSV: async (params?: {
    date?: string;
    start_date?: string;
    end_date?: string;
    service_id?: number;
  }): Promise<Blob> => {
    const response = await api.get("/admin/analytics/export/csv/", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  exportWindowPerformanceCSV: async (
    serviceId: number,
    params?: {
      date?: string;
      start_date?: string;
      end_date?: string;
    },
  ): Promise<Blob> => {
    const response = await api.get(
      `/admin/analytics/export/window/${serviceId}/csv/`,
      {
        params,
        responseType: "blob",
      },
    );
    return response.data;
  },

  listAdmins: async (): Promise<ListAdminsResponse> => {
    const response = await api.get("/auth/admin/list/");
    return response.data;
  },

  createAdmin: async (
    data: CreateAdminPayload,
  ): Promise<CreateAdminResponse> => {
    const response = await api.post("/auth/admin/create/", data);
    return response.data;
  },

  updateAdmin: async (
    userId: number,
    data: UpdateAdminPayload,
  ): Promise<UpdateAdminResponse> => {
    const response = await api.patch(`/auth/admin/${userId}/update/`, data);
    return response.data;
  },

  deleteAdmin: async (userId: number): Promise<DeleteAdminResponse> => {
    const response = await api.delete(`/auth/admin/${userId}/delete/`);
    return response.data;
  },
};