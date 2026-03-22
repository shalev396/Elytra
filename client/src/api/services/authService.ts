import { api } from '@/api/instance';
import type { ApiRequestConfig } from '@/types';
import type {
  ApiSuccessResponse,
  SignupRequestBody,
  SignupResponseData,
  ConfirmSignupRequestBody,
  ResendConfirmationRequestBody,
  LoginRequestBody,
  LoginResponseData,
  ForgotPasswordRequestBody,
  ResetPasswordRequestBody,
  RefreshTokenRequestBody,
  RefreshTokenResponseData,
} from '@api-types/api-contracts';

export async function signup(
  body: SignupRequestBody,
  config?: ApiRequestConfig,
): Promise<ApiSuccessResponse<SignupResponseData>> {
  const response = await api.post<ApiSuccessResponse<SignupResponseData>>(
    '/public/auth/signup',
    body,
    config,
  );
  return response.data;
}

export async function confirmSignup(
  body: ConfirmSignupRequestBody,
  config?: ApiRequestConfig,
): Promise<ApiSuccessResponse<Record<string, never>>> {
  const response = await api.post<ApiSuccessResponse<Record<string, never>>>(
    '/public/auth/confirm',
    body,
    config,
  );
  return response.data;
}

export async function resendConfirmationCode(
  body: ResendConfirmationRequestBody,
  config?: ApiRequestConfig,
): Promise<ApiSuccessResponse<Record<string, never>>> {
  const response = await api.post<ApiSuccessResponse<Record<string, never>>>(
    '/public/auth/resend-confirmation',
    body,
    config,
  );
  return response.data;
}

export async function login(
  body: LoginRequestBody,
  config?: ApiRequestConfig,
): Promise<ApiSuccessResponse<LoginResponseData>> {
  const response = await api.post<ApiSuccessResponse<LoginResponseData>>(
    '/public/auth/login',
    body,
    config,
  );
  return response.data;
}

export async function forgotPassword(
  body: ForgotPasswordRequestBody,
  config?: ApiRequestConfig,
): Promise<ApiSuccessResponse<Record<string, never>>> {
  const response = await api.post<ApiSuccessResponse<Record<string, never>>>(
    '/public/auth/forgot-password',
    body,
    config,
  );
  return response.data;
}

export async function resetPassword(
  body: ResetPasswordRequestBody,
  config?: ApiRequestConfig,
): Promise<ApiSuccessResponse<Record<string, never>>> {
  const response = await api.post<ApiSuccessResponse<Record<string, never>>>(
    '/public/auth/reset-password',
    body,
    config,
  );
  return response.data;
}

export async function refreshToken(
  body: RefreshTokenRequestBody,
  config?: ApiRequestConfig,
): Promise<ApiSuccessResponse<RefreshTokenResponseData>> {
  const response = await api.post<ApiSuccessResponse<RefreshTokenResponseData>>(
    '/public/auth/refresh',
    body,
    config,
  );
  return response.data;
}
