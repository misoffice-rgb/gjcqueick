import type { Ticket } from "../tickets/types";

export interface WindowServingTicket {
  ticket_id: string;
  display_number: string;
}

export interface DashboardServiceWindow {
  id: number;
  name: string;
  number: number;
  status?: "active" | "inactive" | "maintenance";
  is_in_use?: boolean;
  currently_serving: string | WindowServingTicket | null;
  is_available: boolean;
  claimed_by?: string | null;
  current_staff?: number | null;
  current_staff_name?: string | null;
}

export interface StaffDashboardData {
  service: string;
  waiting_count: number;
  serving_count?: number;
  next_ticket: string | null;
  currently_serving?: Ticket[];
  waiting_list: Ticket[];
  skipped_list?: Ticket[];
  windows: DashboardServiceWindow[];
}

export interface StaffDashboardResponse {
  success: boolean;
  dashboard: StaffDashboardData;
}

export interface CallNextResponse {
  success: boolean;
  message: string;
  ticket: {
    display_number: string;
    window: string;
    people_ahead: number;
  };
}