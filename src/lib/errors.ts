/**
 * アプリケーション全体で使用するエラー型の定義
 */

/** API 通信エラー */
export type ApiError = {
  type: "API_ERROR";
  message: string;
  status?: number;
};

/** バリデーションエラー */
export type ValidationError = {
  type: "VALIDATION_ERROR";
  message: string;
};

/** 予期しないエラー */
export type UnexpectedError = {
  type: "UNEXPECTED_ERROR";
  message: string;
  cause?: unknown;
};

/** アプリケーション共通エラー型 */
export type AppError = ApiError | ValidationError | UnexpectedError;

export const createApiError = (message: string, status?: number): ApiError => ({
  type: "API_ERROR",
  message,
  status,
});

export const createValidationError = (message: string): ValidationError => ({
  type: "VALIDATION_ERROR",
  message,
});

export const createUnexpectedError = (message: string, cause?: unknown): UnexpectedError => ({
  type: "UNEXPECTED_ERROR",
  message,
  cause,
});
