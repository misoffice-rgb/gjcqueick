import type { ServiceWindow } from "@/features/services/types";
import type { WindowSelectionWindow } from "@/features/staff/api";

export const mapWindowForSelection = (
  windowData: WindowSelectionWindow,
): ServiceWindow => ({
  id: windowData.id,
  service: 0,
  window_number: windowData.number,
  number: windowData.number,
  name: windowData.name,
  status: windowData.status,
  description: "",
  current_staff:
    typeof windowData.current_staff === "number"
      ? windowData.current_staff
      : null,
  created_at: "",
  updated_at: "",
  is_available: windowData.is_available,
  is_in_use: windowData.is_in_use,
  claimed_by: windowData.claimed_by,
  current_staff_name: windowData.current_staff_name ?? null,
});

export const getClaimBlockReason = (
  windowData: WindowSelectionWindow,
  currentUserName: string,
) => {
  if (windowData.status === "inactive") {
    return "inactive";
  }

  if (windowData.status === "maintenance") {
    return "maintenance";
  }

  if (!windowData.is_available) {
    return "unavailable";
  }

  const claimedByCurrentUser =
    !!windowData.claimed_by &&
    windowData.claimed_by.toLowerCase() === currentUserName.toLowerCase();

  if (windowData.is_in_use && !claimedByCurrentUser) {
    return "occupied";
  }

  return null;
};

export const getRequestErrorMessage = (error: any, fallback: string) => {
  const status = error?.response?.status;

  if (!status) {
    return "Network error. Please check your internet connection and try again.";
  }

  if (status === 400) return "Invalid request. Please refresh and try again.";
  if (status === 403)
    return "You are not allowed to claim this window. Please contact admin.";
  if (status === 404)
    return "Window not found. It may have been removed. Please refresh.";
  if (status === 409) return "Window currently in use";
  if (status >= 500)
    return "Server error while processing your request. Please try again.";

  return fallback;
};
