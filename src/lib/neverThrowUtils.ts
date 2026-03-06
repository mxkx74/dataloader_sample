import { err, ok, Result, ResultAsync } from "neverthrow";
import { AppError, createUnexpectedError } from "./errors";

/**
 * Promise を ResultAsync に変換するユーティリティ
 * 例外が発生した場合は UnexpectedError に変換する
 */
export const safeAsync = <T>(promise: Promise<T>): ResultAsync<T, AppError> => {
  return ResultAsync.fromPromise(promise, (error) =>
    createUnexpectedError(
      error instanceof Error ? error.message : "Unknown error",
      error
    )
  );
};

/**
 * 同期関数を Result に変換するユーティリティ
 * 例外が発生した場合は UnexpectedError に変換する
 */
export const safeSync = <T>(fn: () => T): Result<T, AppError> => {
  try {
    return ok(fn());
  } catch (error) {
    return err(
      createUnexpectedError(
        error instanceof Error ? error.message : "Unknown error",
        error
      )
    );
  }
};
