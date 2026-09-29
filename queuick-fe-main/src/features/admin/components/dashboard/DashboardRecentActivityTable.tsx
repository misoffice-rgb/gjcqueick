import React from "react";

import type { AdminAnalyticsRecentActivity } from "@/features/admin/types";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatActivityTime } from "./dashboardFormatters";

interface DashboardRecentActivityTableProps {
  recentActivity: AdminAnalyticsRecentActivity[];
}

const DashboardRecentActivityTable: React.FC<
  DashboardRecentActivityTableProps
> = ({ recentActivity }) => {
  if (recentActivity.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 p-5 text-sm text-muted-foreground">
        No recently served tickets found.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticket</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Served At</TableHead>
          <TableHead>Wait Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentActivity.map((activity) => (
          <TableRow key={`${activity.ticket}-${activity.served_at ?? "n/a"}`}>
            <TableCell className="font-mono text-xs font-semibold text-foreground">
              {activity.ticket}
            </TableCell>
            <TableCell>{activity.service}</TableCell>
            <TableCell>{formatActivityTime(activity.served_at)}</TableCell>
            <TableCell>{activity.wait_time.toFixed(1)} min</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DashboardRecentActivityTable;
