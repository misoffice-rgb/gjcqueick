import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useStaffWindowStore } from "@/store/staffWindowStore";
import { serviceApi } from "@/features/services/api";
import { Button } from "@/components/ui/button";
import { LogOut, RefreshCw } from "lucide-react";
import { staffApi, type WindowSelectionWindow } from "@/features/staff/api";
import { useWindowSelectionStore } from "@/store/windowSelectionStore";
import { useWindowSelectionSocket } from "@/features/staff/hooks/useWindowSelectionSocket";
import { useWindowOwnershipCleanup } from "@/features/staff/hooks/useWindowOwnershipCleanup";
import { SplitLayout } from "@/components/layout/SplitLayout";
import { StaffWindowCard } from "@/features/staff/components/StaffWindowCard";
import {
  mapWindowForSelection,
  getClaimBlockReason,
  getRequestErrorMessage,
} from "@/features/staff/utils/windowUtils";

const StaffOnboarding = () => {
  const { user, logout } = useAuthStore();
  const { serviceInfo, setSelectedWindow, selectedWindow } =
    useStaffWindowStore();

  const {
    windows,
    claimLoading,
    releaseLoading,
    selectedWindowId,
    setWindows,
    setSelectedWindowId,
    setClaimLoading,
    resetSelectionState,
  } = useWindowSelectionStore();
  const { releaseWindowExplicit } = useWindowOwnershipCleanup();
  const navigate = useNavigate();

  const claimWindowMutation = useMutation({
    mutationFn: ({
      windowId,
      staffAccountId,
    }: {
      windowId: number;
      staffAccountId: number;
    }) =>
      staffApi.claimWindow({
        window_id: windowId,
        staff_account_id: staffAccountId,
      }),
    onSuccess: (claimedWindow) => {
      setSelectedWindow(mapWindowForSelection(claimedWindow));
      setSelectedWindowId(claimedWindow.id);
      setClaimLoading(null);
      toast.success("Window claimed successfully.");
      navigate("/queue-management");
    },
    onError: (error: any) => {
      setClaimLoading(null);
      const status = error?.response?.status;

      if (status === 409) {
        toast.error("Window currently in use");
        return;
      }

      toast.error(getRequestErrorMessage(error, "Failed to claim window."));
    },
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["service-windows", serviceInfo?.id],
    queryFn: () => serviceApi.getServiceWindows(serviceInfo!.id),
    enabled: !!serviceInfo?.id,
  });

  useWindowSelectionSocket({
    serviceId: serviceInfo?.id,
    enabled: !!serviceInfo?.id,
  });

  const queryWindows = data?.windows || [];

  const normalizedQueryWindows: WindowSelectionWindow[] = queryWindows.map(
    (windowItem) => ({
      id: windowItem.id,
      name: windowItem.name,
      number: windowItem.number ?? windowItem.window_number,
      status: windowItem.status,
      is_in_use:
        typeof windowItem.is_in_use === "boolean"
          ? windowItem.is_in_use
          : false,
      is_available: windowItem.is_available,
      claimed_by: windowItem.claimed_by ?? null,
      current_staff_name: windowItem.current_staff_name ?? null,
      current_staff: windowItem.current_staff,
    }),
  );

  const effectiveWindows =
    windows.length > 0 ? windows : normalizedQueryWindows;

  const currentUserName = user?.username || "";

  const handleRefresh = async () => {
    await refetch();
    setWindows(normalizedQueryWindows);
  };

  const handleReleaseCurrentWindow = async (): Promise<boolean> => {
    if (!selectedWindow?.id) {
      return true;
    }

    try {
      const result = await releaseWindowExplicit();
      if (result.skipped) {
        return true;
      }

      if (!result.released) {
        throw result.error;
      }

      toast.success("Window released.");
      return true;
    } catch (error: any) {
      const message = getRequestErrorMessage(
        error,
        "Failed to release window.",
      );
      toast.error(message);
      const shouldRetry = window.confirm(
        "Failed to release window due to network/server issue. Retry now?",
      );

      if (shouldRetry) {
        return handleReleaseCurrentWindow();
      }

      return false;
    }
  };

  useEffect(() => {
    if (selectedWindow?.id) {
      handleReleaseCurrentWindow().catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    const released = await handleReleaseCurrentWindow();
    if (!released) {
      return;
    }

    resetSelectionState();
    await logout();
  };

  const handleSelectWindow = async (windowData: WindowSelectionWindow) => {
    if (!user?.id) {
      toast.error("Your account is not ready. Please log in again.");
      return;
    }

    const blockReason = getClaimBlockReason(windowData, currentUserName);
    if (blockReason === "maintenance") {
      return;
    }

    if (blockReason === "inactive" || blockReason === "unavailable") {
      toast.error("Window is not available for claiming right now.");
      return;
    }

    if (blockReason === "occupied") {
      toast.error("Window currently in use");
      return;
    }

    if (selectedWindow?.id && selectedWindow.id !== windowData.id) {
      const previousRelease = await releaseWindowExplicit();
      if (!previousRelease.released && !previousRelease.skipped) {
        toast.error(
          getRequestErrorMessage(
            previousRelease.error,
            "Failed to switch window. Could not release your current window.",
          ),
        );
        return;
      }
    }

    setClaimLoading(windowData.id);
    claimWindowMutation.mutate({
      windowId: windowData.id,
      staffAccountId: user.id,
    });
  };

  if (!serviceInfo) {
    return (
      <SplitLayout
        leftTitle={
          <>
            WELCOME,
            <br />
            {user?.username?.toUpperCase() || "STAFF"}!
          </>
        }
        leftSubtitle="Let's get you queued up."
      >
        <div className="text-center space-y-4">
          <p className="text-xl font-semibold text-gray-700">
            No service assigned
          </p>
          <p className="text-sm text-gray-500">
            Please contact your administrator to assign you to a service.
          </p>
          <Button variant="outline" onClick={logout} className="mt-4">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </SplitLayout>
    );
  }

  return (
    <SplitLayout
      leftTitle={
        <>
          WELCOME,
          <br />
          {user?.username?.toUpperCase() || "STAFF"}!
        </>
      }
      leftSubtitle="Let's get you queued up."
    >
      <div className="w-full flex flex-col items-center">
        {/* Header */}
        <h2 className="text-2xl text-center mb-8 font-black uppercase text-brand-green tracking-wide">
          Select the window you will be serving today.
        </h2>

        {/* Window Cards */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-green" />
          </div>
        ) : effectiveWindows.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-xl text-gray-400 font-medium">
              No windows available for your service.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {effectiveWindows.map((windowData) => (
              <StaffWindowCard
                key={windowData.id}
                windowData={windowData}
                serviceName={serviceInfo.name}
                currentUserName={currentUserName}
                claimLoading={claimLoading}
                selectedWindowId={selectedWindowId}
                isPending={claimWindowMutation.isPending}
                onSelect={handleSelectWindow}
              />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="h-10 px-6 rounded-xl border-gray-200 text-gray-600 hover:text-gray-900 shadow-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={releaseLoading}
            className="h-10 px-6 rounded-xl border-gray-200 text-gray-600 hover:text-gray-900 shadow-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {releaseLoading ? "Releasing..." : "Logout"}
          </Button>
        </div>
      </div>
    </SplitLayout>
  );
};

export default StaffOnboarding;
