import { type AuthResponse, type LoginCredentials } from "./types";

// Grab your Supabase URL and Anon Public Key directly from your environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Talk directly to Supabase's native GoTrue Auth REST endpoint manually
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        email: credentials.username, // Supabase expects an email/identifier parameter
        password: credentials.password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || data.message || "Login failed");
    }

    // Format the response payload to perfectly match your application architecture
    return {
      success: true,
      access: data.access_token || "",
      message: "Login successful!",
      user: data.user,
      service: null
    };
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem("ws_access_token");
    return Promise.resolve();
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const token = localStorage.getItem("ws_access_token");
    if (!token) throw new Error("No session found");

    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "GET",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${token}`
      }
    });

    const user = await response.json();
    if (!response.ok) throw new Error("Failed to fetch user");

    return {
      success: true,
      access: token,
      message: "User fetched",
      user: user
    };
  },

  refreshToken: async (): Promise<void> => {
    return Promise.resolve();
  },

  changePassword: async (data: any): Promise<any> => {
    const token = localStorage.getItem("ws_access_token");
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ password: data.new_password || data.password })
    });
    return response.json();
  },
};
