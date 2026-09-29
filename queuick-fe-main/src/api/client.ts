import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/";

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
interface QueueItem {
  resolve: (value?: unknown) => void;
  reject: (error: any) => void;
}

let isRefreshing = false;
let failedQueue: Array<QueueItem> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (
      originalRequest.url === "auth/refresh/" ||
      originalRequest.url?.endsWith("auth/refresh/") ||
      originalRequest.url === "auth/login/" ||
      originalRequest.url?.endsWith("auth/login/") ||
      originalRequest._retry
    ) {
      console.log(
        "Refresh token failed, retry loop detected, or login failed - rejecting",
      );
      return Promise.reject(error);
    }

    if (isRefreshing) {
      try {
        await new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        return api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      console.log("Attempting to refresh token...");
      await api.post("/auth/refresh/");
      console.log("Token refreshed successfully");

      isRefreshing = false;
      processQueue(null);

      return api(originalRequest);
    } catch (refreshError) {
      console.log("Token refresh failed");

      isRefreshing = false;
      processQueue(refreshError);

      return Promise.reject(refreshError);
    }
  },
);

export default api;
