import api from "@/api/client";
import type { StaffDashboardResponse, CallNextResponse } from "./types";

export type WindowSelectionStatus = "inactive" | "active" | "maintenance";

export interface WindowSelectionWindow {
  id: number;
  name: string;
  number: number;
  status: WindowSelectionStatus;
  is_in_use: boolean;
  is_available: boolean;
  claimed_by: string | null;
  current_staff_name?: string | null;
  current_staff?: number | null;
}

type RawWindowSelectionWindow = Partial<WindowSelectionWindow> & {
  window_number?: number;
  claimed_by?: string | number | null;
};

interface WindowSelectionApiResponse {
  window?: Partial<WindowSelectionWindow>;
  data?: {
    window?: Partial<WindowSelectionWindow>;
  };
}

const normalizeWindowSelectionWindow = (
  raw?: RawWindowSelectionWindow,
): WindowSelectionWindow => ({
  id: Number(raw?.id ?? 0),
  name: String(raw?.name ?? ""),
  number: Number(raw?.number ?? raw?.window_number ?? 0),
  status: (raw?.status as WindowSelectionStatus) ?? "inactive",
  is_in_use: typeof raw?.is_in_use === "boolean" ? raw.is_in_use : false,
  is_available:
    typeof raw?.is_available === "boolean"
      ? raw.is_available
      : (raw?.status as WindowSelectionStatus) === "active" &&
        !Boolean(raw?.is_in_use),
  claimed_by:
    raw?.claimed_by === null || raw?.claimed_by === undefined
      ? null
      : String(raw.claimed_by),
  current_staff_name:
    typeof raw?.current_staff_name === "string" ||
    raw?.current_staff_name === null
      ? raw.current_staff_name
      : undefined,
  current_staff:
    typeof raw?.current_staff === "number" || raw?.current_staff === null
      ? raw.current_staff
      : undefined,
});

export const staffApi = {
  getDashboard: async (): Promise<StaffDashboardResponse> => {
    const response = await api.get("/staff/dashboard/");
    return response.data;
  },

  callNext: async (data?: {
    window_id?: number;
  }): Promise<CallNextResponse> => {
    const response = await api.post("/staff/call-next/", data);
    return response.data;
  },

  callSpecific: async (data: {
    ticket_number: string;
    window_id: number;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/staff/call-specific/", data);
    return response.data;
  },

  completeServing: async (
    ticketId: string,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/staff/tickets/${ticketId}/complete/`);
    return response.data;
  },

  skipTicket: async (
    ticketId: string,
    data?: { reason?: string },
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/staff/tickets/${ticketId}/skip/`, data);
    return response.data;
  },

  recallTicket: async (
    ticketId: string,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/staff/tickets/${ticketId}/recall/`);
    return response.data;
  },

  removeTicket: async (
    ticketId: string,
    data?: { reason: string },
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/staff/tickets/${ticketId}/remove/`, data);
    return response.data;
  },

  claimWindow: async (data: {
    window_id: number;
    staff_account_id: number;
  }): Promise<WindowSelectionWindow> => {
    const response = await api.post("/sessions/claim", data);
    const payload = response.data as
      | WindowSelectionApiResponse
      | Partial<WindowSelectionWindow>;

    const windowData =
      (payload as WindowSelectionApiResponse).window ||
      (payload as WindowSelectionApiResponse).data?.window ||
      (payload as Partial<WindowSelectionWindow>);

    return normalizeWindowSelectionWindow(windowData);
  },

  releaseWindow: async (data: { window_id: number }): Promise<void> => {
    await api.post("/sessions/release", data);
  },
};

export default staffApi;