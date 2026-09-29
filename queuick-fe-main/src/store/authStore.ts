import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/features/user/types";
import { useStaffWindowStore } from "./staffWindowStore";

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // ✅ Force the state to always be logged in as an admin for your live demo
      user: {
        id: 1,
        username: "admin",
        is_superuser: true,
        role: "admin"
      } as any,
      loading: false,
      isAuthenticated: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (loading) => set({ loading }),

      // ✅ Disable the online validation check so refreshing doesn't kick you out
      checkAuth: async () => {
        set({ 
          loading: false, 
          isAuthenticated: true, 
          user: {
            id: 1,
            username: "admin",
            is_superuser: true,
            role: "admin"
          } as any 
        });
        return Promise.resolve();
      },

      logout: async () => {
        localStorage.removeItem("ws_access_token");
        localStorage.removeItem("auth-storage");
        localStorage.removeItem("staff-window-storage");
        useStaffWindowStore.getState().clearAll();
        set({ user: null, isAuthenticated: false });
        window.location.href = "/";
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
