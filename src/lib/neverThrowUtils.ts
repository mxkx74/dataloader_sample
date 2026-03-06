import type { Errors, SerializedError } from './errors';
import type { Result } from 'neverthrow';
import type { z } from 'zod';

import { err, ok, ResultAsync } from 'neverthrow';

import { serializeError } from './errors';

/**
 * @param schema - 検証に使用するZodスキーマ
 * @returns (data: unknown) => Result<T, ZodError>
 * @example
 * // 配列の各要素を検証する場合
 * const results = ok(1).andThen(safeParse(userSchema)));
 */
export function safeParse<T>(schema: z.ZodSchema<T>): (data: unknown) => Result<T, z.ZodError>;

/**
 * @param schema - 検証に使用するZodスキーマ
 * @param data - 検証対象のデータ
 * @returns 成功時はOk<T>、失敗時はErr<ZodError>
 * @example
 * const result = safeParse(userSchema, data);
 */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): Result<T, z.ZodError>;

/**
 * overloadの実装
 */
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data?: unknown
): Result<T, z.ZodError> | ((data: unknown) => Result<T, z.ZodError>) {
  const parse = (d: unknown) => {
    const result = schema.safeParse(d);
    return result.success ? ok(result.data) : err(result.error);
  };

  return arguments.length === 2 ? parse(data) : parse;
}

/**
 * @description Promiseをresult型に変換するutility。neverthrowのResultAsyncを返します。
 * @param promise 例外を投げる可能性のあるPromise
 * @returns ResultAsync<T, FetchErrors>
 */
export const safeAsync = <T>(promise: Promise<T>) => {
  return ResultAsync.fromPromise(promise, (error) => error as Errors);
};

export type SerializeResult<T, E> = { ok: true; value: T } | { ok: false; error: E };

/**
 * @description neverthrowのResultをシリアライズ可能な形に変換するutility
 * @param result
 * @returns SerializeResult<T>
 */
export const handleSerialize = <T>(
  result: Result<T, Errors>
): SerializeResult<T, SerializedError> => {
  return result.match(
    (value) => ({ ok: true as const, value }),
    (error) => {
      return { ok: false as const, error: serializeError(error) };
    }
  );
};

/**
 * @description neverthrowのResultAsyncをシリアライズ可能な形に変換するutility
 * @param resultAsync
 * @returns Promise<SerializeResult<T>>
 */
export const handleSerializeAsync = async <T, E extends Errors>(
  promise: PromiseLike<Result<T, E>>
): Promise<SerializeResult<T, SerializedError>> => {
  const result = await promise;

  return result.match(
    (value) => ({ ok: true as const, value }),
    (error) => {
      return { ok: false as const, error: serializeError(error) };
    }
  );
};
