import { z } from "zod";
import { ResultAsync } from "neverthrow";
import { AppError, createApiError, createValidationError } from "./errors";

type FetcherOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
};

/**
 * Zod バリデーションを含む型安全な fetch ラッパー
 *
 * @param url - リクエスト先の URL
 * @param schema - レスポンスのバリデーションに使用する Zod スキーマ
 * @param options - フェッチオプション
 * @returns ResultAsync<T, AppError>
 */
export const fetcher = <T>(
  url: string,
  schema: z.ZodSchema<T>,
  options: FetcherOptions = {}
): ResultAsync<T, AppError> => {
  const { method = "GET", headers = {}, body } = options;

  const fetchPromise = fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }).then(async (response) => {
    if (!response.ok) {
      throw createApiError(
        `HTTP error: ${response.status} ${response.statusText}`,
        response.status
      );
    }
    const json: unknown = await response.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      throw createValidationError(
        `Response validation failed: ${parsed.error.message}`
      );
    }
    return parsed.data;
  });

  return ResultAsync.fromPromise(fetchPromise, (error) => {
    if (
      typeof error === "object" &&
      error !== null &&
      "type" in error &&
      (error as { type: string }).type === "API_ERROR"
    ) {
      return error as AppError;
    }
    if (
      typeof error === "object" &&
      error !== null &&
      "type" in error &&
      (error as { type: string }).type === "VALIDATION_ERROR"
    ) {
      return error as AppError;
    }
    return createApiError(
      error instanceof Error ? error.message : "Fetch failed"
    );
  });
};
