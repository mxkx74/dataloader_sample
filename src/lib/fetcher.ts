import type { z } from 'zod';

import { buildQueryString } from './buildQueryString';
import { HttpError, JsonParseError, NetworkError } from './errors';

/**
 * オプション型
 */
type Options<TQuery, TBody, TReturn> = {
  queryParams?: TQuery;
  requestBody?: TBody;
  responseSchema?: z.ZodSchema<TReturn>;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  next?: { revalidate?: number; tags?: string[] };
} & Omit<RequestInit, 'body' | 'method'>;

/**
 * 成功すればデータを返し、失敗すれば例外を投げます
 */
export const fetcher = async <TReturn, TQuery = undefined, TBody = undefined>(
  endPoint: string,
  options: Options<TQuery, TBody, TReturn>
): Promise<TReturn> => {
  const { queryParams, requestBody, responseSchema, headers, ...rest } = options;
  const queryString = buildQueryString(queryParams);
  const url = `${endPoint}${queryString ? `?${queryString}` : ''}`;
  const hasBody = requestBody !== undefined;

  // 設定構築
  const config = {
    ...rest,
    ...(hasBody && { body: JSON.stringify(requestBody) }),
    headers: {
      Accept: 'application/json',
      ...(hasBody && { 'Content-Type': 'application/json' }),
      ...headers,
    },
  } satisfies RequestInit;

  // API呼び出し
  const response = await fetch(url, config).catch((error: unknown) => {
    throw new NetworkError(error);
  });

  // ステータスコードチェック（HTTPエラーを最優先）
  if (!response.ok) {
    throw new HttpError(response);
  }

  // 本文取得（空ボディ/非JSONを安全に扱うため text 経由）
  const text = await response.text().catch((error: unknown) => {
    // サーバー側のレスポンスのバグなのでnetworkエラーとして扱う
    throw new NetworkError(error);
  });

  // JSONパース（空ボディ/空白のみは undefined 扱い）
  const json = (() => {
    try {
      return (text.trim() === '' ? undefined : JSON.parse(text)) as TReturn;
    } catch {
      throw new JsonParseError(response);
    }
  })();

  // スキーマ未指定ならそのまま返す
  if (!responseSchema) {
    return json;
  }

  // スキーマ検証
  const result = responseSchema.safeParse(json);
  if (!result.success) {
    throw result.error;
  }

  return result.data;
};
