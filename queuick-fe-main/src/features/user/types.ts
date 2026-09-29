export interface User {
  id: number;
  username: string;
  is_staff: boolean;
  is_superuser: boolean;
  assigned_service?: {
    id: number;
    name: string;
  } | null;
}

export interface StaffProfile {
  id: number;
  role: "admin" | "staff";
  assigned_service?: number; // Service ID
  can_manage_queue: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  access?: string;
  refresh?: string;
  message?: string;
  service?: {
    id: number;
    name: string;
    prefix: string;
    windows: any[];
  };
}

export interface LoginCredentials {
  username: string;
  password?: string;
}
