import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { toast } from 'sonner';
import { store } from '@/store';
import { selectIdToken, selectRefreshToken, updateTokens, logout } from '@/store/userSlice';
import type { ApiRequestConfig } from '@/types';
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  RefreshTokenResponseData,
} from '@api-types/api-contracts';

declare module 'axios' {
  export interface AxiosRequestConfig {
    suppressErrorToast?: boolean;
    _retry?: boolean;
  }
}

const baseURL =
  typeof window !== 'undefined' && window.location.hostname.includes('localhost')
    ? 'http://localhost:3000/api'
    : `${typeof window !== 'undefined' ? window.location.origin : ''}/api`;

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => {
    cb(token);
  });
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const idToken = selectIdToken();
    if (idToken) {
      config.headers.Authorization = `Bearer ${idToken}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const originalRequest = axiosError.config;

    // Auto-refresh on 401 (skip auth endpoints and already-retried requests)
    if (
      axiosError.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.startsWith('/auth/')
    ) {
      originalRequest._retry = true;
      const currentRefreshToken = selectRefreshToken();

      if (!currentRefreshToken) {
        store.dispatch(logout());
        return Promise.reject(new Error('No refresh token available'));
      }

      if (isRefreshing) {
        return new Promise<unknown>((resolve) => {
          addRefreshSubscriber((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const response = await axios.post<ApiSuccessResponse<RefreshTokenResponseData>>(
          `${baseURL}/auth/refresh`,
          { refreshToken: currentRefreshToken },
        );

        const { idToken } = response.data.data;

        store.dispatch(updateTokens({ idToken }));
        onTokenRefreshed(idToken);

        originalRequest.headers.Authorization = `Bearer ${idToken}`;
        return await axiosInstance(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        throw refreshError instanceof Error ? refreshError : new Error('Token refresh failed');
      } finally {
        isRefreshing = false;
      }
    }

    if (!originalRequest?.suppressErrorToast) {
      const message = axiosError.response?.data.message ?? 'An unexpected error occurred';
      toast.error(message);
    }

    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  },
);

export default axiosInstance;

export const api = {
  get: <T = unknown>(url: string, config?: ApiRequestConfig) => axiosInstance.get<T>(url, config),
  post: <T = unknown>(url: string, data?: unknown, config?: ApiRequestConfig) =>
    axiosInstance.post<T>(url, data, config),
  put: <T = unknown>(url: string, data?: unknown, config?: ApiRequestConfig) =>
    axiosInstance.put<T>(url, data, config),
  patch: <T = unknown>(url: string, data?: unknown, config?: ApiRequestConfig) =>
    axiosInstance.patch<T>(url, data, config),
  delete: <T = unknown>(url: string, config?: ApiRequestConfig) =>
    axiosInstance.delete<T>(url, config),
};
