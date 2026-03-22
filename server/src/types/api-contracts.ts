export type { ApiSuccessResponse, ApiErrorResponse, ApiResponse } from './response.js';

export type {
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
} from '../routes/public/auth/index.js';

export type {
  MeResponseData,
  UpdateMeRequestBody,
  UpdateMeResponseData,
  TestEmailResponseData,
  DeleteUserResponseData,
} from '../routes/private/account.js';

export type { DashboardResponseData } from '../routes/private/dashboard.js';
