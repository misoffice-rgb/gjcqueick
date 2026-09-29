import React from "react";
import type { Ticket } from "@/features/tickets/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PlayCircle,
  CheckCircle2,
  Trash2,
  RotateCcw,
  Ticket as TicketIcon,
  SkipForward,
} from "lucide-react";

const statusConfig: Record<string, { label: string; className: string }> = {
  waiting: {
    label: "Waiting",
    className: "border-[#dcbc34]/25 bg-[#fff7dd] text-[#8c6f00]",
  },
  notified: {
    label: "Notified",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  serving: {
    label: "Serving",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  served: {
    label: "Served",
    className: "border-slate-200 bg-slate-100 text-slate-500",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-red-200 bg-red-50 text-red-600",
  },
  skipped: {
    label: "Skipped",
    className: "border-orange-200 bg-orange-50 text-orange-600",
  },
};

interface QueueTicketsTableProps {
  tickets: Ticket[];
  disableStartServing?: boolean;
  onStartServing: (ticketNumber: string) => void;
  onComplete: (ticketId: string) => void;
  onSkip: (ticketId: string) => void;
  onRemove: (ticketId: string) => void;
  onRecall: (ticketId: string) => void;
  isServingPending: boolean;
  isCompletingPending: boolean;
  isSkippingPending: boolean;
  isRemovingPending: boolean;
  isRecallingPending: boolean;
}

const GRID_COLS = "grid grid-cols-[1fr_120px_auto] items-center gap-4 px-6";

const ColumnHeaders = () => (
  <div
    className={`${GRID_COLS} bg-white py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70`}
  >
    <span>Ticket #</span>
    <span className="text-center">Status</span>
    <span className="text-center sm:w-[280px]">Actions</span>
  </div>
);

const QueueTicketsTable: React.FC<QueueTicketsTableProps> = ({
  tickets,
  disableStartServing = false,
  onStartServing,
  onComplete,
  onSkip,
  onRemove,
  onRecall,
  isServingPending,
  isCompletingPending,
  isSkippingPending,
  isRemovingPending,
  isRecallingPending,
}) => {
  const visibleTickets = tickets.filter(
    (ticket) => ticket.status !== "serving",
  );

  if (visibleTickets.length === 0) {
    return (
      <div className="overflow-hidden rounded-[1.75rem] border border-brand-green/30 bg-white">
        <ColumnHeaders />
        <div className="flex flex-col items-center justify-center gap-3 border-t border-[#2c990f]/8 py-16 text-sm text-muted-foreground">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(44,153,15,0.10)_0%,rgba(220,188,52,0.14)_100%)]">
            <TicketIcon className="size-8 text-[#2c990f]/55" />
          </div>
          <div className="text-center">
            <p className="font-medium text-brand-green">No tickets in queue</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Tickets will appear here when customers join the queue
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderRowActions = (ticket: Ticket) => {
    const s = ticket.status;

    return (
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        {(s === "waiting" || s === "notified" || s === "skipped") && (
          <Button
            size="sm"
            className="h-8 cursor-pointer rounded-lg bg-brand-green px-3 text-xs font-semibold text-white shadow-sm hover:bg-[#24820c]"
            onClick={() => onStartServing(ticket.display_number)}
            disabled={isServingPending || disableStartServing}
          >
            <PlayCircle className="mr-1 h-3.5 w-3.5" />
            Serve
          </Button>
        )}

        {s === "serving" && (
          <>
            <Button
              size="sm"
              className="h-8 cursor-pointer rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
              onClick={() => onComplete(ticket.ticket_id)}
              disabled={isCompletingPending}
            >
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              Complete
            </Button>

            <Button
              size="sm"
              className="h-8 cursor-pointer rounded-lg bg-orange-500 px-3 text-xs font-semibold text-white shadow-sm hover:bg-orange-600"
              onClick={() => onSkip(ticket.ticket_id)}
              disabled={isSkippingPending}
            >
              <SkipForward className="mr-1 h-3.5 w-3.5" />
              Skip
            </Button>
          </>
        )}

        {(s === "waiting" ||
          s === "notified" ||
          s === "serving" ||
          s === "skipped") && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 cursor-pointer rounded-lg border-red-200 bg-white px-3 text-xs font-semibold text-red-600 hover:bg-red-50"
            onClick={() => onRemove(ticket.ticket_id)}
            disabled={isRemovingPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}

        {s === "cancelled" && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 cursor-pointer rounded-lg border-blue-200 bg-white px-3 text-xs font-semibold text-blue-600 hover:bg-blue-50"
            onClick={() => onRecall(ticket.ticket_id)}
            disabled={isRecallingPending}
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Recall
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-brand-green/30 bg-white">
      <ColumnHeaders />
      <div className="max-h-[40vh] overflow-y-auto divide-y divide-[#2c990f]/8">
        {visibleTickets.map((ticket) => {
          const config = statusConfig[ticket.status] || {
            label: ticket.status,
            className: "border-slate-200 bg-slate-100 text-slate-600",
          };

          return (
            <div
              key={ticket.ticket_id}
              className={`group ${GRID_COLS} py-3.5 transition-all duration-150 hover:bg-[linear-gradient(90deg,rgba(44,153,15,0.04)_0%,rgba(255,255,255,1)_60%,rgba(220,188,52,0.05)_100%)]`}
            >
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex h-10 min-w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(44,153,15,0.14)_0%,rgba(255,255,255,1)_100%)] shadow-sm ring-1 ring-[#2c990f]/10">
                  <TicketIcon className="h-4 w-4 text-brand-green" />
                </div>
                <span className="text-base font-black tracking-tight">
                  {ticket.display_number}
                </span>
              </div>

              <div>
                <Badge
                  variant="outline"
                  className={`${config.className} rounded-full px-2.5 py-1 font-semibold`}
                >
                  {config.label}
                </Badge>
              </div>

              <div className="text-right">{renderRowActions(ticket)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QueueTicketsTable;
