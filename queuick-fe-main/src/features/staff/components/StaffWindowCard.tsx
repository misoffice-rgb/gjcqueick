import { Archive, FileEdit, FileText } from "lucide-react";
import type { WindowSelectionWindow } from "@/features/staff/api";

const getServiceIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("cashier"))
    return <Archive className="size-5 text-brand-green" strokeWidth={2} />;
  if (lower.includes("registrar"))
    return <FileEdit className="size-5 text-brand-green" strokeWidth={2} />;
  return <FileText className="size-5 text-brand-green" strokeWidth={2} />;
};

export interface StaffWindowCardProps {
  windowData: WindowSelectionWindow;
  serviceName: string;
  currentUserName: string;
  claimLoading: number | null;
  selectedWindowId: number | null;
  isPending: boolean;
  onSelect: (windowData: WindowSelectionWindow) => void;
}

export const StaffWindowCard = ({
  windowData,
  serviceName,
  currentUserName,
  claimLoading,
  selectedWindowId,
  isPending,
  onSelect,
}: StaffWindowCardProps) => {
  const claimedByCurrentUser =
    !!windowData.claimed_by &&
    windowData.claimed_by.toLowerCase() === currentUserName.toLowerCase();

  const blocked =
    windowData.status === "inactive" ||
    windowData.status === "maintenance" ||
    !windowData.is_available ||
    (windowData.is_in_use && !claimedByCurrentUser);

  const occupiedBy =
    windowData.claimed_by || windowData.current_staff_name || null;

  const statusText =
    windowData.status === "inactive"
      ? "Unavailable"
      : !windowData.is_available
        ? "Temporarily unavailable"
        : windowData.status === "maintenance"
          ? "Under maintenance"
          : windowData.is_in_use
            ? occupiedBy
              ? `In use by ${occupiedBy}`
              : "In use"
            : "Available";

  const overlayLabel =
    windowData.status === "maintenance"
      ? "Maintenance"
      : windowData.status === "inactive"
        ? "Inactive"
        : null;

  return (
    <button
      className={`group relative overflow-hidden bg-white rounded-xl p-6 border border-brand-green/30 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-200 text-center flex items-center gap-4 ${
        blocked
          ? "opacity-60 cursor-not-allowed bg-gray-50"
          : "cursor-pointer hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-brand-green/30 active:scale-[0.98]"
      }`}
      disabled={blocked || isPending}
      onClick={() => {
        if (!blocked) {
          onSelect(windowData);
        }
      }}
    >
      <div className="flex-shrink-0 size-10 rounded-xl bg-[linear-gradient(135deg,rgba(44,153,15,0.14)_0%,rgba(255,255,255,1)_100%)] shadow-sm ring-1 ring-[#2c990f]/10 flex items-center justify-center transition-colors relative">
        {getServiceIcon(serviceName)}
      </div>
      <div className="flex flex-col items-start">
        <h3 className="text-sm md:text-base font-black text-gray-900 uppercase tracking-wide group-hover:text-brand-green transition-colors">
          {windowData.name}
        </h3>
        <p className="mt-1 text-xs md:text-sm font-medium text-gray-400 group-hover:text-gray-500 transition-colors">
          {statusText}
        </p>
        {claimLoading === windowData.id && (
          <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-brand-green">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
            Claiming...
          </div>
        )}
        {selectedWindowId === windowData.id && (
          <span className="mt-3 rounded-full border border-brand-green/25 bg-brand-green/10 px-3 py-1 text-xs font-semibold text-brand-green">
            Selected
          </span>
        )}

        {overlayLabel && (
          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-md font-bold text-xs uppercase tracking-wide shadow-sm">
              {overlayLabel}
            </span>
          </div>
        )}
      </div>
    </button>
  );
};
