import { create } from "zustand";
import type { WindowSelectionWindow } from "@/features/staff/api";

interface WindowSelectionState {
  windows: WindowSelectionWindow[];
  selectedWindowId: number | null;
  claimLoading: number | null;
  releaseLoading: boolean;
  socketConnected: boolean;
  socketReconnecting: boolean;
  lastSyncAt: string | null;
  error: string | null;
  setWindows: (windows: WindowSelectionWindow[]) => void;
  setSelectedWindowId: (windowId: number | null) => void;
  setClaimLoading: (windowId: number | null) => void;
  setReleaseLoading: (isLoading: boolean) => void;
  setSocketState: (connected: boolean, reconnecting: boolean) => void;
  setError: (error: string | null) => void;
  resetSelectionState: () => void;
}

export const useWindowSelectionStore = create<WindowSelectionState>()(
  (set) => ({
    windows: [],
    selectedWindowId: null,
    claimLoading: null,
    releaseLoading: false,
    socketConnected: false,
    socketReconnecting: false,
    lastSyncAt: null,
    error: null,
    setWindows: (windows) =>
      set({
        windows,
        lastSyncAt: new Date().toISOString(),
        error: null,
      }),
    setSelectedWindowId: (selectedWindowId) => set({ selectedWindowId }),
    setClaimLoading: (claimLoading) => set({ claimLoading }),
    setReleaseLoading: (releaseLoading) => set({ releaseLoading }),
    setSocketState: (socketConnected, socketReconnecting) =>
      set({ socketConnected, socketReconnecting }),
    setError: (error) => set({ error }),
    resetSelectionState: () =>
      set({
        windows: [],
        selectedWindowId: null,
        claimLoading: null,
        releaseLoading: false,
        socketConnected: false,
        socketReconnecting: false,
        lastSyncAt: null,
        error: null,
      }),
  }),
);
