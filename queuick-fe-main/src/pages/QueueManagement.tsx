import { formatWindowLabel } from "@/lib/windowLabel";
import QueueSummaryCards from "@/features/staff/components/QueueSummaryCards";
import QueueTicketsTable from "@/features/staff/components/QueueTicketsTable";
import QueueActionCards from "@/features/staff/components/QueueActionCards";
import { useStaffQueueManagement } from "@/features/staff/hooks/useStaffQueueManagement";
import { LogOut, UserRound, BadgeInfo } from "lucide-react";
import { toast } from "sonner";

const QueueManagement = () => {
  const {
    dashboard,
    isLoading,
    isError,
    allTickets,
    userName,
    handleLogout,
    selectedWindow,
    windowStatus,
    disableCallNext,
    activeTicketLabel,
    activeTicketId,
    isQueueEmpty,
    isLastTicket,
    pending,
    handleLeaveWindow,
    handleMainActionClick,
    handleStartServing,
    handleComplete,
    handleSkip,
    handleRemove,
    handleRecall,
  } = useStaffQueueManagement();

  const serviceWindowLabel = `${formatWindowLabel(selectedWindow, "")}`.trim();

  const handleTopSkip = () => {
    if (!activeTicketId) {
      toast.error("No active ticket found to skip.");
      return;
    }

    handleSkip(activeTicketId);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-[radial-gradient(circle_at_top,#ecffd8_0%,#f7fdf1_26%,#fffef8_58%,#f8fafc_100%)]">
        <div className="flex min-h-[70vh] items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-[#2c990f]/15 bg-white/85 px-10 py-8 shadow-[0_20px_50px_rgba(44,153,15,0.10)] backdrop-blur">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#2c990f]/15 border-b-[#dcbc34]" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-semibold text-brand-green">
                Loading queue dashboard...
              </p>
              <p className="text-xs text-muted-foreground">
                Preparing live staff queue controls
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="h-screen bg-[radial-gradient(circle_at_top,#ecffd8_0%,#f7fdf1_26%,#fffef8_58%,#f8fafc_100%)]">
        <div className="flex min-h-[70vh] items-center justify-center p-8">
          <div className="w-full max-w-md rounded-[2rem] border border-[#2c990f]/10 bg-white/90 p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(44,153,15,0.10)_0%,rgba(220,188,52,0.16)_100%)]">
              <BadgeInfo className="h-8 w-8 text-[#2c990f]/70" />
            </div>
            <p className="text-xl font-bold text-brand-green">
              Unable to load dashboard
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Make sure you are assigned to a service.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[radial-gradient(circle_at_top,#ecffd8_0%,#f7fdf1_24%,#fffef7_58%,#f8fafc_100%)] font-sans">
      <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-6">
        <header className="relative overflow-hidden rounded-[2rem] border border-brand-green/30 bg-white px-5 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur md:px-6">
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1.5">
              <h1 className="text-3xl font-black tracking-tight text-brand-green md:text-4xl">
                Queue Management
              </h1>
              <p className="text-sm text-slate-600">
                Staff operations dashboard
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center rounded-full bg-[linear-gradient(135deg,rgba(44,153,15,0.14)_0%,rgba(255,255,255,1)_100%)] px-3 py-1.5 text-xs font-semibold text-brand-green shadow-sm ring-1 ring-[#2c990f]/10">
                Service: {serviceWindowLabel}
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-white px-3 py-1.5 text-xs font-medium uppercase text-slate-700">
                <UserRound className="h-3.5 w-3.5" />
                {userName || "Unknown"}
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-full border border-red-100 bg-white px-4 text-sm font-semibold text-gray-700 transition-all hover:border-red-200 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <QueueActionCards
          windowStatus={windowStatus}
          disableCallNext={disableCallNext}
          isQueueEmpty={isQueueEmpty}
          isLastTicket={isLastTicket}
          nextTicket={dashboard.next_ticket}
          activeTicketLabel={activeTicketLabel}
          isLeaveWindowPending={pending.leaveWindow}
          isMainActionPending={pending.callNext || pending.complete}
          isSkipPending={pending.skip}
          onLeaveWindow={handleLeaveWindow}
          onMainAction={handleMainActionClick}
          onSkip={handleTopSkip}
        />

        <QueueSummaryCards
          dashboard={dashboard}
          nowServingLabel={activeTicketLabel}
        />

        <QueueTicketsTable
          tickets={allTickets}
          disableStartServing={disableCallNext}
          onStartServing={handleStartServing}
          onComplete={handleComplete}
          onSkip={handleSkip}
          onRemove={handleRemove}
          onRecall={handleRecall}
          isServingPending={pending.startServing}
          isCompletingPending={pending.complete}
          isSkippingPending={pending.skip}
          isRemovingPending={pending.remove}
          isRecallingPending={pending.recall}
        />
      </div>
    </div>
  );
};

export default QueueManagement;