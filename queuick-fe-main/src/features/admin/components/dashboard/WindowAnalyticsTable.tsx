import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  TrendingUp,
  Clock,
  Calendar,
  AlertCircle,
  Download,
} from "lucide-react";
import { adminApi, type AnalyticsQueryParams } from "@/features/admin/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface WindowAnalyticsModalProps {
  serviceId: number;
  serviceName: string;
  queryParams?: AnalyticsQueryParams;
  onClose: () => void;
}

const WindowAnalyticsModal = ({
  serviceId,
  serviceName,
  queryParams,
  onClose,
}: WindowAnalyticsModalProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["window-analytics", serviceId, queryParams],
    queryFn: () => adminApi.getWindowAnalytics(serviceId, queryParams),
    enabled: !!serviceId,
  });

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const blob = await adminApi.exportWindowPerformanceCSV(serviceId, queryParams);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `window_performance_${serviceName}_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Window data exported successfully!");
    } catch {
      toast.error("Failed to export window data");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-4xl rounded-lg bg-white p-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-xl font-bold text-brand-green">Window Performance</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="py-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand-green/20 border-t-brand-green" />
            <p className="mt-4 text-gray-500">Loading window analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-4xl rounded-lg bg-white p-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-xl font-bold text-brand-green">Window Performance</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="py-8 text-center">
            <p className="text-red-500">
              Failed to load window analytics. Please try again.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { summary, windows } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white p-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-xl font-bold text-brand-green">Window Performance</h2>
            <p className="text-sm text-gray-500">
              {serviceName} - {data.date_range}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleExportCSV}
              disabled={isExporting}
              variant="outline"
              size="sm"
              className="border-brand-green/30 text-brand-green hover:bg-brand-green/10"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Exporting..." : "Export CSV"}
            </Button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mb-6 mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-brand-green/20 bg-brand-green/5 p-3">
            <div className="flex items-center gap-2 text-sm text-brand-green">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">Total Windows</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">{summary.total_windows}</p>
            <p className="text-xs text-gray-500">{summary.active_windows} active</p>
          </div>

          <div className="rounded-lg border border-emerald-500/20 bg-emerald-50 p-3">
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Served</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">{summary.total_served}</p>
            <p className="text-xs text-gray-500">selected period</p>
          </div>

          <div className="rounded-lg border border-red-500/20 bg-red-50 p-3">
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Cancelled</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">{summary.total_cancelled}</p>
            <p className="text-xs text-gray-500">selected period</p>
          </div>

          <div className="rounded-lg border border-blue-500/20 bg-blue-50 p-3">
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Avg Wait</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {summary.overall_avg_wait_minutes}
            </p>
            <p className="text-xs text-gray-500">minutes per ticket</p>
          </div>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-brand-green/5">
                <TableHead>Window</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Served</TableHead>
                <TableHead>Cancelled</TableHead>
                <TableHead>Avg Wait Time</TableHead>
                <TableHead>Currently Serving</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {windows.map((window: any) => (
                <TableRow key={window.window_id}>
                  <TableCell className="font-medium">{window.window_name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        window.status === "active"
                          ? "border-green-500 text-green-600"
                          : "border-red-500 text-red-600"
                      }
                    >
                      {window.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{window.tickets_served}</TableCell>
                  <TableCell className="text-red-600">{window.tickets_cancelled}</TableCell>
                  <TableCell>{window.avg_wait_minutes} min</TableCell>
                  <TableCell>
                    {window.currently_serving ? (
                      <Badge className="bg-emerald-500">Serving Now</Badge>
                    ) : (
                      <span className="text-gray-400">Idle</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <p className="mt-4 text-xs text-gray-400">Data for period: {data.date_range}</p>
      </div>
    </div>
  );
};

export default WindowAnalyticsModal;