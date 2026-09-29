import type { Ticket } from "../tickets/types";

export interface QueueService {
  id: number;
  name: string;
  description: string;
  prefix: string;
  is_active: boolean;
  average_service_time: number;
  created_at: string;
  updated_at: string;

  // Custom properties from models
  waiting_count: number;
  currently_serving: Ticket | null;
  windows?: ServiceWindow[];
  windows_count?: number;
}

export type ServiceWindowStatus = "active" | "inactive" | "maintenance";

export interface ServiceWindow {
  id: number;
  service: number; // Service ID
  window_number: number;
  number?: number;
  name: string;
  status: ServiceWindowStatus;
  description: string;
  current_staff: number | null; // User ID
  current_staff_name?: string | null;
  claimed_by?: string | null;
  is_in_use?: boolean;
  created_at: string;
  updated_at: string;

  // Property
  is_available: boolean;
}

export interface ServiceStats {
  service: QueueService;
  today: {
    total_tickets: number;
    waiting: number;
    serving: number;
    served: number;
    cancelled: number;
    skipped: number;
  };
  average_wait_time: number;
}

// Form Types
export interface ServiceFormValues {
  name: string;
  description: string;
  prefix: string;
  average_service_time: number;
  is_active: boolean;
  num_windows: number;
}

export interface ServiceMutationPayload extends ServiceFormValues {}

// API Response Types
export interface ServiceListResponse {
  success: boolean;
  count: number;
  services: QueueService[];
}

export interface ServiceDetailResponse {
  success: boolean;
  message?: string;
  service: QueueService;
}

export interface ServiceStatsResponse {
  success: boolean;
  stats: ServiceStats;
}
