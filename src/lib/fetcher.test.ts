import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { server } from '@/mocks/server';

import { HttpError, JsonParseError, NetworkError } from './errors';
import { fetcher } from './fetcher';

describe('fetcher', () => {
  const testEndpoint = 'http://test-api.example.com/api/data';

  describe('正常系', () => {
    it('GETリクエストで正常にデータを取得できる', async () => {
      const mockData = { id: 1, name: 'Test' };

      server.use(
        http.get(testEndpoint, () => {
          return HttpResponse.json(mockData);
        })
      );

      const result = await fetcher(testEndpoint, { method: 'GET' });

      expect(result).toEqual(mockData);
    });

    it('クエリパラメータが正しく付与される', async () => {
      const mockData = { items: [] };

      server.use(
        http.get(testEndpoint, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('page')).toBe('1');
          expect(url.searchParams.get('limit')).toBe('10');
          return HttpResponse.json(mockData);
        })
      );

      await fetcher(testEndpoint, {
        method: 'GET',
        queryParams: { page: '1', limit: '10' },
      });
    });

    it('null と undefined のクエリパラメータは除外される', async () => {
      const mockData = { items: [] };

      server.use(
        http.get(testEndpoint, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('name')).toBe('test');
          expect(url.searchParams.get('page')).toBe('1');
          expect(url.searchParams.has('deleted')).toBe(false);
          expect(url.searchParams.has('category')).toBe(false);
          return HttpResponse.json(mockData);
        })
      );

      await fetcher(testEndpoint, {
        method: 'GET',
        queryParams: { name: 'test', page: 1, deleted: null, category: undefined },
      });
    });

    it('0, false, 空文字列のクエリパラメータは含まれる', async () => {
      const mockData = { items: [] };

      server.use(
        http.get(testEndpoint, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('count')).toBe('0');
          expect(url.searchParams.get('active')).toBe('false');
          expect(url.searchParams.get('text')).toBe('');
          return HttpResponse.json(mockData);
        })
      );

      await fetcher(testEndpoint, {
        method: 'GET',
        queryParams: { count: 0, active: false, text: '' },
      });
    });

    it('クエリパラメータがない場合もURLが正しく構築される', async () => {
      const mockData = { items: [] };

      server.use(
        http.get(testEndpoint, ({ request }) => {
          const url = new URL(request.url);
          expect(url.search).toBe('');
          return HttpResponse.json(mockData);
        })
      );

      await fetcher(testEndpoint, {
        method: 'GET',
      });
    });

    it('POSTリクエストでリクエストボディが正しく送信される', async () => {
      const requestBody = { name: 'New Item' };
      const mockResponse = { id: 1, ...requestBody };

      server.use(
        http.post(testEndpoint, async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(requestBody);
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await fetcher(testEndpoint, {
        method: 'POST',
        requestBody,
      });

      expect(result).toEqual(mockResponse);
    });

    it('レスポンススキーマでバリデーションが成功する', async () => {
      const schema = z.object({
        id: z.number(),
        name: z.string(),
      });
      const mockData = { id: 1, name: 'Test' };

      server.use(
        http.get(testEndpoint, () => {
          return HttpResponse.json(mockData);
        })
      );

      const result = await fetcher(testEndpoint, {
        method: 'GET',
        responseSchema: schema,
      });

      expect(result).toEqual(mockData);
    });

    it('空のレスポンスボディをundefinedとして処理できる', async () => {
      server.use(
        http.get(testEndpoint, () => {
          return new HttpResponse('', { status: 200 });
        })
      );

      const result = await fetcher(testEndpoint, { method: 'GET' });

      expect(result).toBeUndefined();
    });
  });

  describe('異常系 - HTTPエラー', () => {
    it('400エラーの場合HttpErrorを投げる', async () => {
      server.use(
        http.get(testEndpoint, () => {
          return HttpResponse.json({ error: 'Bad Request' }, { status: 400 });
        })
      );

      await expect(fetcher(testEndpoint, { method: 'GET' })).rejects.toThrow(HttpError);
    });

    it('404エラーの場合HttpErrorを投げる', async () => {
      server.use(
        http.get(testEndpoint, () => {
          return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
        })
      );

      await expect(fetcher(testEndpoint, { method: 'GET' })).rejects.toThrow(HttpError);
    });

    it('500エラーの場合HttpErrorを投げる', async () => {
      server.use(
        http.get(testEndpoint, () => {
          return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        })
      );

      await expect(fetcher(testEndpoint, { method: 'GET' })).rejects.toThrow(HttpError);
    });
  });

  describe('異常系 - ネットワークエラー', () => {
    it('ネットワークエラーの場合NetworkErrorを投げる', async () => {
      server.use(
        http.get(testEndpoint, () => {
          return HttpResponse.error();
        })
      );

      await expect(fetcher(testEndpoint, { method: 'GET' })).rejects.toThrow(NetworkError);
    });
  });

  describe('異常系 - JSONパースエラー', () => {
    it('不正なJSONの場合JsonParseErrorを投げる', async () => {
      server.use(
        http.get(testEndpoint, () => {
          return new HttpResponse('Not a JSON', {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        })
      );

      await expect(fetcher(testEndpoint, { method: 'GET' })).rejects.toThrow(JsonParseError);
    });
  });

  describe('異常系 - スキーマバリデーションエラー', () => {
    it('レスポンススキーマのバリデーションに失敗した場合ZodErrorを投げる', async () => {
      const schema = z.object({
        id: z.number(),
        name: z.string(),
      });
      const invalidData = { id: 'not-a-number', name: 123 };

      server.use(
        http.get(testEndpoint, () => {
          return HttpResponse.json(invalidData);
        })
      );

      await expect(
        fetcher(testEndpoint, {
          method: 'GET',
          responseSchema: schema,
        })
      ).rejects.toThrow(z.ZodError);
    });

    it('必須フィールドが欠けている場合ZodErrorを投げる', async () => {
      const schema = z.object({
        id: z.number(),
        name: z.string(),
        email: z.string(),
      });
      const incompleteData = { id: 1, name: 'Test' }; // emailが欠けている

      server.use(
        http.get(testEndpoint, () => {
          return HttpResponse.json(incompleteData);
        })
      );

      await expect(
        fetcher(testEndpoint, {
          method: 'GET',
          responseSchema: schema,
        })
      ).rejects.toThrow(z.ZodError);
    });
  });

  describe('HTTPメソッド', () => {
    it('PUTリクエストが正しく送信される', async () => {
      const requestBody = { name: 'Updated' };
      const mockResponse = { id: 1, ...requestBody };

      server.use(
        http.put(testEndpoint, async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(requestBody);
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await fetcher(testEndpoint, {
        method: 'PUT',
        requestBody,
      });

      expect(result).toEqual(mockResponse);
    });

    it('DELETEリクエストが正しく送信される', async () => {
      server.use(
        http.delete(testEndpoint, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      const result = await fetcher(testEndpoint, { method: 'DELETE' });

      expect(result).toBeUndefined();
    });

    it('PATCHリクエストが正しく送信される', async () => {
      const requestBody = { name: 'Patched' };
      const mockResponse = { id: 1, name: 'Patched' };

      server.use(
        http.patch(testEndpoint, async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(requestBody);
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await fetcher(testEndpoint, {
        method: 'PATCH',
        requestBody,
      });

      expect(result).toEqual(mockResponse);
    });
  });
});
