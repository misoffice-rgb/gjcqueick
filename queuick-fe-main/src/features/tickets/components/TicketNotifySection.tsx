import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TicketNotifySectionProps {
  shouldShow: boolean;
  requestedNotifyNumber: string;
  onOpenRequest: () => void;
}

const TicketNotifySection = ({
  shouldShow,
  requestedNotifyNumber,
  onOpenRequest,
}: TicketNotifySectionProps) => {
  if (!shouldShow) return null;

  return (
    <div className="rounded-xl border border-dashed border-[#cadace] bg-[#f8fbf9] p-3 text-center">
      <p className="text-xs text-[#4d6557]">
        Want a heads-up when your turn is almost up?
      </p>
      <Button
        type="button"
        variant={requestedNotifyNumber ? "secondary" : "default"}
        onClick={onOpenRequest}
        disabled={!!requestedNotifyNumber}
        className="mt-3 w-full bg-[#0f7a39] text-white hover:bg-[#0f7a39]/90 disabled:cursor-not-allowed disabled:opacity-100"
      >
        <Bell className="h-4 w-4" />
        {requestedNotifyNumber
          ? "Notification Request Saved"
          : "Notify Me When Near My Turn"}
      </Button>

      {requestedNotifyNumber && (
        <p className="mt-2 text-[11px] text-[#5f7568]">
          One-time alert set for {requestedNotifyNumber}.
        </p>
      )}
    </div>
  );
};

export default TicketNotifySection;
