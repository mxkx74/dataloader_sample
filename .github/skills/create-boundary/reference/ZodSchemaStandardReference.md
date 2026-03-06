# Zod & OpenAPI Schema Standard (SOP)

このドキュメントは、境界層における Zod スキーマ定義の標準構文を定義します。

## 🛡 1. OpenAPI 型との同期 (Source of Truth)
OpenAPIの定義型を `satisfies` で拘束することで、API更新時の検知を確実にする。

- **Query/Path Params**: `paths['path']['method']['parameters']['query' | 'path']`
- **Request Body**: `paths['path']['method']['requestBody']['content']['application/json']`
- **Response**: `paths['path']['method']['responses']['200']['content']['application/json']`

### 1.0.1 Raw Params の管理場所
`satisfies` に使う raw params 型は **`src/models/resources/{resource}/schema.ts` の末尾に `// request type exports` コメントとともに定義** し、`boundary.ts` は `@/models/resources/` からインポートして利用する。`boundary.ts` 内で `paths[...]` を直接参照・エクスポートすることは禁止。

- `schema.ts` 末尾での export 例: `export type SubsidyCityGetParams = paths['/rezept/subsidy-cities']['get']['parameters']['query'];`
- `boundary.ts` 側: `import type { SubsidyCityGetParams } from '@/models/resources/subsidy-city/schema';`
- 目的: APIの型定義を `models/resources/` 層に集約し、OpenAPI変更の影響範囲を一箇所に押える。

## 🧩 1.1 Input フラット化の原則
Input は常にフラット化し、呼び出し側が `path` / `query` / `body` を意識しなくて済む設計にする。

- **禁止**: `requestBody` / `pathParams` / `queryParams` などの入れ子構造
	- 例: `requestBody: { ... }` はNG。入力スキーマのトップレベルに直接展開する。

## 🧩 2. スキーマ合成の作法
- **統合 (Merge)**: `BaseSchema.merge(ExtensionSchema)`
- **拡張 (Extend)**: `BaseSchema.extend({ field: z.string() })`
- **抽出 (Pick/Omit)**: `BaseSchema.pick({ id: true })`
- **交差型 (Input Port用)**: 複数APIを統合するInputは `z.object({ ... }) satisfies z.ZodType<A & B>` の形式をとる。

## ⚠️ 構文上の注意
- **satisfies の位置**: 常に `z.object({ ... })` の直後に記述せよ。
- **型推論**: `z.infer<typeof schema>` を使い、手動での型定義（interface等）は禁止する。

## 📝 Code Example (コード例)

### A. 単一APIのパラメータをフラット化してPortを定義する例

```typescript
// raw params 型は models/resources/ 層の schema.ts からインポートする（boundary.ts での paths 直接参照は禁止）
import type { SubsidyCityFindAllParams } from '@/models/resources/subsidy-city/schema';
import { z } from 'zod';
import { subsidyCitySchema } from '@/models/resources/subsidy-city/schema';

/**
 * Input Port: UIからのリクエストパラメータをフラットに定義。
 * models/resources/ 層の型を satisfies で拘束し、OpenAPI変更をコンパイルエラーとして検知する。
 * 命名規則: {featureName}{ApiMethod}InputSchema
 */
export const subsidyCityFindAllInputSchema = z.object({
  facilityCode: z
    .string()
    .max(19)
    .regex(/^[0-9]{15,19}$/),
  billingIn: z
    .string()
    .length(6)
    .regex(/^[0-9]{4}(0[1-9]|1[0-2])$/),
}) satisfies z.ZodType<SubsidyCityFindAllParams>;

/**
 * Output Port: UIが期待するView Modelの形状。
 * ここではDomainスキーマがUI要件を満たしていると判断し再利用する。
 * 命名規則: {featureName}{ApiMethod}OutputSchema
 */
export const subsidyCityFindAllOutputSchema = subsidyCitySchema;

export type SubsidyCityFindAllInputPort = z.infer<typeof subsidyCityFindAllInputSchema>;
export type SubsidyCityFindAllOutputPort = z.infer<typeof subsidyCityFindAllOutputSchema>;
```

### B. 複数APIのレスポンスを組み合わせたり、変換ロジックを加える必要がある場合の例

複数APIを束ねるユースケースは、業務的な名前をつけて専用のOutputSchemaを定義する。
（例: 詳細ページ表示に必要なデータを一括取得する場合 → `DetailPage` という業務名を使用）

```typescript
// raw params 型はそれぞれの models/resources/ 層の schema.ts からインポートする
import type { SubsidyCityFindAllParams } from '@/models/resources/subsidy-city/schema';
import type { TotalAmountFindAllParams } from '@/models/resources/total-amount/schema';

import { z } from 'zod';
import { subsidyCitySchema } from '@/models/resources/subsidy-city/schema';
import { totalAmountSchema } from '@/models/resources/total-amount/schema';

/**
 * Input Port: UIからのリクエストパラメータをフラットに定義。
 * 複数 models/resources/ 層の型を交差させて satisfies で拘束する。
 * 命名規則: 業務的な名前 + {Input|Output}Schema
 */
export const subsidyCityDetailPageInputSchema = z.object({
	facilityCode: z.string(),
	billingIn: z.string(),
	totalAmountDate: z.string(),
}) satisfies z.ZodType<SubsidyCityFindAllParams & TotalAmountFindAllParams>;

/**
 * Output Port: UIが期待するView Modelの形状。
 * view modelの要件に合わせて、複数のDomainスキーマをマージして新たなスキーマを定義することも許される。
 */
export const subsidyCityDetailPageOutputSchema = subsidyCitySchema.merge(
	totalAmountSchema.pick({ totalAmount: true })
);

export type SubsidyCityDetailPageInputPort = z.infer<typeof subsidyCityDetailPageInputSchema>;
export type SubsidyCityDetailPageOutputPort = z.infer<typeof subsidyCityDetailPageOutputSchema>;
```