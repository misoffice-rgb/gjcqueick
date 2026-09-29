import { Archive, FileEdit, FileText } from "lucide-react";
import type { QueueService } from "@/features/services/types";

interface KioskServiceCardProps {
  service: QueueService;
  onSelect: (service: QueueService) => void;
}

const getServiceIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("cashier"))
    return <Archive className="w-8 h-8 text-brand-green" strokeWidth={2} />;
  if (lower.includes("registrar"))
    return <FileEdit className="w-8 h-8 text-brand-green" strokeWidth={2} />;
  return <FileText className="w-8 h-8 text-brand-green" strokeWidth={2} />;
};

const KioskServiceCard = ({ service, onSelect }: KioskServiceCardProps) => {
  return (
    <button
      key={service.id}
      className={`w-full flex items-center p-4 bg-white border border-gray-200 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-200 text-left group ${
        !service.is_active
          ? "opacity-60 cursor-not-allowed bg-gray-50"
          : "cursor-pointer hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-brand-green/30 active:scale-[0.98]"
      }`}
      onClick={() => {
        if (service.is_active) {
          onSelect(service);
        }
      }}
    >
      <div className="flex-shrink-0 size-16 rounded-2xl bg-[linear-gradient(135deg,rgba(44,153,15,0.14)_0%,rgba(255,255,255,1)_100%)] shadow-sm ring-1 ring-[#2c990f]/10 flex items-center justify-center mr-6 transition-colors relative">
        {getServiceIcon(service.name)}
        {!service.is_active && (
          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl"></div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-wide group-hover:text-brand-green transition-colors">
          {service.name}
        </h3>
        {service.description && (
          <p className="mt-1 text-xs font-bold text-gray-500">
            {service.description}
          </p>
        )}
        {!service.is_active && (
          <span className="inline-block mt-2 bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-md font-bold text-xs uppercase tracking-wide">
            Unavailable
          </span>
        )}
      </div>
    </button>
  );
};

export default KioskServiceCard;
