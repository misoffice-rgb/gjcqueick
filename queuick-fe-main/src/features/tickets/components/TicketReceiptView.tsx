import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import type { QueueService } from "@/features/services/types";
import type { TicketGenerationResponse } from "@/features/tickets/types";
import { FRONTEND_ORIGIN } from "@/constants";

interface TicketReceiptViewProps {
  ticketData: TicketGenerationResponse;
  selectedService: QueueService | null;
  onReset: () => void;
}

const TicketReceiptView = ({
  ticketData,
  selectedService,
  onReset,
}: TicketReceiptViewProps) => {
  const statusUrl = `${FRONTEND_ORIGIN}/tickets/${ticketData.ticket.ticket_id}/status`;
  const now = new Date();

  const windows = ticketData.windows || selectedService?.windows || [];
  const windowLabel =
    windows.length > 0
      ? windows.map((windowItem) => `${windowItem.window_number}`).join(", ")
      : "Any Window";

  const ticketDate = now.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const ticketTime = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="ticket-print-screen flex flex-col items-center justify-center w-full animate-in fade-in zoom-in duration-300 ">
      <div className="thermal-ticket max-w-44 bg-white shadow-xl relative font-mono text-black rounded-sm print:rounded-none print:shadow-none print:w-[45mm] print:max-w-[45mm]">
        <div className="px-4 py-4 print:p-0 flex flex-col gap-3">
          <div className="border-b-2 border-dashed border-black pb-2 text-center">
            <h1 className="text-xl font-black uppercase tracking-[0.12em] text-black print:text-[22px]">
              QUEUICK
            </h1>
          </div>

          <div className="text-center border-b-2 border-dashed border-black pb-3">
            <p className="text-[11px] uppercase font-semibold text-neutral-500 tracking-[0.08em] mb-1">
              Your Ticket Number
            </p>
            <span className="text-4xl font-black tracking-[0.08em] leading-none text-black print:text-[36px]">
              {ticketData.ticket?.display_number}
            </span>
          </div>

          <div className="border-b-2 border-dashed border-black pb-3">
            <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 text-[10px] uppercase tracking-[0.08em] text-neutral-500 mb-1">
              <span>Service</span>
              <span className="font-semibold text-right text-black text-[11px] tracking-[0.05em]">
                {ticketData.ticket.service}
              </span>
              <span>Window</span>
              <span className="font-semibold text-right text-black text-[11px] normal-case tracking-[0.02em]">
                {windowLabel}
              </span>
              <span>Date</span>
              <span className="font-medium text-right text-black text-[11px] normal-case tracking-normal">
                {ticketDate}
              </span>
              <span>Time</span>
              <span className="font-medium text-right text-black text-[11px] tracking-[0.03em]">
                {ticketTime}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5 w-full pt-1">
            <div className="bg-white p-1 border border-neutral-200 rounded-sm">
              <QRCodeSVG value={statusUrl} size={82} level="L" />
            </div>
            <p className="text-[10px] uppercase font-semibold text-black text-center leading-tight tracking-[0.06em]">
              Scan to Track Your Status
            </p>
          </div>

          <div className="w-full pt-2 border-t-2 border-dashed border-black text-center">
            <p className="font-semibold text-[11px] uppercase tracking-[0.08em] text-black">
              Please Wait Your Turn to Be Called
            </p>
          </div>
        </div>
      </div>

      <Button
        size="lg"
        className="thermal-ticket-controls mt-6 text-base px-7 shadow-lg font-bold uppercase bg-brand-green hover:bg-brand-green/90 text-white rounded-full transition-all hover:scale-105 print:hidden"
        onClick={onReset}
      >
        Print Another Ticket
      </Button>
    </div>
  );
};

export default TicketReceiptView;
