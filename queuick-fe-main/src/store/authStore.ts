import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/features/user/types";
import { authApi } from "@/features/user/api";
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
      user: null,
      loading: true,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (loading) => set({ loading }),

      checkAuth: async () => {
        try {
          set({ loading: true });
          const response = await authApi.getCurrentUser();
          if (response.success) {
            set({ user: response.user, isAuthenticated: true });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error("Logout failed:", error);
        } finally {
          localStorage.removeItem("ws_access_token");
          localStorage.removeItem("auth-storage");
          localStorage.removeItem("staff-window-storage");
          useStaffWindowStore.getState().clearAll();
          set({ user: null, isAuthenticated: false });
          window.location.href = "/";
        }
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
