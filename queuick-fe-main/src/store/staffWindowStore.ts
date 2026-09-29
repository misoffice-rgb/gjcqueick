import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ServiceWindow } from "@/features/services/types";
import { writeClaimedWindowIdToSession } from "@/features/staff/windowRelease";

export interface StaffServiceInfo {
  id: number;
  name: string;
  prefix: string;
}

interface StaffWindowState {
  selectedWindow: ServiceWindow | null;
  claimedWindowId: number | null;
  serviceInfo: StaffServiceInfo | null;
  setSelectedWindow: (window: ServiceWindow) => void;
  setServiceInfo: (service: StaffServiceInfo) => void;
  // Clears only the selected window (leave-window / release flow).
  // serviceInfo is kept so the onboarding page can still show windows.
  clearSelectedWindow: () => void;
  // Clears everything – use only on full logout.
  clearAll: () => void;
}

export const useStaffWindowStore = create<StaffWindowState>()(
  persist(
    (set) => ({
      selectedWindow: null,
      claimedWindowId: null,
      serviceInfo: null,
      setSelectedWindow: (window) => {
        const maybeWrapped = window as ServiceWindow & {
          window?: ServiceWindow;
        };
        const normalizedWindow = maybeWrapped.window || window;
        writeClaimedWindowIdToSession(normalizedWindow.id);
        set({
          selectedWindow: normalizedWindow,
          claimedWindowId: normalizedWindow.id,
        });
      },
      setServiceInfo: (service) =>
        set({
          serviceInfo: {
            id: service.id,
            name: service.name,
            prefix: service.prefix,
          },
        }),
      clearSelectedWindow: () => {
        writeClaimedWindowIdToSession(null);
        set({ selectedWindow: null, claimedWindowId: null });
      },
      clearAll: () => {
        writeClaimedWindowIdToSession(null);
        set({ selectedWindow: null, claimedWindowId: null, serviceInfo: null });
      },
    }),
    {
      name: "staff-window-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
