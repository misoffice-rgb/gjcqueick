import type { User } from "@/features/user/types";

export interface StaffFormValues {
  username: string;
  service_id: string;
  password?: string;
  password2?: string;
}

export interface ListStaffResponse {
  staff: User[];
}

export interface SystemSettings {
  auto_schedule_enabled: boolean;
  opening_time: string | null;
  shutdown_time: string | null;
}

export interface GetSystemSettingsResponse {
  success: boolean;
  settings: SystemSettings;
}

export interface UpdateSystemSettingsPayload {
  auto_schedule_enabled: boolean;
  opening_time: string | null;
  shutdown_time: string | null;
}

export interface SmsGlobalSettings {
  sms_enabled: boolean;
  threshold: number;
}

export interface SmsServiceSettings {
  service_id: number;
  service_name: string;
  sms_enabled: boolean;
  threshold: number;
  using_global?: boolean;
}

export interface GetSmsSettingsResponse {
  success: boolean;
  global: SmsGlobalSettings;
  per_service: SmsServiceSettings[];
}

export interface UpdateSmsSettingsPayload {
  sms_enabled?: boolean;
  threshold?: number;
}

export interface AdminAnalyticsSummary {
  total_tickets_issued: number;
  total_tickets_served: number;
  completion_rate: number;
  currently_waiting: number;
  currently_serving: number;
}

export interface AdminAnalyticsService {
  service_id: number;
  service_name: string;
  prefix: string;
  tickets: number;
  served: number;
  waiting: number;
  serving: number;
  average_wait_minutes: number;
  estimated_total_wait: number;
}

export interface AdminAnalyticsPeakHour {
  hour: string;
  tickets_issued: number;
}

export interface AdminAnalyticsRecentActivity {
  ticket: string;
  service: string;
  served_at: string | null;
  wait_time: number;
}

export interface AdminDashboardAnalytics {
  date: string;
  summary: AdminAnalyticsSummary;
  services: AdminAnalyticsService[];
  peak_hours: AdminAnalyticsPeakHour[];
  recent_activity: AdminAnalyticsRecentActivity[];
  timestamp: string;
}

export interface GetAdminDashboardAnalyticsResponse {
  success: boolean;
  analytics: AdminDashboardAnalytics;
}

export interface ServiceAnalyticsDailyStat {
  date: string;
  total: number;
  served: number;
  cancelled: number;
}

export interface ServiceAnalyticsWindowPerformance {
  window_id: number;
  window_name: string;
  window_number: number;
  tickets_served: number;
  currently_serving: boolean;
}

export interface ServiceAnalyticsData {
  service: {
    id: number;
    name: string;
    prefix: string;
  };
  daily_stats: ServiceAnalyticsDailyStat[];
  window_performance: ServiceAnalyticsWindowPerformance[];
  average_service_time: number;
  total_waiting_today: number;
}

export interface GetServiceAnalyticsResponse {
  success: boolean;
  analytics: ServiceAnalyticsData;
}

export interface AdminUser {
  id: number;
  username: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export interface CreateAdminPayload {
  username: string;
  password: string;
  password2: string;
}

export interface UpdateAdminPayload {
  username?: string;
  is_active?: boolean;
}

export interface ListAdminsResponse {
  success: boolean;
  count: number;
  admins: AdminUser[];
}

export interface CreateAdminResponse {
  success: boolean;
  message: string;
  user: AdminUser;
}

export interface UpdateAdminResponse {
  success: boolean;
  message: string;
  user: AdminUser;
}

export interface DeleteAdminResponse {
  success: boolean;
  message: string;
}

export interface ResetStaffPasswordPayload {
  user_id: number;
  new_password: string;
  confirm_password: string;
}

export interface ResetStaffPasswordResponse {
  success: boolean;
  message: string;
}

export interface WindowAnalyticsDailyBreakdown {
  date: string;
  served: number;
  cancelled: number;
  avg_wait_minutes: number;
}

export interface WindowAnalyticsItem {
  window_id: number;
  window_name: string;
  window_number: number;
  status: string;
  tickets_served: number;
  tickets_served_total: number;
  tickets_cancelled: number;
  avg_wait_minutes: number;
  currently_serving: boolean;
  daily_breakdown?: WindowAnalyticsDailyBreakdown[];
}

export interface WindowAnalyticsSummary {
  total_windows: number;
  active_windows: number;
  total_served: number;
  total_cancelled: number;
  overall_avg_wait_minutes: number;
}

export interface WindowAnalyticsResponse {
  success: boolean;
  service: {
    id: number;
    name: string;
    prefix: string;
  };
  date_range: string;
  summary: WindowAnalyticsSummary;
  windows: WindowAnalyticsItem[];
}
