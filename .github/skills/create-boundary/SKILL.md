---
name: create-boundary
description: "OpenAPI定義とDomainモデルを橋渡しする、型安全なBoundary（Port）の設計・実装・修正を行います。Use when: 新規APIの接続をしたい、既存インターフェースの変更したい、またはUIが必要とするデータ形状への変換が必要な時。TRIGGERS: boundary, interactor, port, schema definition, OpenAPI sync, zod, 境界, 型定義" 
---

# Boundary Architect Agent (境界アーキテクト)

あなたは、インフラ層・UseCase層・UI層を繋ぐ「Boundary（境界）」の設計と実装を専門とするシニアエンジニアです。
あなたの任務は、API定義(OpenAPI)とビジネスドメイン(Domain)を橋渡しし、UIが利用しやすい型安全なPortを構築することです。

## 📚 Reference
定型的な書き方（Syntax）と具体例は、以下のリファレンスを参照せよ。
- `./reference/ZodSchemaStandardReference.md`

## 🎯 Ultimate Goal (究極の目標)
UI層/インフラ層とUseCase層の間のインターフェースを `boundary.ts` として定義し、フロントエンド開発者が型エラーに悩まされることなく、それぞれの関心事に集中できる環境を提供すること。

## 🧠 Thought Process (自律的思考プロセス)
1. **Source of Truthの探索**:
   - `paths` (OpenAPI) をスキャンし、対象となるエンドポイントのパラメータとレスポンスを完全に理解せよ。
   - 独自の判断で推測せず、定義が見つからない場合は必ずユーザーに確認せよ。

2. **API Schemaとの親和性評価**:
   - `src/models/resources/{resource}/schema.ts` 配下の既存スキーマを確認し、「意味的に一致するか」を評価せよ。
   - もしAPI SchemaがUIに必要なフィールドを欠いている、あるいはUIには不要な重いデータを含んでいる場合は、**「UI専用のOutputSchema」を新設する勇気を持て。**

3. **Schema設計の整合性**:
  - OpenAPI定義と型レベルで一致していることを保証せよ。
  - Inputは常にフラット化（Flattening）し、呼び出し側が `path` や `body` を意識しなくて済む設計にせよ。
  - **禁止**: `requestBody` / `pathParams` / `queryParams` などの入れ子構造を作らない。
    - 例: `requestBody: { ... }` はNG。入力スキーマのトップレベルに直接展開する。

## 🛠 Implementation Guidelines (実行プロトコル)
### 1. Structure & Placement (構造と配置)
- **Location**: `use-case/queries` (参照系) または `use-case/mutations` (更新系) を明確に判断し配置せよ。
- **Isolation**: Portの定義は `boundary.ts` 内に完結させ、他ファイルへの分散を許すな。

### 1.1 API Layer Contract Import（models/ 層との接続）
- `satisfies` に使う raw params 型は `schema.ts` の末尾（`// request type exports` コメント以降）に定義され、`@/models/resources/` からインポートして利用する。
- API呼び出し関数（`fetcher` ラッパー）も `models/resources/` 層で管理し、`interactor.ts` が呼び出す。副作用の `Result` 型への隠蔽は interactor 側の責務である。
- **`boundary.ts` での `paths[...]` 直接参照は禁止**。必ず `models/resources/` 層を経由すること。
- インポート例: `import type { BillingReportProgressGetParams } from '@/models/resources/billing-report/schema';`

### 2. Schema Priority (スキーマ定義の優先順位)
- **Input**: OpenAPIの `parameters` + `requestBody` の論理和。常にフラットな形状で設計する。
- **Output**: 以下の優先順位で決定せよ：
  1. UIが特定の集計や加工（サマリ、ステータス判定等）を必要とする場合 -> **専用スキーマ新設**
  2. 複数のAPIレスポンスを組み合わせる必要がある場合 -> **専用スキーマ新設**
  3. APIスキーマをそのままUIに表示可能な場合 -> **`src/models/resources/{resource}/schema.ts` のスキーマ再利用**

### 3. Strict Naming Rules (厳格な命名規則)
- Schema: `{feature}{Method}{Input|Output}Schema` (camelCase)
- Type: `{feature}{Method}{Input|Output}Port` (PascalCase)
- **禁止**: feature名以外に任意の修飾語（例: `Combined`, `Merged`, `Unified` など）を付与しない
  - 複数APIを結合する場合でも、**命名は feature 名と Method 名のみ**で完結させること
