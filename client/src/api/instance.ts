import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { store } from "@/store";
import { showGlobalLoading, hideGlobalLoading } from "@/store/uiSlice";
import { selectAccessToken } from "@/store/userSlice";
import type { ApiRequestConfig } from "@/types";

// Extend AxiosRequestConfig to include our custom config
declare module "axios" {
  export interface AxiosRequestConfig {
    showGlobalLoader?: boolean;
  }
}

// Create axios instance with base configuration (URL-based, no env)
const baseURL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : `${typeof window !== "undefined" ? window.location.origin : ""}/api`;

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Track requests that have shown the global loader
const requestsWithLoader = new Set<string>();

// Request interceptor - add auth token and handle global loading
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add Authorization header if access token exists
    const accessToken = selectAccessToken();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Show global loading if requested
    if (config.showGlobalLoader) {
      const requestId = `${config.method}-${config.url}`;
      requestsWithLoader.add(requestId);
      store.dispatch(showGlobalLoading());
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - hide global loading on completion
axiosInstance.interceptors.response.use(
  (response) => {
    // Hide global loading if it was shown for this request
    const requestId = `${response.config.method}-${response.config.url}`;
    if (requestsWithLoader.has(requestId)) {
      requestsWithLoader.delete(requestId);
      if (requestsWithLoader.size === 0) {
        store.dispatch(hideGlobalLoading());
      }
    }

    return response;
  },
  (error) => {
    // Hide global loading on error as well
    if (error.config) {
      const requestId = `${error.config.method}-${error.config.url}`;
      if (requestsWithLoader.has(requestId)) {
        requestsWithLoader.delete(requestId);
        if (requestsWithLoader.size === 0) {
          store.dispatch(hideGlobalLoading());
        }
      }
    }

    return Promise.reject(error);
  }
);

// Export the configured instance
export default axiosInstance;

// Convenience exports for common HTTP methods with typed config
export const api = {
  get: <T = unknown>(url: string, config?: ApiRequestConfig) =>
    axiosInstance.get<T>(url, config),
  post: <T = unknown>(url: string, data?: unknown, config?: ApiRequestConfig) =>
    axiosInstance.post<T>(url, data, config),
  put: <T = unknown>(url: string, data?: unknown, config?: ApiRequestConfig) =>
    axiosInstance.put<T>(url, data, config),
  patch: <T = unknown>(
    url: string,
    data?: unknown,
    config?: ApiRequestConfig
  ) => axiosInstance.patch<T>(url, data, config),
  delete: <T = unknown>(url: string, config?: ApiRequestConfig) =>
    axiosInstance.delete<T>(url, config),
};
