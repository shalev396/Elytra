export type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
  EmptySuccessResponseData,
} from './response.js';

export type {
  SignupRequestBody,
  SignupResponseData,
  ConfirmSignupRequestBody,
  ConfirmSignupResponseData,
  ResendConfirmationRequestBody,
  ResendConfirmationResponseData,
  LoginRequestBody,
  LoginUserPayload,
  LoginResponseData,
  ForgotPasswordRequestBody,
  ForgotPasswordResponseData,
  ResetPasswordRequestBody,
  ResetPasswordResponseData,
  RefreshTokenRequestBody,
  RefreshTokenResponseData,
} from '../routes/public/auth/index.js';

export type {
  MeResponseData,
  StagedFileReference,
  UpdateMeRequestBody,
  UpdateMeResponseData,
  TestEmailResponseData,
  ExportMyDataResponseData,
  DeleteUserResponseData,
} from '../routes/private/account.js';

export type {
  UploadPurpose,
  PresignUploadRequestBody,
  PresignUploadResponseData,
} from '../routes/private/uploads.js';

export type { DashboardResponseData } from '../routes/private/dashboard.js';

export type {
  SyncDbRequestBody,
  SyncDbResponseData,
  ResetDatabaseRequestBody,
  ResetDatabaseResponseData,
} from '../routes/dev/index.js';
