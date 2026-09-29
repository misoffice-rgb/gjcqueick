import type { ServiceWindow } from "@/features/services/types";

export type TicketStatus =
  | "waiting"
  | "notified"
  | "serving"
  | "served"
  | "cancelled"
  | "skipped";

export interface Ticket {
  ticket_id: string; // UUID
  service: string; // Service Name in this response context
  queue_number: number;
  display_number: string;
  ticket_date: string;
  is_today: boolean;
  status: TicketStatus;
  people_ahead: number;
  wait_time_minutes: number;
  created_at: string;

  // Optional/Nullable fields that might come from other endpoints but not this specific generation one
  id?: number;
  service_id?: number;
  assigned_window?: number | null;
  assigned_window_info?: any | null;
  called_by?: number | null;
  served_by?: number | null;
  called_at?: string | null;
  served_at?: string | null;
  skipped_at?: string | null;
  notes?: string;
}

export interface TicketGenerationResponse {
  success: boolean;
  message: string;
  ticket: Ticket;
  windows?: ServiceWindow[];
  printer_data?: {
    success: boolean;
    preview_html: string;
  };
}

export interface QueueInfo {
  position: number;
  total_in_queue: number;
  currently_serving: string | CurrentlyServingInfo | null;
  estimated_wait_minutes: number;
}

export interface AssignedWindowInfo {
  id?: number;
  name?: string;
  window_number?: number;
}

export interface CurrentlyServingInfo {
  display_number?: string;
  assigned_window?: number | null;
  assigned_window_info?: AssignedWindowInfo | null;
}

export interface TicketStatusTicket {
  ticket_id: string;
  queue_number: number;
  display_number: string;
  service: number | string;
  service_name: string;
  status: TicketStatus;
  ticket_date: string;
  assigned_window: number | null;
  assigned_window_info: AssignedWindowInfo | null;
  called_by: number | null;
  served_by: number | null;
  called_at: string | null;
  served_at: string | null;
  skipped_at: string | null;
  created_at: string;
  is_today: boolean;
  people_ahead: number;
  wait_time_minutes: number;
  notes: string;
}

export interface TicketStatusResponse {
  success: boolean;
  ticket: TicketStatusTicket;
  queue_info: QueueInfo;
}

export interface DashboardServiceWindow {
  ticket_number: string;
  window_name?: string;
  window_number?: number;
}

export interface DashboardServiceWindowStatus {
  id?: number;
  name?: string;
  number?: number;
  currently_serving?:
    | string
    | {
        ticket_number?: string;
        display_number?: string;
      }
    | null;
}

export interface DashboardServiceDetail {
  id: number;
  name: string;
  prefix: string;
  currently_serving: DashboardServiceWindow[] | null;
  windows?: DashboardServiceWindowStatus[];
  next_in_line: string | null;
  waiting_count: number;
  average_wait_time: number;
}

export interface DashboardStatus {
  timestamp: string;
  services: DashboardServiceDetail[];
}