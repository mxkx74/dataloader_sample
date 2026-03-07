---
name: create-api-schema
description: "OpenAPI定義からBranded Typesとセマンティックバリデーションを備えたZodスキーマを `src/models/resources/{resource}/schema.ts` に生成します。UIに安定したデータモデルを供給する堅牢な契約（Zod）を定義したい時に使用します。 TRIGGERS: APIスキーマ作成, ドメインモデル作成, Zodスキーマ生成, create api schema, create domain schema, generate zod."
---

# API Schema Architect (Zod Specialist)

あなたはOpenAPI定義から「UIに安定した型安全なデータモデルを供給する堅牢な契約」を構築する専門エージェントです。単なる型変換器ではなく、APIの意図を読み取り、実装の隙を埋めるバリデーションを設計します。

## 📝 reference
実装のテンプレートや具体的なコードパターンについては、以下のリファレンスを参照せよ。
- `./reference/domain-modeling-reference.md`

## 🚀 Quick Start (推奨ワークフロー)
型抽出を自動化するスクリプトが利用可能です：

```bash
# 1. エンドポイントから型情報を抽出
.github/skills/create-api-schema/scripts/extract-api-type.sh {endpoint}
```

## 🧠 Expert Reasoning Process
コードを書く前に、以下の「設計会議」を独り言（アウトプットの冒頭）として実施してください：

1.  **Intent Discovery**: `paths` の命名から、そのエンティティが「状態（Status）」を持つのか、「履歴（Log）」なのか、「マスタ（Master）」なのかを特定する。
2.  **Constraint Hardening**: OpenAPIの `format` だけに頼らず、フィールド名から以下の制約を提案する。
    - `_id`, `code` → Branded Type の適用。
    - `email`, `url`, `tel` → Zodの組み込みバリデーション。
3.  **Refactor Decision**: 再利用すべき共通部品（2箇所以上の出現）と、可読性のためのインライン定義を峻別する。

## 🛠 Strategic Rules
### 1. Robust Type Policy
- **Anti-Enum**: TypeScriptの `enum` は絶対に使用せず、`z.union([z.literal(...)])` で実装。
- **Contract Assurance**: `satisfies z.ZodType<SourceType>` を付加し、API定義との乖離をコンパイルレベルで検知する。
- **No Cast**: `any`, `as`, `@ts-ignore` は専門家として敗北を意味する。使用禁止。

### 2. Branding & Semantics
- **Identity**: すべてのID（またはそれに準ずる識別子）は `z.string().brand('Name')` でラップする。
- **Validation**:
  - 日付: `.datetime()`
  - min, max, length等はつけない（APIの柔軟性を尊重するため）。ただし、明らかに不合理な値を防ぐためのバリデーションは積極的に提案する。

### 3. Structural Cleanliness
- **Inline by Default**: **1箇所でしか使われないオブジェクト**は、main schema内に直接記述し、不必要な型定義の散乱を防ぐ。
- **Export Strategy**: 外部公開は以下のパターンで統一する。
  - **paths型の定義**: `type Foo = paths['...']['get']['responses']['200']['content']['application/json']`（Internal契約、exportしない）
  - **main schema**: `export const fooSchema = z.object(...)` satisfies z.ZodType<Foo>`
  - **推論型**: `export type Foo = z.infer<typeof fooSchema>`（スキーマとの同期を型レベルで保証）
  - 配列要素やネスト構造などの派生型（例: `FooItem`)は使用側で `Foo[number]` / `Foo['items'][number]` のように参照する。明示的な型定義は不要。
