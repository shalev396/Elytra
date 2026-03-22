export interface ApiSuccessResponse<T = unknown> {
  data: T;
}

export interface ApiErrorResponse {
  message: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
