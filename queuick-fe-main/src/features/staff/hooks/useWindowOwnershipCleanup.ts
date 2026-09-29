import { useCallback, useEffect, useRef } from "react";
import { staffApi } from "@/features/staff/api";
import {
  readClaimedWindowIdFromSession,
  sendReleaseBeacon,
  sendReleaseKeepalive,
  writeClaimedWindowIdToSession,
} from "@/features/staff/windowRelease";
import { useStaffWindowStore } from "@/store/staffWindowStore";
import { useWindowSelectionStore } from "@/store/windowSelectionStore";

interface ExplicitReleaseResult {
  released: boolean;
  skipped: boolean;
  error?: unknown;
}

export const useWindowOwnershipCleanup = () => {
  const claimedWindowId = useStaffWindowStore((state) => state.claimedWindowId);
  const clearSelectedWindow = useStaffWindowStore(
    (state) => state.clearSelectedWindow,
  );

  const setSelectedWindowId = useWindowSelectionStore(
    (state) => state.setSelectedWindowId,
  );
  const setReleaseLoading = useWindowSelectionStore(
    (state) => state.setReleaseLoading,
  );
  const setWindowSelectionError = useWindowSelectionStore(
    (state) => state.setError,
  );

  const latestWindowIdRef = useRef<number | null>(claimedWindowId ?? null);
  const releasedRef = useRef(false);
  const explicitReleaseInFlightRef = useRef(false);
  const unloadStartedRef = useRef(false);

  useEffect(() => {
    const fromSession = readClaimedWindowIdFromSession();
    const effectiveId = claimedWindowId ?? fromSession;
    latestWindowIdRef.current = effectiveId;

    if (effectiveId) {
      releasedRef.current = false;
      writeClaimedWindowIdToSession(effectiveId);
      return;
    }

    writeClaimedWindowIdToSession(null);
  }, [claimedWindowId]);

  const clearLocalWindowOwnership = useCallback(() => {
    clearSelectedWindow();
    setSelectedWindowId(null);
    setWindowSelectionError(null);
    writeClaimedWindowIdToSession(null);
  }, [clearSelectedWindow, setSelectedWindowId, setWindowSelectionError]);

  const releaseWindowExplicit =
    useCallback(async (): Promise<ExplicitReleaseResult> => {
      const windowId =
        latestWindowIdRef.current ?? readClaimedWindowIdFromSession();

      if (!windowId) {
        return { released: false, skipped: true };
      }

      if (releasedRef.current || explicitReleaseInFlightRef.current) {
        return { released: true, skipped: false };
      }

      explicitReleaseInFlightRef.current = true;
      setReleaseLoading(true);

      try {
        await staffApi.releaseWindow({ window_id: windowId });
        releasedRef.current = true;
        latestWindowIdRef.current = null;
        clearLocalWindowOwnership();
        return { released: true, skipped: false };
      } catch (error) {
        return { released: false, skipped: false, error };
      } finally {
        explicitReleaseInFlightRef.current = false;
        setReleaseLoading(false);
      }
    }, [clearLocalWindowOwnership, setReleaseLoading]);

  const releaseWindowOnUnload = useCallback(() => {
    if (unloadStartedRef.current) {
      return;
    }

    unloadStartedRef.current = true;

    const windowId =
      latestWindowIdRef.current ?? readClaimedWindowIdFromSession();

    if (!windowId) {
      return;
    }

    if (releasedRef.current) {
      return;
    }

    const beaconQueued = sendReleaseBeacon(windowId);
    const keepaliveQueued = sendReleaseKeepalive(windowId);

    if (beaconQueued || keepaliveQueued) {
      releasedRef.current = true;
      latestWindowIdRef.current = null;
      writeClaimedWindowIdToSession(null);
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      releaseWindowOnUnload();
    };

    const handlePageHide = () => {
      releaseWindowOnUnload();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [releaseWindowOnUnload]);

  return {
    releaseWindowExplicit,
  };
};
