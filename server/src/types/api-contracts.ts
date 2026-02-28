export type { ApiSuccessResponse, ApiErrorResponse, ApiResponse } from './response.js';

export type {
  SignupRequestBody,
  SignupResponseData,
  ConfirmSignupRequestBody,
  LoginRequestBody,
  LoginResponseData,
  ForgotPasswordRequestBody,
  ResetPasswordRequestBody,
  RefreshTokenRequestBody,
  RefreshTokenResponseData,
} from '../routes/auth/index.js';

export type { MeResponseData, DeleteUserResponseData } from '../routes/user/account.js';

export type { DashboardResponseData } from '../routes/user/dashboard.js';
