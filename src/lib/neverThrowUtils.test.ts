import { err, ok, ResultAsync } from 'neverthrow';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { HttpError, NetworkError } from './errors';
import { handleSerialize, handleSerializeAsync, safeAsync, safeParse } from './neverThrowUtils';

describe('safeParse', () => {
  describe('オーバーロード1: スキーマのみ指定（カリー化）', () => {
    it('成功時はOkを返す関数を生成する', () => {
      const schema = z.object({
        id: z.number(),
        name: z.string(),
      });

      const parseData = safeParse(schema);
      const result = parseData({ id: 1, name: 'Test' });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual({ id: 1, name: 'Test' });
      }
    });

    it('失敗時はErrを返す関数を生成する', () => {
      const schema = z.object({
        id: z.number(),
        name: z.string(),
      });

      const parseData = safeParse(schema);
      const result = parseData({ id: 'not-a-number', name: 123 });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(z.ZodError);
      }
    });

    it('カリー化された関数をandThenで使用できる', () => {
      const schema = z.number();
      const result = ok(42).andThen(safeParse(schema));

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe(42);
      }
    });
  });

  describe('オーバーロード2: スキーマとデータを同時に指定', () => {
    it('成功時はOkを返す', () => {
      const schema = z.object({
        id: z.number(),
        name: z.string(),
      });

      const result = safeParse(schema, { id: 1, name: 'Test' });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual({ id: 1, name: 'Test' });
      }
    });

    it('失敗時はErrを返す', () => {
      const schema = z.object({
        id: z.number(),
        name: z.string(),
      });

      const result = safeParse(schema, { id: 'not-a-number', name: 123 });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(z.ZodError);
      }
    });
  });
});

describe('safeAsync', () => {
  describe('正常系', () => {
    it('成功するPromiseをOkのResultAsyncに変換する', async () => {
      const promise = Promise.resolve(42);
      const resultAsync = safeAsync(promise);

      const result = await resultAsync;

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe(42);
      }
    });

    it('オブジェクトを返すPromiseをOkのResultAsyncに変換する', async () => {
      const data = { id: 1, name: 'Test' };
      const promise = Promise.resolve(data);
      const resultAsync = safeAsync(promise);

      const result = await resultAsync;

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(data);
      }
    });
  });

  describe('異常系', () => {
    it('失敗するPromiseをErrのResultAsyncに変換する', async () => {
      const error = new Error('Test Error');
      const promise = Promise.reject(error);
      const resultAsync = safeAsync(promise);

      const result = await resultAsync;

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBe(error);
      }
    });

    it('HttpErrorを正しくキャッチする', async () => {
      const mockResponse = new Response(null, { status: 404, statusText: 'Not Found' });
      const error = new HttpError(mockResponse, 'Not Found');
      const promise = Promise.reject(error);
      const resultAsync = safeAsync(promise);

      const result = await resultAsync;

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(HttpError);
        expect((result.error as HttpError).response.status).toBe(404);
      }
    });

    it('NetworkErrorを正しくキャッチする', async () => {
      const baseError = new Error('Connection failed');
      const error = new NetworkError(baseError);
      const promise = Promise.reject(error);
      const resultAsync = safeAsync(promise);

      const result = await resultAsync;

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(NetworkError);
      }
    });
  });
});

describe('handleSerialize', () => {
  describe('正常系 - Ok', () => {
    it('Okの結果をシリアライズ可能な形式に変換する', () => {
      const result = ok({ id: 1, name: 'Test' });
      const serialized = handleSerialize(result);

      expect(serialized).toEqual({
        ok: true,
        value: { id: 1, name: 'Test' },
      });
    });

    it('プリミティブ値のOkをシリアライズする', () => {
      const result = ok(42);
      const serialized = handleSerialize(result);

      expect(serialized).toEqual({
        ok: true,
        value: 42,
      });
    });

    it('null値のOkをシリアライズする', () => {
      const result = ok(null);
      const serialized = handleSerialize(result);

      expect(serialized).toEqual({
        ok: true,
        value: null,
      });
    });

    it('配列のOkをシリアライズする', () => {
      const result = ok([1, 2, 3]);
      const serialized = handleSerialize(result);

      expect(serialized).toEqual({
        ok: true,
        value: [1, 2, 3],
      });
    });
  });

  describe('異常系 - Err', () => {
    it('Errの結果をシリアライズ可能な形式に変換する', () => {
      const mockResponse = new Response(null, { status: 404, statusText: 'Not Found' });
      const error = new HttpError(mockResponse, 'Not Found');
      const result = err(error);
      const serialized = handleSerialize(result);

      expect(serialized.ok).toBe(false);
      if (!serialized.ok) {
        expect(serialized.error.name).toBe('HttpError');
        expect(serialized.error.message).toBe('Not Found');
        expect(serialized.error.status).toBe(404);
      }
    });

    it('NetworkErrorをシリアライズする', () => {
      const baseError = new Error('Connection failed');
      const error = new NetworkError(baseError);
      const result = err(error);
      const serialized = handleSerialize(result);

      expect(serialized.ok).toBe(false);
      if (!serialized.ok) {
        expect(serialized.error.name).toBe('NetworkError');
        expect(serialized.error.message).toBe('Connection failed');
      }
    });

    it('一般的なErrorをシリアライズする', () => {
      const error = new Error('Generic error');
      const result = err(error);
      const serialized = handleSerialize(result);

      expect(serialized.ok).toBe(false);
      if (!serialized.ok) {
        expect(serialized.error.type).toBe('UnknownError');
        expect(serialized.error.message).toBe('Generic error');
      }
    });
  });
});

describe('handleSerializeAsync', () => {
  describe('正常系 - Ok', () => {
    it('OkのPromise<Result>をシリアライズ可能な形式に変換する', async () => {
      const promise = Promise.resolve(ok({ id: 1, name: 'Test' }));
      const serialized = await handleSerializeAsync(promise);

      expect(serialized).toEqual({
        ok: true,
        value: { id: 1, name: 'Test' },
      });
    });

    it('プリミティブ値のOkをシリアライズする', async () => {
      const promise = Promise.resolve(ok(42));
      const serialized = await handleSerializeAsync(promise);

      expect(serialized).toEqual({
        ok: true,
        value: 42,
      });
    });

    it('ResultAsyncからOkをシリアライズする', async () => {
      const resultAsync = ResultAsync.fromSafePromise(Promise.resolve({ id: 1, name: 'Test' }));
      const serialized = await handleSerializeAsync(resultAsync);

      expect(serialized).toEqual({
        ok: true,
        value: { id: 1, name: 'Test' },
      });
    });
  });

  describe('異常系 - Err', () => {
    it('ErrのPromise<Result>をシリアライズ可能な形式に変換する', async () => {
      const mockResponse = new Response(null, { status: 404, statusText: 'Not Found' });
      const error = new HttpError(mockResponse, 'Not Found');
      const promise = Promise.resolve(err(error));
      const serialized = await handleSerializeAsync(promise);

      expect(serialized.ok).toBe(false);
      if (!serialized.ok) {
        expect(serialized.error.name).toBe('HttpError');
        expect(serialized.error.message).toBe('Not Found');
        expect(serialized.error.status).toBe(404);
      }
    });

    it('NetworkErrorをシリアライズする', async () => {
      const baseError = new Error('Connection failed');
      const error = new NetworkError(baseError);
      const promise = Promise.resolve(err(error));
      const serialized = await handleSerializeAsync(promise);

      expect(serialized.ok).toBe(false);
      if (!serialized.ok) {
        expect(serialized.error.name).toBe('NetworkError');
        expect(serialized.error.message).toBe('Connection failed');
      }
    });

    it('ResultAsyncからErrをシリアライズする', async () => {
      const error = new Error('Async error');
      const resultAsync = ResultAsync.fromPromise(Promise.reject(error), (e) => e as Error);
      const serialized = await handleSerializeAsync(resultAsync);

      expect(serialized.ok).toBe(false);
      if (!serialized.ok) {
        expect(serialized.error.type).toBe('UnknownError');
        expect(serialized.error.message).toBe('Async error');
      }
    });
  });

  describe('非同期処理のチェーン', () => {
    it('ResultAsyncのmapを経由してシリアライズできる', async () => {
      const resultAsync = ResultAsync.fromSafePromise(Promise.resolve(42)).map(
        (value) => value * 2
      );
      const serialized = await handleSerializeAsync(resultAsync);

      expect(serialized).toEqual({
        ok: true,
        value: 84,
      });
    });
  });
});
