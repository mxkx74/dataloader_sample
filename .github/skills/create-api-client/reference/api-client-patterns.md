# API Client Patterns — Quick Reference

## パターン早見表

| パターン | fetcher | 型引数 | responseSchema |
|---------|---------|--------|----------------|
| GET 一覧（query params） | `fetcher` | 省略可 | domainSchema |
| GET 単件（path params） | `fetcher` | 省略可 | domainSchema |
| POST レスポンスなし | `fetcher` | `<void, undefined, TBody>` | 不要 |
| POST レスポンスあり | `fetcher` | 省略可 | domainSchema |
| PUT / PATCH | `fetcher` | `<void, undefined, TBody>` | 不要 |
| バイナリ（PDF/Excel） | `blobFetcher` | N/A | N/A |

---

## 要注意パターン（コード例）

### POST レスポンスなし — 型引数を必ず明示する

```typescript
import type { FixBillingFixBody } from './schema';

fix: (body: FixBillingFixBody) =>
  fetcher<void, undefined, FixBillingFixBody>(`${ENDPOINT}/fix`, {
    method: 'POST',
    requestBody: body,
  }),
```

### パスパラメータ ＋ クエリパラメータ混在 — 型を必ず分割する

```typescript
// schema.ts で定義済みの型を import する
import type {
  BillingReportDownloadPathParams,
  BillingReportDownloadQueryParams,
} from './schema';

download: (
  pathParams: BillingReportDownloadPathParams,
  queryParams: BillingReportDownloadQueryParams
) =>
  blobFetcher(`${DOWNLOAD_ENDPOINT}/${pathParams.reportCode}/download`, {
    method: 'GET',
    queryParams,
  }),
```

---

## summary / detail 集約パターン（同一 rezept/{resource} 配下）

`/rezept/{resource}/summary` と `/rezept/{resource}/detail` は **同一の `{resource}/client.ts` にまとめる**。
ENDPOINT 定数は `rezept/{resource}` までをベースとし、サブパスはメソッド内で付加する。

```typescript
// src/models/resources/benefit-amount/client.ts
import { benefitAmountDetailSchema, benefitAmountSchema } from './schema';
import type { BenefitAmountFindAllParams, BenefitAmountGetDetailParams } from './schema';

const ENDPOINT = 'http://mock-api/rezept/benefit-amounts'; // ← {resource} までがベース

export const benefitAmountApi = {
  /** 給付費一覧（サマリ）を取得する */
  findAll: (params: BenefitAmountFindAllParams) =>
    fetcher(`${ENDPOINT}/summary`, {          // ← サブパスを付加
      method: 'GET',
      queryParams: params,
      responseSchema: benefitAmountSchema,
    }),

  /** 給付費詳細を取得する */
  getDetail: (params: BenefitAmountGetDetailParams) =>
    fetcher(`${ENDPOINT}/detail`, {           // ← サブパスを付加
      method: 'GET',
      queryParams: params,
      responseSchema: benefitAmountDetailSchema,
    }),
} as const;
```
