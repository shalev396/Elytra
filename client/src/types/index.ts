import type { LoginResponseData } from '@api-types/api-contracts';

export type User = LoginResponseData['user'];

export interface ApiRequestConfig {
  suppressErrorToast?: boolean;
}
