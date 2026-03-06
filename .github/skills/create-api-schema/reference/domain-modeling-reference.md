# Domain Modeling Reference (API Schema)

## Naming Convention
- **配置**: `src/models/resources/{resource}/schema.ts`（例: `src/models/resources/benefit-amount/schema.ts`）
- **スキーマ名**: `{entityName}Schema`（例: `benefitAmountSchema`）
- **推論型名**: `{EntityName}`（例: `BenefitAmount`）
- **ブランド名**: `{entityName}Id` / `{entityName}Code`（識別子の種類に応じて使い分ける）

## Common Validation Patterns
- email: z.string().email()
- url: z.string().url()
- createdAt/updatedAt: z.string().datetime()

## Shared Identifier Codes (`src/models/shared-schema/`)

フィールド名が `id` / `code`（PascalCase含む）で終わる文字列識別子は、機能固有であっても `src/models/shared-schema/` に集約する。

```typescript
// ✅ 正しい定義パターン
export const facilityCodeSchema = z.string().max(19).regex(/^[0-9]{1,19}$/).brand('facilityCode');
export type FacilityCode = z.infer<typeof facilityCodeSchema>;
```

- **命名**: スキーマ `{entityName}CodeSchema` / `{entityName}IdSchema`、型 `{EntityName}Code` / `{EntityName}Id`
- **呼び出し元**: Container Props・Server Actions 引数は Branded Type で受け取る。Action 内部での `.parse()` は禁止。

```typescript
// ✅ 正しい：引数で型制限
export const fixBillingAction = async (billingIn: string, facilityCode: FacilityCode) => { ... };

// ❌ 禁止：Action 内部で parse
export const fixBillingAction = async (billingIn: string, facilityCode: string) => {
  const parsed = facilityCodeSchema.parse(facilityCode); // ← 禁止
};
```

## Export Strategy（公開範囲の例）

### ✅ 正しい：main schemaと推論型のみexport
```typescript
import type { paths } from '@litalico-engineering/thaleia-core-api-types';
import { z } from 'zod';

// 1. paths型を定義（Internal契約、exportしない）
type InvoiceSummaryResponse =
  paths['/rezept/invoice-summary']['get']['responses']['200']['content']['application/json'];

// 2. main schema定義（satisfiesでpaths型とのマッピングを検証）
export const invoiceSummarySchema = z.object({
  summaries: z.array(
    z.object({
      submissionTargetName: z.string().min(1),
      totalAmount: z.number().int().nonnegative(),
    })
  ),
}) satisfies z.ZodType<InvoiceSummaryResponse>;

// 3. 推論型をexport（schemaとの同期を型レベルで保証）
export type InvoiceSummary = z.infer<typeof invoiceSummarySchema>;

// 使用側：派生型は参照で取得（明示的型定義不要）
const item: InvoiceSummary['summaries'][number] = { /* ... */ };

// 4. request type exports（ファイル末尾に配置）
export type InvoiceSummaryFindAllParams =
  paths['/rezept/invoice-summary']['get']['parameters']['query'];
```

### オプション：複数出現する型のためのsub-schema分離
複数の場所で同じ値になるフィールドは、readability と保守性のため const で分離できます。

```typescript
const statusSchema = z.union([
  z.literal('draft'),
  z.literal('published'),
  z.literal('archived'),
]);

export const documentSchema = z.object({
  status: statusSchema,
  childDocuments: z.array(
    z.object({
      status: statusSchema,  // 同じschemaを再利用
    })
  ),
}) satisfies z.ZodType<DocumentResponse>;

export type Document = z.infer<typeof documentSchema>;
```

## Sub-Schema分離の判断基準

### ✅ 分離すべきケース（const で定義）
- **2回以上使用される場合**
  - 例：同じ enum/union が複数フィールドで使われる
  - 例：ネストした配列内と親レベルで同じ型を使う

```typescript
// ✅ 正しい：statusSchemaは children内でも使われる
const statusSchema = z.union([z.literal('draft'), z.literal('published')]);

export const schema = z.object({
  status: statusSchema,        // 1回目
  children: z.array(
    z.object({
      status: statusSchema,    // 2回目 → 分離が正解
    })
  ),
});
```

### ❌ 分離してはいけないケース（インライン化）
- **1回しか使用されないオブジェクト構造**
  - 単純なフィールド：z.string().datetime() などはもちろんインライン
  - 複雑なオブジェクトでも1回だけなら必ずインライン
```typescript
// ❌ 間違い：summarySchemaは1回しか使わないのに分離している
const summarySchema = z.object({
  name: z.string(),
  count: z.number(),
  // ... 10個のフィールド
});

export const schema = z.object({
  summaries: z.array(summarySchema),  // ← ここでしか使わない
});

// ✅ 正しい：たとえ複雑でも1回だけならインライン化
export const schema = z.object({
  summaries: z.array(
    z.object({
      name: z.string(),
      count: z.number(),
      // ... 10個のフィールド
    })
  ),
});
```