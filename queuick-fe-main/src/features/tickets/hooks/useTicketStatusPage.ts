import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ticketApi } from "@/features/tickets/api";
import type { TicketStatusResponse } from "@/features/tickets/types";
import { useQueueWebSocket } from "@/features/shared/hooks/useQueueWebSocket";
import { formatWindowLabel } from "@/lib/windowLabel";
import { getErrorMessage } from "@/lib/errorUtils";

interface UseTicketStatusPageResult {
  ticketStatus: TicketStatusResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  isNotifyDialogOpen: boolean;
  phoneNumber: string;
  phoneError: string | null;
  requestedNotifyNumber: string;
  isSubmittingSmsOptIn: boolean;
  currentlyServingDisplay: string | undefined;
  currentlyServingWindow: string;
  ticketDateDisplay: string;
  shouldShowNotifyMe: boolean;
  setIsNotifyDialogOpen: (open: boolean) => void;
  setPhoneError: (value: string | null) => void;
  handlePhoneChange: (value: string) => void;
  handleNotifySubmit: () => Promise<void>;
}

const validatePhPhoneNumber = (value: string) => {
  const normalized = value.replace(/[\s()-]/g, "");
  const isValid = /^(09\d{9}|\+?639\d{9})$/.test(normalized);

  return {
    isValid,
    normalized,
  };
};

const getFallbackDateLabel = (createdAt?: string) => {
  if (!createdAt) return "Date unavailable";

  const parsedDate = new Date(createdAt);
  if (Number.isNaN(parsedDate.getTime())) return "Date unavailable";

  return parsedDate.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const useTicketStatusPage = (
  ticketId: string | undefined,
): UseTicketStatusPageResult => {
  const queryClient = useQueryClient();
  const [isNotifyDialogOpen, setIsNotifyDialogOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [requestedNotifyNumber, setRequestedNotifyNumber] = useState("");

  const { mutateAsync: submitSmsOptIn, isPending: isSubmittingSmsOptIn } =
    useMutation({
      mutationFn: ({ id, phone }: { id: string; phone: string }) =>
        ticketApi.smsOptIn(id, phone),
    });

  const handleRealtimeUpdate = useCallback(
    (event: MessageEvent) => {
      if (!ticketId) return;

      if (!event.data) {
        queryClient.invalidateQueries({ queryKey: ["ticketStatus", ticketId] });
        return;
      }

      try {
        const payload = JSON.parse(String(event.data));
        if (payload?.type === "ticket_update" && payload?.data) {
          const data = payload.data;
          const payloadTicketId = data?.ticket_id || data?.ticketId;

          if (!payloadTicketId || payloadTicketId === ticketId) {
            queryClient.setQueryData(
              ["ticketStatus", ticketId],
              (previous: any) => ({
                success: true,
                ticket: {
                  ...(previous?.ticket || {}),
                  ...data,
                },
                queue_info: {
                  ...(previous?.queue_info || {}),
                  ...(data?.queue_info || {}),
                },
              }),
            );
            return;
          }
        }

        const payloadTicketId = payload?.ticket_id || payload?.ticketId;
        if (!payloadTicketId || payloadTicketId === ticketId) {
          queryClient.invalidateQueries({
            queryKey: ["ticketStatus", ticketId],
          });
        }
      } catch {
        queryClient.invalidateQueries({ queryKey: ["ticketStatus", ticketId] });
      }
    },
    [queryClient, ticketId],
  );

  useQueueWebSocket({
    enabled: !!ticketId,
    path: ticketId ? `/ws/ticket/${ticketId}/` : "/ws/ticket/",
    onMessage: handleRealtimeUpdate,
  });

  useQueueWebSocket({
    enabled: !!ticketId,
    path: "/ws/dashboard/",
    onMessage: () => {
      if (!ticketId) return;
      queryClient.invalidateQueries({ queryKey: ["ticketStatus", ticketId] });
    },
  });

  const {
    data: ticketStatus,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ticketStatus", ticketId],
    queryFn: () => ticketApi.getTicketStatus(ticketId!),
    enabled: !!ticketId,
  });

  const ticket = ticketStatus?.ticket;
  const queueInfo = ticketStatus?.queue_info;
  const currentlyServing = queueInfo?.currently_serving;

  const currentlyServingDisplay =
    typeof currentlyServing === "string"
      ? currentlyServing
      : currentlyServing?.display_number;

  const currentlyServingWindow = ticket
    ? formatWindowLabel(
        {
          ...ticket.assigned_window_info,
          window_number:
            ticket.assigned_window_info?.window_number ??
            ticket.assigned_window,
        },
        "",
      )
    : "";

  const ticketDateDisplay =
    ticket?.ticket_date || getFallbackDateLabel(ticket?.created_at);

  const shouldShowNotifyMe = useMemo(() => {
    const parsedQueuePosition = Number(queueInfo?.position);
    return Number.isFinite(parsedQueuePosition) && parsedQueuePosition > 5;
  }, [queueInfo?.position]);

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    if (phoneError) {
      setPhoneError(null);
    }
  };

  const handleNotifySubmit = async () => {
    if (!ticketId) {
      toast.error("Unable to save notification", {
        description: "Ticket ID is missing.",
      });
      return;
    }

    const { isValid, normalized } = validatePhPhoneNumber(phoneNumber);

    if (!isValid) {
      setPhoneError(
        "Enter a valid PH number starting with 09 or 639 (e.g. 09171234567 or 639171234567).",
      );
      return;
    }

    setPhoneError(null);

    try {
      await submitSmsOptIn({ id: ticketId, phone: normalized });

      setRequestedNotifyNumber(normalized);
      setIsNotifyDialogOpen(false);
      setPhoneNumber("");

      toast.success("Notification request saved", {
        description:
          "You will be notified once when your ticket is near to be called.",
      });
    } catch (submitError: any) {
      toast.error("Failed to save notification request", {
        description: getErrorMessage(
          submitError,
          "Please try again in a moment.",
        ),
      });
    }
  };

  return {
    ticketStatus,
    isLoading,
    isError: !!error,
    isNotifyDialogOpen,
    phoneNumber,
    phoneError,
    requestedNotifyNumber,
    isSubmittingSmsOptIn,
    currentlyServingDisplay,
    currentlyServingWindow,
    ticketDateDisplay,
    shouldShowNotifyMe,
    setIsNotifyDialogOpen,
    setPhoneError,
    handlePhoneChange,
    handleNotifySubmit,
  };
};
