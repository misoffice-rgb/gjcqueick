import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Archive, FileEdit, FileText } from "lucide-react";

interface ConfirmServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceName?: string;
  pending: boolean;
  onConfirm: () => void;
}

const getServiceIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("cashier"))
    return <Archive className="w-6 h-6 text-brand-green" strokeWidth={2} />;
  if (lower.includes("registrar"))
    return <FileEdit className="w-6 h-6 text-brand-green" strokeWidth={2} />;
  return <FileText className="w-6 h-6 text-brand-green" strokeWidth={2} />;
};

const ConfirmServiceDialog = ({
  open,
  onOpenChange,
  serviceName,
  pending,
  onConfirm,
}: ConfirmServiceDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl overflow-hidden sm:rounded-3xl">
        <DialogHeader className="text-left mb-2">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Confirm your service
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="py-2 text-center">
          <span className="text-gray-900 text-base font-medium mb-3 block">
            Your selected service
          </span>
          <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm w-full max-w-[280px] mx-auto">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[linear-gradient(135deg,rgba(44,153,15,0.14)_0%,rgba(255,255,255,1)_100%)] shadow-sm ring-1 ring-[#2c990f]/10 flex items-center justify-center">
              {serviceName ? (
                getServiceIcon(serviceName)
              ) : (
                <FileText
                  className="w-6 h-6 text-brand-green"
                  strokeWidth={2}
                />
              )}
            </div>
            <h3 className="font-bold text-xl text-gray-900 uppercase">
              {serviceName}
            </h3>
          </div>
        </DialogDescription>
        <DialogFooter className="grid grid-cols-2 gap-4 w-full pt-4">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="w-full h-12 text-base font-semibold border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={onConfirm}
            disabled={pending}
            className="w-full h-12 text-base font-semibold bg-brand-green hover:bg-brand-green/90 text-white rounded-xl shadow-md"
          >
            {pending ? "Please wait..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmServiceDialog;
