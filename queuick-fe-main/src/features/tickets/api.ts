import api from "@/api/client";
import type {
  DashboardStatus,
  TicketGenerationResponse,
  TicketStatusResponse,
} from "./types";
import type { QueueService } from "../services/types";

export const ticketApi = {
  getPublicServices: async (): Promise<{ services: QueueService[] }> => {
    const response = await api.get("/services/public/", {
      params: { status: "active" },
    });
    return response.data;
  },

  generateTicket: async (
    serviceId: string,
  ): Promise<TicketGenerationResponse> => {
    const response = await api.post("/tickets/generate/", {
      service_id: serviceId,
    });
    return response.data;
  },

  getTicketStatus: async (ticketId: string): Promise<TicketStatusResponse> => {
    const response = await api.get(`/tickets/${ticketId}/status/`);
    return response.data;
  },

  smsOptIn: async (
    ticketId: string,
    phone: string,
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post(`/tickets/${ticketId}/sms-opt-in/`, {
      phone,
    });
    return response.data;
  },

  getDashboardStatus: async (): Promise<DashboardStatus> => {
    const response = await api.get("/dashboard/status/");
    return response.data;
  },
};
