import api from "@/api/client";
import { type AuthResponse, type LoginCredentials } from "./types";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("auth/login/", credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post("auth/logout/", {});
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await api.get<AuthResponse>("auth/me/");
    return response.data;
  },

  refreshToken: async (): Promise<void> => {
    await api.post("auth/refresh/");
  },

  changePassword: async (data: any): Promise<any> => {
    const response = await api.post("auth/change-password/", data);
    return response.data;
  },
};
