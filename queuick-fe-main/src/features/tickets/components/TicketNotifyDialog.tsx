import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TicketNotifyDialogProps {
  shouldShow: boolean;
  open: boolean;
  phoneNumber: string;
  phoneError: string | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onPhoneChange: (value: string) => void;
  onSubmit: () => Promise<void>;
}

const TicketNotifyDialog = ({
  shouldShow,
  open,
  phoneNumber,
  phoneError,
  isSubmitting,
  onOpenChange,
  onPhoneChange,
  onSubmit,
}: TicketNotifyDialogProps) => {
  if (!shouldShow) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border border-[#d8e5dd] bg-[#f9fcfa]">
        <DialogHeader>
          <DialogTitle className="text-[#173523]">
            Get Near-Turn Notification
          </DialogTitle>
          <DialogDescription className="text-[#5c7265]">
            Enter a PH mobile number (starts with 09 or 639). You will only be
            notified once, and only when your position is near to be called.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Input
            type="tel"
            inputMode="numeric"
            placeholder="09171234567 or 639171234567"
            value={phoneNumber}
            onChange={(event) => onPhoneChange(event.target.value)}
            className="border-[#c8d9cd]"
          />

          {phoneError && <p className="text-xs text-red-600">{phoneError}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-[#0f7a39] hover:bg-[#0f7a39]/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Notification Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TicketNotifyDialog;
