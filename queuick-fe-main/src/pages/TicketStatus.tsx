import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import TicketStatusHeader from "@/features/tickets/components/TicketStatusHeader";
import TicketNotifySection from "@/features/tickets/components/TicketNotifySection";
import TicketNotifyDialog from "@/features/tickets/components/TicketNotifyDialog";
import { useTicketStatusPage } from "@/features/tickets/hooks/useTicketStatusPage";

const TicketStatus = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const {
    ticketStatus,
    isLoading,
    isError,
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
  } = useTicketStatusPage(ticketId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading ticket information...</p>
      </div>
    );
  }

  if (isError || !ticketStatus) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error</CardTitle>
            <CardDescription className="text-red-600">
              Unable to load ticket details. The ticket ID might be invalid or
              expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { ticket, queue_info } = ticketStatus;

  return (
    <div className="min-h-screen bg-linear-to-b from-[#f8fbf8] via-[#f2f6f3] to-[#eef3f0] px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-md space-y-5">
        <TicketStatusHeader />

        <Card className="overflow-hidden rounded-3xl border border-[#d7e4dc] bg-white/95 shadow-[0_18px_45px_-28px_rgba(15,47,27,0.45)] backdrop-blur">
          <div className="border-b border-[#e7efea] bg-white px-6 py-7 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#67806f]">
              Your Ticket Number
            </span>
            <div className="mt-3 text-6xl font-black tracking-tight text-[#111a14]">
              {ticket.display_number}
            </div>
            <div className="mt-3">
              <Badge
                variant={ticket.status === "serving" ? "default" : "secondary"}
                className="rounded-full bg-[#0f7a39]/10 px-3 py-1 text-xs capitalize text-[#0f7a39] hover:bg-[#0f7a39]/10"
              >
                {ticket.status}
              </Badge>
            </div>
          </div>

          <CardContent className="space-y-4 p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#e3ece6] bg-[#f8fbf9] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#698272]">
                  Service
                </p>
                <p className="mt-1 text-sm font-semibold text-[#1c2921]">
                  {ticket.service_name}
                </p>
              </div>
              <div className="rounded-xl border border-[#e3ece6] bg-[#f8fbf9] p-3 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#698272]">
                  Position
                </p>
                <p className="mt-1 text-sm font-semibold text-[#1c2921]">
                  {queue_info.position}
                </p>
              </div>
            </div>

            <div className="space-y-2 rounded-2xl border border-[#c9decf] bg-[#0f7a39]/5 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0f7a39]">
                Currently Serving
              </h3>
              {currentlyServingDisplay ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-2xl font-bold text-[#1a241d]">
                    {currentlyServingDisplay}
                  </span>
                  <span className="text-right text-sm text-[#54685b]">
                    {currentlyServingWindow && `at ${currentlyServingWindow}`}
                  </span>
                </div>
              ) : (
                <p className="text-sm italic text-[#637a6b]">
                  Waiting for an active serving ticket...
                </p>
              )}
            </div>

            <div className="rounded-xl border border-[#e3ece6] bg-white p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#698272]">
                Ticket Date
              </p>
              <p className="mt-1 text-sm font-medium text-[#1f2b23]">
                {ticketDateDisplay}
              </p>
            </div>

            {ticket.notes && (
              <div className="rounded-xl border border-[#e3ece6] bg-white p-4">
                <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#698272]">
                  Notes
                </h3>
                <p className="text-sm text-[#2d3b32]">{ticket.notes}</p>
              </div>
            )}

            <TicketNotifySection
              shouldShow={shouldShowNotifyMe}
              requestedNotifyNumber={requestedNotifyNumber}
              onOpenRequest={() => {
                if (!requestedNotifyNumber) {
                  setPhoneError(null);
                  setIsNotifyDialogOpen(true);
                }
              }}
            />

            <div className="border-t border-[#e7efea] pt-3 text-[11px] text-[#708578]">
              Ticket ID: {ticket.ticket_id}
            </div>
          </CardContent>
        </Card>

        <TicketNotifyDialog
          shouldShow={shouldShowNotifyMe}
          open={isNotifyDialogOpen}
          phoneNumber={phoneNumber}
          phoneError={phoneError}
          isSubmitting={isSubmittingSmsOptIn}
          onOpenChange={(open) => {
            setIsNotifyDialogOpen(open);
            if (!open) {
              setPhoneError(null);
            }
          }}
          onPhoneChange={handlePhoneChange}
          onSubmit={handleNotifySubmit}
        />
      </div>
    </div>
  );
};

export default TicketStatus;
