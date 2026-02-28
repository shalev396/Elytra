declare namespace Express {
  interface Response {
    success(data: unknown, statusCode?: number): void;
    error(message: string, statusCode?: number): void;
  }
}
