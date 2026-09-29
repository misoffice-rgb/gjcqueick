import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { staffApi } from "@/features/staff/api";
import type { WindowSelectionWindow } from "@/features/staff/api";
import type { StaffDashboardResponse } from "@/features/staff/types";
import type { Ticket } from "@/features/tickets/types";
import type { ServiceWindow } from "@/features/services/types";
import { useStaffWindowStore } from "@/store/staffWindowStore";
import { useAuthStore } from "@/store/authStore";
import { useQueueWebSocket } from "@/features/shared/hooks/useQueueWebSocket";
import { useWindowSelectionSocket } from "./useWindowSelectionSocket";
import { useWindowSelectionStore } from "@/store/windowSelectionStore";
import { useWindowOwnershipCleanup } from "./useWindowOwnershipCleanup";

export interface StaffQueueManagementState {
  dashboard: StaffDashboardResponse["dashboard"] | undefined;
  isLoading: boolean;
  isError: boolean;
  allTickets: Ticket[];
  userName: string | undefined;
  handleLogout: () => Promise<void>;
  selectedWindow: ServiceWindow | null;
  windowStatus: ServiceWindow["status"] | undefined;
  disableCallNext: boolean;
  activeTicketLabel: string | undefined;
  activeTicketId: string | undefined;
  isQueueEmpty: boolean;
  isLastTicket: boolean;
  pending: {
    leaveWindow: boolean;
    callNext: boolean;
    complete: boolean;
    skip: boolean;
    startServing: boolean;
    remove: boolean;
    recall: boolean;
  };
  handleLeaveWindow: () => Promise<void>;
  handleMainActionClick: () => void;
  handleStartServing: (ticketNumber: string) => void;
  handleComplete: (ticketId: string) => void;
  handleSkip: (ticketId: string) => void;
  handleRemove: (ticketId: string) => void;
  handleRecall: (ticketId: string) => void;
}

const getRequestErrorMessage = (error: any, fallback: string): string => {
  const backendMessage =
    error?.response?.data?.message ||
    error?.response?.data?.detail ||
    error?.response?.data?.error;

  if (backendMessage) {
    return String(backendMessage);
  }

  if (error?.request && !error?.response) {
    return "Request sent but no response came back. Check Django server, Vite proxy, or route.";
  }

  const status = error?.response?.status;

  if (!status) {
    return "Unexpected error. Please try again.";
  }

  if (status === 400) return "Invalid request. Please refresh and try again.";
  if (status === 403)
    return "You are not allowed to perform this action right now.";
  if (status === 404)
    return "Endpoint or ticket not found. Check the route and ticket id.";
  if (status === 409)
    return "Action conflict. Please refresh and try again.";
  if (status >= 500)
    return "Server error while processing your request. Check Django logs.";

  return fallback;
};

export const useStaffQueueManagement = (): StaffQueueManagementState => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    selectedWindow,
    serviceInfo,
    setSelectedWindow,
    clearSelectedWindow,
  } = useStaffWindowStore();
  const { user, logout } = useAuthStore();
  const { releaseLoading, setSelectedWindowId } = useWindowSelectionStore();
  const { releaseWindowExplicit } = useWindowOwnershipCleanup();
  const staffServiceId = serviceInfo?.id || user?.assigned_service?.id;
  const [staffSocketAuthFailed, setStaffSocketAuthFailed] = useState(false);

  const selectedWindowRef = useRef(selectedWindow);
  useEffect(() => {
    selectedWindowRef.current = selectedWindow;
  });

  const handleStaffRealtimeUpdate = useCallback(
    (event: MessageEvent) => {
      if (!event.data) {
        queryClient.invalidateQueries({ queryKey: ["staff-dashboard"] });
        return;
      }

      try {
        const payload = JSON.parse(String(event.data));

        if (
          payload?.type === "error" &&
          typeof payload?.message === "string" &&
          payload.message.toLowerCase().includes("authentication failed")
        ) {
          localStorage.removeItem("ws_access_token");
          setStaffSocketAuthFailed(true);
          queryClient.invalidateQueries({ queryKey: ["staff-dashboard"] });
          return;
        }

        if (payload?.type === "staff_update" && payload?.data) {
          const data = payload.data;

          const normalizedDashboard = {
            service:
              typeof data.service === "string"
                ? data.service
                : data.service?.name || serviceInfo?.name || "",
            waiting_count: data.waiting_count ?? 0,
            serving_count: data.serving_count ?? data.serving_list?.length ?? 0,
            next_ticket: data.next_ticket ?? null,
            currently_serving:
              data.currently_serving || data.serving_list || [],
            waiting_list: data.waiting_list || [],
            skipped_list: data.skipped_list || [],
            windows: data.windows || [],
          };

          queryClient.setQueryData(["staff-dashboard"], {
            success: true,
            dashboard: normalizedDashboard,
          });
          return;
        }
      } catch {
        // fall through
      }

      queryClient.invalidateQueries({ queryKey: ["staff-dashboard"] });
    },
    [queryClient, serviceInfo?.name],
  );

  const handleStaffSocketOpen = useCallback(
    (socket: WebSocket) => {
      if (staffSocketAuthFailed) {
        socket.close();
        return;
      }

      const cookies = document.cookie || "";
      const token = localStorage.getItem("ws_access_token") || undefined;

      if (!cookies.includes("access_token=") && !token) {
        socket.send(JSON.stringify({ type: "refresh" }));
        return;
      }

      socket.send(
        JSON.stringify({
          type: "authenticate",
          ...(cookies.includes("access_token=") ? { cookies } : {}),
          ...(token ? { token } : {}),
        }),
      );

      socket.send(JSON.stringify({ type: "refresh" }));
    },
    [staffSocketAuthFailed],
  );

  useQueueWebSocket({
    enabled: !!staffServiceId && !staffSocketAuthFailed,
    path: staffServiceId ? `/ws/staff/${staffServiceId}/` : "/ws/staff/0/",
    onOpen: handleStaffSocketOpen,
    onMessage: handleStaffRealtimeUpdate,
  });

  useQueueWebSocket({
    path: "/ws/dashboard/",
    onMessage: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-dashboard"] });
    },
  });

  const handleWindowUpdate = useCallback(
    (windows: WindowSelectionWindow[]) => {
      const currentWindow = selectedWindowRef.current;
      if (!currentWindow) return;

      const matchedWindow = windows.find(
        (windowItem) =>
          Number(windowItem.id) === Number(currentWindow.id) ||
          Number(windowItem.number) === Number(currentWindow.window_number),
      );

      if (!matchedWindow) return;

      if (matchedWindow.status !== "active") {
        clearSelectedWindow();
        setSelectedWindowId(null);
        toast.error(
          "Your claimed window is not usable right now. Please select a window again.",
        );
        navigate("/staff/onboarding", { replace: true });
        return;
      }

      const claimedByAnotherStaff =
        matchedWindow.is_in_use &&
        typeof matchedWindow.current_staff === "number" &&
        typeof user?.id === "number" &&
        matchedWindow.current_staff !== user.id;

      if (claimedByAnotherStaff) {
        clearSelectedWindow();
        setSelectedWindowId(null);
        toast.error(
          "This window is now claimed by another staff member. Please choose another window.",
        );
        navigate("/staff/onboarding", { replace: true });
        return;
      }

      setSelectedWindow({
        ...currentWindow,
        status: matchedWindow.status,
        is_available: matchedWindow.is_available,
        is_in_use:
          typeof matchedWindow.is_in_use === "boolean"
            ? matchedWindow.is_in_use
            : currentWindow.is_in_use,
        claimed_by: matchedWindow.claimed_by ?? currentWindow.claimed_by,
        current_staff_name:
          matchedWindow.current_staff_name ?? currentWindow.current_staff_name,
        current_staff:
          typeof matchedWindow.current_staff === "number"
            ? matchedWindow.current_staff
            : currentWindow.current_staff,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      clearSelectedWindow,
      navigate,
      setSelectedWindow,
      setSelectedWindowId,
      user?.id,
    ],
  );

  useWindowSelectionSocket({
    serviceId: staffServiceId,
    enabled: !!staffServiceId,
    onWindowsUpdate: handleWindowUpdate,
  });

  useEffect(() => {
    if (selectedWindow?.id) {
      setSelectedWindowId(selectedWindow.id);
    }
  }, [selectedWindow?.id, setSelectedWindowId]);

  const { data, isLoading, isError } = useQuery<StaffDashboardResponse>({
    queryKey: ["staff-dashboard"],
    queryFn: staffApi.getDashboard,
  });

  const dashboard = data?.dashboard;

  const invalidateDashboard = () =>
    queryClient.invalidateQueries({ queryKey: ["staff-dashboard"] });

  const callNextMutation = useMutation({
    mutationFn: () => staffApi.callNext({ window_id: selectedWindow?.id }),
    onSuccess: async (res) => {
      toast.success(res.message || "Next ticket called!");
      await invalidateDashboard();
    },
    onError: (err) => {
      toast.error(getRequestErrorMessage(err, "Failed to call next ticket."));
    },
  });

  const startServingMutation = useMutation({
    mutationFn: ({
      ticket_number,
      windowId,
    }: {
      ticket_number: string;
      windowId: number;
    }) => staffApi.callSpecific({ ticket_number, window_id: windowId }),
    onSuccess: async (res) => {
      toast.success(res.message || "Now serving ticket.");
      await invalidateDashboard();
    },
    onError: (err) => {
      toast.error(getRequestErrorMessage(err, "Failed to start serving."));
    },
  });

  const completeMutation = useMutation({
    mutationFn: staffApi.completeServing,
    onSuccess: async (res) => {
      toast.success(res.message || "Ticket marked as served.");
      await invalidateDashboard();
    },
    onError: (err) => {
      toast.error(getRequestErrorMessage(err, "Failed to complete serving."));
    },
  });

  const skipMutation = useMutation({
    mutationFn: (ticketId: string) =>
      staffApi.skipTicket(ticketId, {
        reason: "Customer not present",
      }),
    onSuccess: async (res) => {
      toast.success(res.message || "Ticket skipped.");
      await invalidateDashboard();
    },
    onError: (err) => {
      toast.error(getRequestErrorMessage(err, "Failed to skip ticket."));
    },
  });

  const removeMutation = useMutation({
    mutationFn: (ticketId: string) =>
      staffApi.removeTicket(ticketId, { reason: "Removed by staff" }),
    onSuccess: async (res) => {
      toast.success(res.message || "Ticket removed.");
      await invalidateDashboard();
    },
    onError: (err) => {
      toast.error(getRequestErrorMessage(err, "Failed to remove ticket."));
    },
  });

  const recallMutation = useMutation({
    mutationFn: staffApi.recallTicket,
    onSuccess: async (res) => {
      toast.success(res.message || "Ticket recalled to queue.");
      await invalidateDashboard();
    },
    onError: (err) => {
      toast.error(getRequestErrorMessage(err, "Failed to recall ticket."));
    },
  });

  const allTickets: Ticket[] = [
    ...(dashboard?.currently_serving || []),
    ...(dashboard?.waiting_list || []),
    ...(dashboard?.skipped_list || []),
  ];

  const selectedWindowId = Number(selectedWindow?.id);
  const selectedWindowNumber = Number(selectedWindow?.window_number);

  const activeWindowTicketObj = dashboard?.currently_serving?.find(
    (ticket) =>
      Number(ticket.assigned_window) === selectedWindowId ||
      Number(ticket.assigned_window_info?.id) === selectedWindowId ||
      Number(ticket.assigned_window_info?.window_number) ===
        selectedWindowNumber,
  );

  const activeWindowFromList = dashboard?.windows?.find(
    (windowItem) =>
      windowItem.id === selectedWindowId ||
      windowItem.number === selectedWindowNumber,
  );

  const windowServing = activeWindowFromList?.currently_serving;
  const windowServingDisplayNumber =
    typeof windowServing === "string"
      ? windowServing
      : windowServing?.display_number;

  const windowServingTicketId =
    typeof windowServing === "object" && windowServing
      ? windowServing.ticket_id
      : null;

  const activeTicketLabel =
    activeWindowTicketObj?.display_number || windowServingDisplayNumber;

  const activeTicketId =
    activeWindowTicketObj?.ticket_id ||
    windowServingTicketId ||
    dashboard?.currently_serving?.find(
      (ticket) => ticket.display_number === windowServingDisplayNumber,
    )?.ticket_id;

  const isServing = !!activeTicketLabel;
  const hasWaitingTickets = (dashboard?.waiting_count ?? 0) > 0 || !!dashboard?.next_ticket;
  const isQueueEmpty =
    (dashboard?.waiting_count ?? 0) === 0 && !dashboard?.next_ticket;
  const isLastTicket = isServing && !hasWaitingTickets;

  const windowStatus: ServiceWindow["status"] | undefined =
    selectedWindow?.status;
  const disableCallNext = !selectedWindow || windowStatus !== "active";

  const handleStartServing = (ticketNumber: string) => {
    if (disableCallNext) {
      toast.error("Cannot serve tickets while window or service is inactive.");
      return;
    }

    if (!selectedWindow?.id) {
      toast.error("Please select a window first");
      return;
    }

    startServingMutation.mutate({
      ticket_number: ticketNumber,
      windowId: selectedWindow.id,
    });
  };

  // Smart main action – handles both scenarios
  const handleMainActionClick = () => {
    if (disableCallNext) {
      toast.error("Please claim an active window before serving tickets.");
      return;
    }

    // Case 1: There's a serving ticket AND waiting tickets → call next (auto-completes current)
    if (isServing && hasWaitingTickets) {
      callNextMutation.mutate();
      return;
    }

    // Case 2: There's a serving ticket but NO waiting tickets → just complete it
    if (isServing && !hasWaitingTickets) {
      if (activeTicketId) {
        completeMutation.mutate(activeTicketId);
      } else {
        toast.error("No active ticket found to complete.");
      }
      return;
    }

    // Case 3: No serving ticket, just call next
    if (!isServing) {
      callNextMutation.mutate();
      return;
    }

    // Fallback
    toast.error("Unable to perform action. Please check queue status.");
  };

  const releaseCurrentWindow = async (): Promise<boolean> => {
    if (!selectedWindow?.id) return true;

    try {
      const result = await releaseWindowExplicit();
      if (result.skipped) return true;

      if (!result.released) {
        throw result.error;
      }

      toast.success("Window released.");
      return true;
    } catch (error: any) {
      toast.error(getRequestErrorMessage(error, "Failed to release window."));
      const shouldRetry = window.confirm(
        "Failed to release window due to network/server issue. Retry now?",
      );

      if (shouldRetry) {
        return releaseCurrentWindow();
      }

      return false;
    }
  };

  const handleLeaveWindow = async () => {
    const released = await releaseCurrentWindow();
    if (!released) return;
    navigate("/staff/onboarding");
  };

  const handleLogout = async () => {
    const released = await releaseCurrentWindow();
    if (!released) return;
    await logout();
  };

  return {
    dashboard,
    isLoading,
    isError,
    allTickets,
    userName: user?.username,
    handleLogout,
    selectedWindow,
    windowStatus,
    disableCallNext,
    activeTicketLabel,
    activeTicketId,
    isQueueEmpty,
    isLastTicket,
    pending: {
      leaveWindow: releaseLoading,
      callNext: callNextMutation.isPending,
      complete: completeMutation.isPending,
      skip: skipMutation.isPending,
      startServing: startServingMutation.isPending,
      remove: removeMutation.isPending,
      recall: recallMutation.isPending,
    },
    handleLeaveWindow,
    handleMainActionClick,
    handleStartServing,
    handleComplete: (ticketId: string) => completeMutation.mutate(ticketId),
    handleSkip: (ticketId: string) => skipMutation.mutate(ticketId),
    handleRemove: (ticketId: string) => removeMutation.mutate(ticketId),
    handleRecall: (ticketId: string) => recallMutation.mutate(ticketId),
  };
};