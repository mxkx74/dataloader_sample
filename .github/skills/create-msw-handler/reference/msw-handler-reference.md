# MSW Handler Implementation Reference

## 1. Naming Convention
ハンドラー名はAPIメソッド名に対応させる。
- **GET（一覧）**: `findAll[Resource]Handler`（例: `findAllSubsidyCityHandler`）
- **GET（単件）**: `findByCode[Resource]Handler`（例: `findByCodeSubsidyCityHandler`）
- **GET（集計/詳細）**: `get[Resource][Noun]Handler`（例: `getBenefitAmountSummaryHandler`, `getBillingReportProgressHandler`）
- **GET（バイナリ）**: `download[Resource]Handler`（例: `downloadBillingReportHandler`）
- **POST/PATCH/PUT/DELETE**: `[action][Resource]Handler`（例: `calculateTotalAmountHandler`, `updateSubsidyCityHandler`）
- **Mock Data**: `mock[Resource]`

## 2. Directory Structure
`src/models/resources/{resource}/mock.ts`

※ `{resource}` は kebab-case のリソース名（例: `src/models/resources/benefit-amount/mock.ts`）。  
作成後、`src/mocks/handlers.ts` にハンドラーを追加登録すること。

## 3. Standard Template
```typescript
import { http, HttpResponse } from 'msw';
import type { paths } from '@litalico-engineering/thaleia-core-api-types';
import type { AllStatusCodes } from '@/types/mock';

type ResponseType = paths['[path]']['get']['responses']['200']['content']['application/json'];

/**
 * [機能説明]
 * @param status - 応答ステータスコード（デフォルト200）
 */
export const get[Name]Handler = (status: AllStatusCodes = 200) => {
  return http.get('*/rezept/[path]', () => {
    // 成功・失敗をstatus引数で制御
    return HttpResponse.json(mock[Name], { status });
  });
};

export const mock[Name] = [
  {
    // フィールド名に即したリアリスティックなデータ
  }
] as unknown as ResponseType;
```