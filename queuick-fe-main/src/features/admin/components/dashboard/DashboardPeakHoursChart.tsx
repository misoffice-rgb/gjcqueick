import { format, parse } from "date-fns";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

interface PeakHourItem {
  time_slot?: string;
  label?: string;
  hour?: string;
  tickets_issued?: number;
  count?: number;
}

interface DashboardPeakHoursChartProps {
  peakHours: PeakHourItem[];
}

const formatHourLabel = (value: string): string => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "N/A";
  }

  const rangeMatch = trimmedValue.match(/^(.+?)\s*[-–]\s*(.+)$/);
  if (rangeMatch) {
    const startLabel = formatHourLabel(rangeMatch[1]);
    const endLabel = formatHourLabel(rangeMatch[2]);

    return `${startLabel} - ${endLabel}`;
  }

  const normalizedValue = /^\d{1,2}$/.test(trimmedValue)
    ? `${trimmedValue.padStart(2, "0")}:00:00`
    : /^\d{1,2}:\d{2}$/.test(trimmedValue)
      ? `${trimmedValue}:00`
      : trimmedValue;

  const parsedHour = parse(normalizedValue, "HH:mm:ss", new Date());

  if (Number.isNaN(parsedHour.getTime())) {
    return trimmedValue;
  }

  return format(parsedHour, "h:mm a");
};

const DashboardPeakHoursChart = ({
  peakHours,
}: DashboardPeakHoursChartProps) => {
  const chartData = (peakHours || []).map((item) => ({
    label: formatHourLabel(item.time_slot || item.label || item.hour || "N/A"),
    tickets: item.tickets_issued ?? item.count ?? 0,
  }));

  if (!chartData.length) {
    return (
      <div className="flex h-70 items-center justify-center rounded-xl border border-dashed border-[#2c990f]/20 bg-[#f6fff2] text-sm text-muted-foreground">
        No peak hour data available yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="h-70 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap={18}>
            <defs>
              {/* 🔥 GREEN → YELLOW GRADIENT */}
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#108c10" />
                <stop offset="100%" stopColor="#108c10" />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="#dff0d8"
            />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tick={{ fill: "#4b5563" }}
            />

            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tick={{ fill: "#4b5563" }}
            />

            <Tooltip
              cursor={{ fill: "rgba(44,153,15,0.08)" }}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid rgba(44,153,15,0.15)",
                boxShadow: "0 10px 30px rgba(44,153,15,0.15)",
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(6px)",
              }}
              labelStyle={{ color: "#19670A", fontWeight: 600 }}
            />

            <Bar dataKey="tickets" radius={[12, 12, 6, 6]}>
              {chartData.map((_, index) => (
                <Cell key={index} fill="url(#barGradient)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🔥 MINI CARDS UPGRADE */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {chartData.slice(0, 4).map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-[#dcbc34]/15 bg-white px-3 py-2"
          >
            <p className="text-xs text-[#6b7280]">{item.label}</p>
            <p className="text-sm font-semibold text-brand-green">
              {item.tickets} tickets
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPeakHoursChart;
