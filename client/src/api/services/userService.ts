import { api } from '@/api/instance';
import type { ApiRequestConfig } from '@/types';
import type {
  ApiSuccessResponse,
  MeResponseData,
  UpdateMeResponseData,
  DashboardResponseData,
  DeleteUserResponseData,
  TestEmailResponseData,
  UpdateMeRequestBody,
  ExportMyDataResponseData,
} from '@api-types/api-contracts';

export async function getMe(
  config?: ApiRequestConfig,
): Promise<ApiSuccessResponse<MeResponseData>> {
  const response = await api.get<ApiSuccessResponse<MeResponseData>>('/private/me', config);
  return response.data;
}

export async function getDashboard(
  config?: ApiRequestConfig,
): Promise<ApiSuccessResponse<DashboardResponseData>> {
  const response = await api.get<ApiSuccessResponse<DashboardResponseData>>(
    '/private/dashboard',
    config,
  );
  return response.data;
}

/**
 * Updates the signed-in user. A new photo must be staged first with `stageFile()`; pass the
 * returned `{ stagingKey, fileName }` as `photo`.
 */
export async function updateMe(
  payload: UpdateMeRequestBody,
  config?: ApiRequestConfig,
): Promise<ApiSuccessResponse<UpdateMeResponseData>> {
  const response = await api.put<ApiSuccessResponse<UpdateMeResponseData>>(
    '/private/me',
    payload,
    config,
  );
  return response.data;
}

export async function sendTestEmail(
  config?: ApiRequestConfig,
): Promise<ApiSuccessResponse<TestEmailResponseData>> {
  const response = await api.post<ApiSuccessResponse<TestEmailResponseData>>(
    '/private/me/test-email',
    null,
    config,
  );
  return response.data;
}

/**
 * Requests the user data export and starts the download.
 *
 * The API builds the ZIP, stores it in S3 and returns a short-lived presigned URL: the file never
 * passes back through the API, whose Lambda responses are capped at 6291556 bytes. The download
 * is started with a temporary anchor; the object's Content-Disposition keeps the filename even
 * though the URL is cross-origin.
 */
export async function exportMyData(config?: ApiRequestConfig): Promise<void> {
  const response = await api.get<ApiSuccessResponse<ExportMyDataResponseData>>(
    '/private/me/export',
    config,
  );
  const { downloadUrl, filename } = response.data.data;
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  link.target = '_blank';
  link.rel = 'noopener';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function deleteAccount(
  config?: ApiRequestConfig,
): Promise<ApiSuccessResponse<DeleteUserResponseData>> {
  const response = await api.delete<ApiSuccessResponse<DeleteUserResponseData>>(
    '/private/delete',
    config,
  );
  return response.data;
}
