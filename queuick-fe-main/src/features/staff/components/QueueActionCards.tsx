import { useState, useCallback } from "react";
import {
  ChevronRight,
  LogOut,
  Mic,
  CheckCircle2,
  SkipForward,
} from "lucide-react";

interface QueueActionCardsProps {
  windowStatus?: "active" | "inactive" | "maintenance";
  disableCallNext: boolean;
  isQueueEmpty: boolean;
  isLastTicket: boolean;
  nextTicket: string | null | undefined;
  activeTicketLabel?: string;
  isLeaveWindowPending: boolean;
  isMainActionPending: boolean;
  isSkipPending: boolean;
  onLeaveWindow: () => void;
  onMainAction: () => void;
  onSkip: () => void;
}

const QueueActionCards = ({
  windowStatus,
  disableCallNext,
  isQueueEmpty,
  isLastTicket,
  nextTicket,
  activeTicketLabel,
  isLeaveWindowPending,
  isMainActionPending,
  isSkipPending,
  onLeaveWindow,
  onMainAction,
  onSkip,
}: QueueActionCardsProps) => {
  const isWindowActive = windowStatus === "active";
  const isServing = !!activeTicketLabel;
  const [isCooldown, setIsCooldown] = useState(false);

  // Hide skip button when it's the last ticket or not serving
  const showSkipButton = isServing && !isLastTicket;

  // Determine if this is the last ticket action (Complete instead of Call Next)
  const isCompleteOnly = isServing && isLastTicket;

  const handleMainAction = useCallback(() => {
    if (isCooldown) {
      onMainAction();
      return;
    }

    setIsCooldown(true);
    setTimeout(() => setIsCooldown(false), 3000);
    onMainAction();
  }, [isCooldown, onMainAction]);

  // Get button text based on state
  const getButtonText = () => {
    if (isCompleteOnly) {
      return "Complete Ticket";
    }
    return "Call Next";
  };

  // Get button description based on state
  const getButtonDescription = () => {
    if (nextTicket && !isQueueEmpty && !isCompleteOnly) {
      return isServing
        ? `Complete ${activeTicketLabel} and call ${nextTicket}`
        : `Call ${nextTicket}`;
    }
    if (isCompleteOnly) {
      return `Complete ${activeTicketLabel || "current ticket"}`;
    }
    if (isServing) {
      return `Complete ${activeTicketLabel || "current ticket"}`;
    }
    return "No tickets waiting";
  };

  return (
    <div
      className={`grid gap-4 ${
        showSkipButton
          ? "grid-cols-1 lg:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2"
      }`}
    >
      {/* Leave Window */}
      <button
        className="group relative h-30 cursor-pointer overflow-hidden rounded-[1.75rem] border border-brand-green/30 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green/60 hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        onClick={onLeaveWindow}
        disabled={isLeaveWindowPending}
      >
        <div className="relative flex h-full items-center gap-4 px-5">
          <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(44,153,15,0.14)_0%,rgba(255,255,255,1)_100%)] shadow-sm ring-1 ring-[#2c990f]/10 transition-colors duration-200">
            <LogOut className="h-6 w-6 text-brand-green transition-colors duration-200 group-hover:text-inherit" />
          </div>

          <div className="min-w-0 text-left">
            <h3 className="text-lg font-bold text-slate-900 md:text-xl">
              Leave Window
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {isWindowActive
                ? "Release your active window and return to selection"
                : "Return to window selection"}
            </p>
          </div>

          <div className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/85 shadow-sm transition-transform duration-200 group-hover:translate-x-0.5">
            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-brand-green" />
          </div>
        </div>
      </button>

      {/* Main Action - Changes based on isCompleteOnly */}
      <button
        className={`group relative h-30 cursor-pointer overflow-hidden rounded-[1.75rem] border transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 ${
          isCompleteOnly
            ? "border-emerald-600/40 bg-emerald-600"
            : "border-[#2c990f]/30 bg-brand-green"
        }`}
        onClick={handleMainAction}
        disabled={
          isMainActionPending ||
          isCooldown ||
          (isQueueEmpty && !isServing) ||
          disableCallNext
        }
      >
        <div
          className={`absolute inset-0 ${
            isCompleteOnly ? "bg-emerald-600" : "bg-brand-green"
          }`}
        />

        <div className="relative flex h-full items-center gap-4 px-5">
          <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-white/12 shadow-inner ring-1 ring-white/15 backdrop-blur-sm">
            {isCompleteOnly ? (
              <CheckCircle2 className="h-6 w-6 text-white" />
            ) : (
              <Mic className="h-6 w-6 text-white" />
            )}
          </div>

          <div className="min-w-0 flex-1 text-left">
            <h3 className="text-lg font-black text-white md:text-xl">
              {getButtonText()}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-white/85">
              {getButtonDescription()}
            </p>
          </div>

          <div className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/12 ring-1 ring-white/15 transition-transform duration-200 group-hover:translate-x-0.5">
            <ChevronRight className="h-5 w-5 text-white/70" />
          </div>
        </div>
      </button>

      {/* Skip Button - Orange color */}
      {showSkipButton && (
        <button
          className="group relative h-30 cursor-pointer overflow-hidden rounded-[1.75rem] border border-orange-300 bg-orange-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-400 hover:bg-orange-600 hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onSkip}
          disabled={isSkipPending}
        >
          <div className="absolute inset-0 bg-orange-500" />

          <div className="relative flex h-full items-center gap-4 px-5">
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-white/12 shadow-inner ring-1 ring-white/15 backdrop-blur-sm">
              <SkipForward className="h-6 w-6 text-white" />
            </div>

            <div className="min-w-0 flex-1 text-left">
              <h3 className="text-lg font-black text-white md:text-xl">
                Skip Ticket
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-white/85">
                Mark {activeTicketLabel || "current ticket"} as skipped
              </p>
            </div>

            <div className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/12 ring-1 ring-white/15 transition-transform duration-200 group-hover:translate-x-0.5">
              <ChevronRight className="h-5 w-5 text-white/70" />
            </div>
          </div>
        </button>
      )}
    </div>
  );
};

export default QueueActionCards;
