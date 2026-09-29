import React, { useMemo } from "react";
import { parse, format } from "date-fns";

import type { AdminAnalyticsPeakHour } from "@/features/admin/types";

interface DashboardPeakHoursListProps {
  peakHours: AdminAnalyticsPeakHour[];
}

const formatHour = (hourString: string) => {
  try {
    // If hour is simply "14", "09", pad it to "14:00:00" temporarily so parse works
    let normalizedHour = hourString;
    if (/^\d{1,2}$/.test(hourString)) {
      normalizedHour = `${hourString.padStart(2, '0')}:00:00`;
    }
    
    // Attempt parse
    const parsed = parse(normalizedHour, "HH:mm:ss", new Date());
    
    // If invalid date resulting, throw to fallback
    if (isNaN(parsed.getTime())) throw new Error("Invalid format");
    
    return format(parsed, "h:mm a");
  } catch (err) {
    // If backend only gives "14" string and parsing fails, manually format fallback
    if (/^\d{1,2}$/.test(hourString)) {
       const h = parseInt(hourString, 10);
       const ampm = h >= 12 ? 'PM' : 'AM';
       const h12 = h % 12 || 12;
       return `${h12}:00 ${ampm}`;
    }
    return hourString;
  }
};

const DashboardPeakHoursList: React.FC<DashboardPeakHoursListProps> = ({
  peakHours,
}) => {
  const maxTickets = useMemo(
    () =>
      peakHours.reduce((max, item) => Math.max(max, item.tickets_issued), 0),
    [peakHours],
  );

  if (peakHours.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 p-5 text-sm text-muted-foreground">
        No ticket activity for the configured peak-hour window today.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {peakHours.map((hour) => {
        const widthPct =
          maxTickets > 0 ? (hour.tickets_issued / maxTickets) * 100 : 0;

        return (
          <div key={hour.hour} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>{formatHour(hour.hour)}</span>
              <span>{hour.tickets_issued} tickets</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${Math.max(widthPct, 6)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardPeakHoursList;
