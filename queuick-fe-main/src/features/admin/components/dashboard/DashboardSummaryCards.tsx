import React from "react";
import { Activity, CheckCircle2, Clock3, Ticket, Users } from "lucide-react";

import type { AdminAnalyticsSummary } from "@/features/admin/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SummaryCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  helper?: string;
  gradient?: string;
  iconBg?: string;
  iconColor?: string;
};

const SummaryCard = ({
  title,
  value,
  icon,
  helper,
  gradient,
  iconBg,
  iconColor,
}: SummaryCardProps) => (
  <Card
    className={`relative overflow-hidden border-0 shadow-md ${gradient || "bg-card"}`}
  >
    <CardHeader className="pb-3 z-10 relative">
      <CardDescription className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground/90">
        {title}
      </CardDescription>
      <CardTitle className="flex items-end justify-between mt-2 tracking-tight text-foreground">
        <span className="text-3xl font-bold">{value}</span>
        <div
          className={`p-2.5 rounded-xl ${iconBg || "bg-muted"} ${iconColor || "text-muted-foreground"}`}
        >
          {icon}
        </div>
      </CardTitle>
    </CardHeader>
    {helper ? (
      <CardContent className="pt-0 text-xs text-muted-foreground z-10 relative">
        {helper}
      </CardContent>
    ) : null}
  </Card>
);

interface DashboardSummaryCardsProps {
  summary: AdminAnalyticsSummary;
}

const DashboardSummaryCards: React.FC<DashboardSummaryCardsProps> = ({
  summary,
}) => {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      <SummaryCard
        title="Total Tickets Issued"
        value={summary.total_tickets_issued.toString()}
        icon={<Ticket className="h-5 w-5" />}
        gradient="border-b-2 border-b-primary"
        iconBg="bg-primary/10"
        iconColor="text-primary"
      />
      <SummaryCard
        title="Total Tickets Served"
        value={summary.total_tickets_served.toString()}
        icon={<CheckCircle2 className="h-5 w-5" />}
        gradient="border-b-2 border-b-primary"
        iconBg="bg-primary/10"
        iconColor="text-primary"
      />
      <SummaryCard
        title="Completion Rate"
        value={`${summary.completion_rate.toFixed(1)}%`}
        icon={<Activity className="h-5 w-5" />}
        gradient="border-b-2 border-b-primary"
        iconBg="bg-primary/10"
        iconColor="text-primary"
      />
      <SummaryCard
        title="Currently Waiting"
        value={summary.currently_waiting.toString()}
        icon={<Clock3 className="h-5 w-5" />}
        gradient="border-b-2 border-b-primary"
        iconBg="bg-primary/10"
        iconColor="text-primary"
      />
      <SummaryCard
        title="Currently Serving"
        value={summary.currently_serving.toString()}
        icon={<Users className="h-5 w-5" />}
        gradient="border-b-2 border-b-primary"
        iconBg="bg-primary/10"
        iconColor="text-primary"
      />
    </section>
  );
};

export default DashboardSummaryCards;
