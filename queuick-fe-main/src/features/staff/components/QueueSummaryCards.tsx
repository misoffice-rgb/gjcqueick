import React from "react";
import { PhoneForwarded, Users } from "lucide-react";
import type { StaffDashboardData } from "@/features/staff/types";

interface QueueSummaryCardsProps {
  dashboard: StaffDashboardData;
  nowServingLabel?: string;
}

const QueueSummaryCards: React.FC<QueueSummaryCardsProps> = ({
  dashboard,
  nowServingLabel,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      <Card title="Now Serving" value={nowServingLabel || "—"} icon={Users} />

      <Card title="Waiting" value={dashboard.waiting_count || 0} icon={Users} />

      <Card
        title="Next Ticket"
        value={dashboard.next_ticket || "—"}
        icon={PhoneForwarded}
      />
    </div>
  );
};

const Card = ({ title, value = "—", icon: Icon }: any) => {
  return (
    <div className="sm:col-span-2 relative overflow-hidden rounded-[1.5rem] border border-brand-green/30 bg-white p-4 md:col-span-1">
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-blue-200/25 blur-2xl" />
      <div className="relative flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(44,153,15,0.14)_0%,rgba(255,255,255,1)_100%)] shadow-sm ring-1 ring-[#2c990f]/10">
          <Icon className="h-5 w-5 text-brand-green" />
        </div>
        <div>
          <p className="text-2xl font-black tracking-tight text-slate-900">
            {value}
          </p>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QueueSummaryCards;
