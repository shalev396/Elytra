import { api } from '@/api/instance';
import type { ApiRequestConfig } from '@/types';
import type {
  ApiSuccessResponse,
  MeResponseData,
  DashboardResponseData,
  DeleteUserResponseData,
} from '@api-types/api-contracts';

export async function getMe(
  config?: ApiRequestConfig,
): Promise<ApiSuccessResponse<MeResponseData>> {
  const response = await api.get<ApiSuccessResponse<MeResponseData>>('/user/me', config);
  return response.data;
}

export async function getDashboard(
  config?: ApiRequestConfig,
): Promise<ApiSuccessResponse<DashboardResponseData>> {
  const response = await api.get<ApiSuccessResponse<DashboardResponseData>>(
    '/user/dashboard',
    config,
  );
  return response.data;
}

export async function deleteAccount(
  config?: ApiRequestConfig,
): Promise<ApiSuccessResponse<DeleteUserResponseData>> {
  const response = await api.delete<ApiSuccessResponse<DeleteUserResponseData>>(
    '/user/delete',
    config,
  );
  return response.data;
}
