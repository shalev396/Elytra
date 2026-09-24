export interface ApiSuccessResponse<T = unknown> {
  data: T;
}

export interface ApiErrorResponse {
  message: string;
}

/** `data` of a success response that carries nothing: `{ "data": {} }`. */
export type EmptySuccessResponseData = Record<string, never>;

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
