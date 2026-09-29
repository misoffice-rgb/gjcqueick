import { useRef } from "react";
import { CalendarDays } from "lucide-react";

interface QueueDateFilterBarProps {
  dateFilter: "today" | "yesterday" | "custom";
  customDate: string;
  onDateFilterChange: (filter: "today" | "yesterday" | "custom") => void;
  onCustomDateChange: (value: string) => void;
}

const QueueDateFilterBar = ({
  dateFilter,
  customDate,
  onDateFilterChange,
  onCustomDateChange,
}: QueueDateFilterBarProps) => {
  const customDateInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Tickets</h2>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onDateFilterChange("today")}
            className={`h-9 rounded-md border px-3 text-sm font-medium transition-colors ${
              dateFilter === "today"
                ? "border-brand-green bg-brand-green text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Today
          </button>

          <button
            type="button"
            onClick={() => onDateFilterChange("yesterday")}
            className={`h-9 rounded-md border px-3 text-sm font-medium transition-colors ${
              dateFilter === "yesterday"
                ? "border-brand-green bg-brand-green text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Yesterday
          </button>

          <button
            type="button"
            onClick={() => {
              onDateFilterChange("custom");
              customDateInputRef.current?.showPicker?.();
              customDateInputRef.current?.click();
              customDateInputRef.current?.focus();
            }}
            className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors ${
              dateFilter === "custom"
                ? "border-brand-green bg-brand-green text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            {dateFilter === "custom" && customDate
              ? `Date: ${customDate}`
              : "Filter Date"}
          </button>

          <input
            ref={customDateInputRef}
            type="date"
            value={customDate}
            onChange={(event) => {
              onCustomDateChange(event.target.value);
              onDateFilterChange("custom");
            }}
            className="sr-only"
          />
        </div>
      </div>
    </div>
  );
};

export default QueueDateFilterBar;
