import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  MonitorUp,
  TabletSmartphone,
  CalendarDays,
  Filter,
  Download,
} from "lucide-react";
import { toast } from "sonner";

import { adminApi } from "@/features/admin/api";
import DashboardPeakHoursChart from "@/features/admin/components/dashboard/DashboardPeakHoursChart";
import DashboardRecentActivityTable from "@/features/admin/components/dashboard/DashboardRecentActivityTable";
import DashboardServicesTable from "@/features/admin/components/dashboard/DashboardServicesTable";
import DashboardSummaryCards from "@/features/admin/components/dashboard/DashboardSummaryCards";
import { formatTimestamp } from "@/features/admin/components/dashboard/dashboardFormatters";
import { getErrorMessage } from "@/lib/errorUtils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AnalyticsPreset = "today" | "yesterday" | "7days" | "30days";

const Dashboard = () => {
  const [preset, setPreset] = useState<AnalyticsPreset>("today");
  const [isExporting, setIsExporting] = useState(false);

  const queryParams = useMemo(() => {
    const today = new Date();

    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    if (preset === "today") {
      return undefined;
    }

    if (preset === "yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return { date: formatLocalDate(yesterday) };
    }

    if (preset === "7days") {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);

      return {
        start_date: formatLocalDate(start),
        end_date: formatLocalDate(today),
      };
    }

    if (preset === "30days") {
      const start = new Date(today);
      start.setDate(today.getDate() - 29);

      return {
        start_date: formatLocalDate(start),
        end_date: formatLocalDate(today),
      };
    }

    return undefined;
  }, [preset]);

  const filterLabel = useMemo(() => {
    switch (preset) {
      case "today":
        return "Today's analytics overview";
      case "yesterday":
        return "Yesterday's analytics overview";
      case "7days":
        return "Last 7 days analytics overview";
      case "30days":
        return "Last 30 days analytics overview";
      default:
        return "Analytics overview";
    }
  }, [preset]);

  const peakHoursDescription = useMemo(() => {
    switch (preset) {
      case "today":
        return "Tickets issued by time slot for today.";
      case "yesterday":
        return "Tickets issued by time slot for yesterday.";
      case "7days":
        return "Tickets issued by time slot for the last 7 days.";
      case "30days":
        return "Tickets issued by time slot for the last 30 days.";
      default:
        return "Tickets issued by time slot.";
    }
  }, [preset]);

  const recentActivityDescription = useMemo(() => {
    switch (preset) {
      case "today":
        return "Most recently served tickets and their waiting times for today.";
      case "yesterday":
        return "Most recently served tickets and their waiting times for yesterday.";
      case "7days":
        return "Most recently served tickets within the last 7 days.";
      case "30days":
        return "Most recently served tickets within the last 30 days.";
      default:
        return "Most recently served tickets and their waiting times.";
    }
  }, [preset]);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["admin-dashboard-analytics", preset, queryParams],
    queryFn: () => adminApi.getDashboardAnalytics(queryParams),
    refetchInterval: 60_000,
  });

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const blob = await adminApi.exportTicketsCSV(queryParams);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `queuick_export_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Data exported successfully!");
    } catch {
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f3ffe9_0%,#f8fafc_45%,#f8fafc_100%)]">
        <div className="container mx-auto flex min-h-[70vh] items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-[#2c990f]/10 bg-white/80 px-10 py-8 shadow-xl backdrop-blur">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#2c990f]/15 border-b-[#2c990f]" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium text-brand-green">
                Loading dashboard analytics...
              </p>
              <p className="text-xs text-muted-foreground">
                Preparing the latest queue insights
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.analytics) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f3ffe9_0%,#f8fafc_45%,#f8fafc_100%)]">
        <div className="mx-auto max-w-4xl p-8">
          <Card className="overflow-hidden border-0 shadow-xl">
            <CardHeader className="bg-linear-to-r from-[#2c990f]/10 via-white to-[#dcbc34]/10">
              <CardTitle className="text-xl text-brand-green">
                Dashboard Analytics
              </CardTitle>
              <CardDescription>
                {getErrorMessage(error, "Failed to load dashboard analytics")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => refetch()}
                  className="bg-brand-green text-white hover:bg-[#24820c]"
                >
                  Retry
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPreset("today")}
                  className="border-[#2c990f]/20 text-brand-green"
                >
                  Reset to Today
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { analytics } = data;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f3ffe9_0%,#f8fafc_45%,#f8fafc_100%)]">
      <div className="mx-auto max-w-7xl space-y-6 p-4">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-linear-to-r from-[#2c990f]/18 via-white to-[#dcbc34]/18 px-6 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur md:px-8">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.30)_0%,rgba(255,255,255,0.05)_100%)]" />
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-green/15 blur-3xl" />
          <div className="absolute -bottom-8 left-10 h-28 w-28 rounded-full bg-[#dcbc34]/25 blur-3xl" />
          <div className="absolute right-1/3 top-0 h-full w-px bg-linear-to-b from-transparent via-white/60 to-transparent" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-brand-green md:text-4xl">
                  Dashboard Overview
                </h1>
                <p className="mt-1 text-sm text-slate-600 md:text-base">
                  {filterLabel}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs text-slate-600 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-brand-green" />
                Last updated: {formatTimestamp(analytics.timestamp)}
                {isFetching ? " (refreshing...)" : ""}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                asChild
                variant="outline"
                className="h-10 rounded-xl border-[#2c990f]/15 bg-white/85 px-4 text-brand-green shadow-sm backdrop-blur hover:bg-[#f7fff2]"
              >
                <Link to="/kiosk">
                  <TabletSmartphone className="mr-2 h-4 w-4" />
                  Open Kiosk
                </Link>
              </Button>

              <Button
                asChild
                className="h-10 rounded-xl bg-brand-green px-4 text-white shadow-sm hover:bg-[#24820c]"
              >
                <Link to="/monitoring">
                  <MonitorUp className="mr-2 h-4 w-4" />
                  Open Monitoring
                </Link>
              </Button>

              <Button
                onClick={handleExportCSV}
                disabled={isExporting}
                className="h-10 rounded-xl bg-brand-green px-4 text-white shadow-sm hover:bg-[#24820c]"
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "Exporting..." : "Export CSV"}
              </Button>
            </div>
          </div>
        </section>

        <Card className="overflow-hidden rounded-[1.5rem] border-0 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.06)] ring-1 ring-[#2c990f]/8">
          <div className="h-1 w-full bg-linear-to-r from-[#2c990f] via-[#9ed640] to-[#dcbc34]" />
          <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-brand-green">
                <Filter className="h-4 w-4 text-[#2c990f]" />
                Quick Filters
              </div>
              <p className="text-xs text-muted-foreground">
                Switch between recent analytics periods instantly.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={preset === "today" ? "default" : "outline"}
                onClick={() => setPreset("today")}
                className={
                  preset === "today"
                    ? "rounded-full bg-brand-green text-white hover:bg-[#24820c]"
                    : "rounded-full border-[#2c990f]/20 text-brand-green hover:bg-[#f7fff2]"
                }
              >
                Today
              </Button>

              <Button
                size="sm"
                variant={preset === "yesterday" ? "default" : "outline"}
                onClick={() => setPreset("yesterday")}
                className={
                  preset === "yesterday"
                    ? "rounded-full bg-brand-green text-white hover:bg-[#24820c]"
                    : "rounded-full border-[#2c990f]/20 text-brand-green hover:bg-[#f7fff2]"
                }
              >
                Yesterday
              </Button>

              <Button
                size="sm"
                variant={preset === "7days" ? "default" : "outline"}
                onClick={() => setPreset("7days")}
                className={
                  preset === "7days"
                    ? "rounded-full bg-[#dcbc34] text-[#3f3200] hover:bg-[#c9ad2f]"
                    : "rounded-full border-[#dcbc34]/30 text-[#8c6f00] hover:bg-[#fff9e8]"
                }
              >
                Last 7 Days
              </Button>

              <Button
                size="sm"
                variant={preset === "30days" ? "default" : "outline"}
                onClick={() => setPreset("30days")}
                className={
                  preset === "30days"
                    ? "rounded-full bg-[#dcbc34] text-[#3f3200] hover:bg-[#c9ad2f]"
                    : "rounded-full border-[#dcbc34]/30 text-[#8c6f00] hover:bg-[#fff9e8]"
                }
              >
                Last 30 Days
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => refetch()}
                className="rounded-full text-slate-600 hover:bg-slate-100"
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        <DashboardSummaryCards summary={analytics.summary} />

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="overflow-hidden rounded-[1.5rem] border-0 bg-white shadow-[0_16px_35px_rgba(0,0,0,0.06)] ring-1 ring-[#2c990f]/8 xl:col-span-2">
            <CardHeader className="border-b border-[#2c990f]/10 bg-linear-to-r from-[#2c990f]/8 via-white to-white pb-4">
              <CardTitle className="text-lg text-brand-green">
                Service Performance
              </CardTitle>
              <CardDescription>
                Tickets, throughput, queue pressure, and waiting estimates by
                service.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <DashboardServicesTable
                services={analytics.services}
                queryParams={queryParams}
              />
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-[1.5rem] border-0 bg-white shadow-[0_16px_35px_rgba(0,0,0,0.06)]">
            <CardHeader className="border-b border-[#2c990f]/10 bg-linear-to-r from-[#2c990f]/8 via-white to-white pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-brand-green">
                Peak Hours
              </CardTitle>
              <CardDescription>{peakHoursDescription}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <DashboardPeakHoursChart peakHours={analytics.peak_hours} />
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="overflow-hidden rounded-[1.5rem] border-0 bg-white shadow-[0_16px_35px_rgba(0,0,0,0.06)] ring-1 ring-[#dcbc34]/12">
            <CardHeader className="border-b border-[#dcbc34]/15 bg-linear-to-r from-white via-white to-[#fff8e1] pb-4">
              <CardTitle className="text-lg text-brand-green">
                Recent Activity
              </CardTitle>
              <CardDescription>{recentActivityDescription}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-2">
              <DashboardRecentActivityTable
                recentActivity={analytics.recent_activity}
              />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
