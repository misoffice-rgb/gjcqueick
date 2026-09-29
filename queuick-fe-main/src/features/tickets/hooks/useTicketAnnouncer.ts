import { useEffect, useRef } from "react";
import type { DashboardServiceDetail, DashboardServiceWindow } from "../types";
import { formatWindowLabel } from "@/lib/windowLabel";

export const useTicketAnnouncer = (
  services: DashboardServiceDetail[] | undefined,
) => {
  const previousTicketsRef = useRef<Record<string, string>>({});
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!services) return;

    const currentTickets: Record<string, string> = {};
    const newCalls: { ticketNumber: string; windowLabel: string }[] = [];

    services.forEach((service) => {
      if (service.currently_serving) {
        service.currently_serving.forEach((window: DashboardServiceWindow) => {
          if (!window.ticket_number || window.ticket_number === "---") return;

          const windowLabel = formatWindowLabel(window, "");

          const key = `${service.id}-${windowLabel}`;

          currentTickets[key] = window.ticket_number;

          if (
            hasInitializedRef.current &&
            previousTicketsRef.current[key] !== window.ticket_number
          ) {
            newCalls.push({
              ticketNumber: window.ticket_number,
              windowLabel,
            });
          }
        });
      }
    });

    previousTicketsRef.current = currentTickets;
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      return;
    }

    if (newCalls.length > 0) {
      newCalls.forEach(({ ticketNumber, windowLabel }) => {
        // Format ticket number with spaces for better TTS pronunciation (e.g. "A 0 0 1")
        const spokenTicket = ticketNumber.split("").join(" ");
        const spokenWindow = windowLabel || "the window";

        const utterance = new SpeechSynthesisUtterance(
          `Ticket ${spokenTicket} Please proceed to ${spokenWindow}.`,
        );
        utterance.rate = 1.2; // Slightly slower for clarity
        utterance.pitch = 1;

        // Optional: Pick a good English voice if available
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(
          (v) => v.lang.includes("en-") && v.localService,
        );
        if (englishVoice) {
          utterance.voice = englishVoice;
        }

        window.speechSynthesis.speak(utterance);
      });
    }
  }, [services]);
};
