# Copilot Repository Custom Instructions 

## 1. Security & Privacy (セキュリティとプライバシー)

* **No Secrets**: API キーやトークンをハードコードせず、環境変数（`process.env`）を使用してください。
* **Data Leakage**: 個人情報や機密情報を `console.log` 等で出力しないでください。

## 2. Output Language (出力言語)

* **Primary**: PR レビュー、チャット応答、コード内のコメントは **日本語** で行ってください。
* **Terms**: 技術用語や変数名は英語を優先してください。


## 3. Environment & Tech Stack (環境と技術スタック)

* **Core**: Node 24.11 / pnpm 10.23 / TS 5.9 / Next.js 16.1 (App Router) / React 19.2.
* **UI Framework**: `React 19.2.3`を使用し積極的にuseActionState, useTransition, Server Components (RSC) を活用。
* **UI & Interaction**: `@litalico-engineering/thaleia-ui-react`と`Radix UI`を組み合わせたデザインシステム。
* **Error Handling**: `neverthrow` を使用した関数型エラーハンドリング。
* **Validation**: `zod` による全ての境界（API, Form, Domain）でのスキーマバリデーション。
* **Forms**: `@conform-to/react` による型安全なフォーム管理。
* **Quality Assurance**: `Vitest`、`msw`、`storybook` を用いたユニットテストとコンポーネントテスト。

## 4. Architecture Standards (アーキテクチャ規約)

本プロジェクトでは **Package by Feature** を採用しています。機能ごとにディレクトリを集約し、関連するコード（UI, ロジック, 型）を近くに配置することで凝集度を高めます。
features配下ではclean architectureをベースとしたレイヤードアーキテクチャを採用し、関心事の分離と依存関係の明確化を図っています。

### Directory Structure (ディレクトリ構造)
```
.
├── app/                        # Next.js App Router (Routing層)
│   ├── example/page.tsx           # 下層機能のページ
│   ├── layout.tsx              # ルートレイアウト (MSWProvider, Toaster等)
│   └── page.tsx                # top page
├── src/
│   ├── components/             # 共通コンポーネント
│   ├── models/                 # インフラ層 (APIリソース単位でコロケーション)
│   │   ├── resources/          # 業務リソースごとのディレクトリ
│   │   │   └── {resource}/     # リソースごとのサブディレクトリ
│   │   │       ├── schema.ts       # Zodスキーマ & 型定義
│   │   │       ├── client.ts       # fetcher経由のAPI呼び出し (リクエスト型はschema.tsからimport)
│   │   │       └── mock.ts         # MSW v2 ハンドラー & モックデータ
│   │   └── shared-schema/      # 複数リソース共通の Branded Types / Enum
│   ├── feature/                # 機能単位のモジュール (Package by Feature)
│   │   └── {feature-name}/
│   │       ├── adapter/        # interface-Adapter層
│   │       │   ├── actions.ts     # Server Actions (Controller)
│   │       │   ├── selector.ts    # UI用データ変換 (Presenter)
│   │       │   └── validationSchema.ts # フォームバリデーション
│   │       ├── components/     # UI層 (Container/Presentationalパターン)
│   │       │   └── {component-name}/
│   │       │       ├── Container.tsx      # RSC (データフェッチ担当)
│   │       │       ├── Presentational.tsx # Client Component (表示担当)
│   │       │       └── index.ts
│   │       └── use-case/       # Use Case層 (ビジネスロジック)
│   │           ├── queries/       # 取得系ロジック
│   │           │   ├── boundary.ts    # 入出力型定義 & バリデーション
│   │           │   └── interactor.ts  # use-caseロジックの実装
│   │           └── mutations/     # 更新系ロジック
│   │               ├── boundary.ts    # 入出力型定義 & バリデーション
│   │               └── interactor.ts  # use-caseロジックの実装
│   ├── hooks/                  # 共通カスタムフック
│   ├── lib/                    # 外部ライブラリのwrapper、自作ライブラリ 
│   │   ├── fetcher.ts          # 型安全な共通fetch関数（自作ライブラリ）
│   │   ├── neverThrowUtils.ts  # Result型変換用ユーティリティ（外部ライブラリのラッパー）
│   │   └── withInteractorOption.ts # Interactor拡張用高階関数（自作ライブラリ）
│   ├── mocks/                  # MSW エントリポイント
│   │   ├── server.ts           # Node.js用サーバー設定
│   │   ├── browser.ts          # ブラウザ用ワーカー設定
│   │   └── handlers.ts         # 全ハンドラーの統合登録 (各 models/resources/{resource}/mock.ts を参照)
│   └── types/                  # プロジェクト全体で使う型定義
├── public/                     # 静的ファイル & MSW Worker
└── package.json                # 依存関係定義
```

### Layer Responsibilities (レイヤーの責務)

`src/feature/{feature-name}` 配下で以下の階層構造を厳守してください。

* **Use Case (queries/mutations)**:
* `boundary.ts`: `InputPort`/`OutputPort` の型定義と `Zod` スキーマ。**レイヤー境界では必ずスキーマによるパースを行うこと。** 命名規則: `{featureName}{ApiMethod}InputSchema` / `{FeatureName}{ApiMethod}InputPort`。
* `interactor.ts`: `models/resources/{resource}/client.ts` の関数を呼び出し、**戻り値は `Result` 型**で行う。実装詳細・命名規則は `ARCHITECTURE.md` の `Naming Conventions` セクションを参照すること。

* **Adapter**:
* `actions.ts`: `use server` を付与した Server Actions。
* `selector.ts`: ドメインモデルを UI 用（テーブル表示用等）に変換する純粋関数。
* `validationSchema.ts`: フォーム入力用の `Zod` スキーマ。

* **Components**:
* `Container.tsx`: 非同期データの取得と `Selector` の適用を担当（RSC）。
* `Presentational.tsx`: `Conform` や UI ライブラリを用いた表示とインタラクション。インタラクションがないコンポーネントはRSCでも可。

## 5. Coding Standards (コーディング規約)

### General (全般)

- **Type Safety (型安全性)**: `any` の使用は厳禁です。型安全性を最優先してください。
- **Strict Const (Const の厳格化)**: 原則として `const` を使用してください。`var` や `let` はtestやmock以外では使用しないこと。
- **Branded Types**: `src/models/shared-schema/` で定義された `code` （`billingCode` 等）はBrandedTypeで宣言してください。
- **Declaration Style (宣言スタイル)**:
  - React Component: `function ComponentName() {}` (関数宣言)
  - Utils/Hooks: `const name = () => {}` (アロー関数)
- **No Abbreviations (省略形禁止)**: ループの index やイベントハンドラーの引数名に `i`、`e` などの省略形を使用せず、役割が明確な名前（例: `index`, `event`）を使用してください。

### Architecture & Design (アーキテクチャと設計)

- **YAGNI (必要最小限の実装)**: 現在必要な機能のみを実装してください。将来の拡張を前提にした共通化・抽象化は行わず、必要性が明確な場合にのみ最小限で導入してください。
- **Open-Closed (開放閉鎖原則)**: 既存のコードを変更せず、拡張可能な設計を心がけてください。
- **A11y (アクセシビリティ)**: WCAG 2.2 (AA) に準拠し、セマンティックな HTML を使用してください。

### Import Rules (インポート規則)

* **Feature Internal**: 同一 feature 内の参照は**相対パス**を使用してください。
* **Feature External**: feature 外や共有ディレクトリ（`@/lib`, `@/components`, `@/models`）へのアクセスは **`@/` エイリアス**を使用してください。

### Immutability & Purity (不変性と純粋性)

- **Pure & Declarative (純粋関数と宣言的記述)**: 命令的なループよりも、宣言的なメソッド（`map`, `filter`, `reduce`）を優先してください。
- **No Mutation (破壊的操作の禁止)**: 配列やオブジェクトの破壊的操作（Mutation）を禁止します。
  - ❌ 禁止: `push`, `pop`, `splice`, `sort`, `reverse`
  - ✅ 推奨: スプレッド構文 (`...`), `toSorted`, `toReversed`, `toSpliced`

## 6. Workflow & QA (品質保証)

* **Testing**: ロジックの変更時には `Vitest` のテスト（`.test.ts`）と `msw` ハンドラーの更新を検討してください。
* **UI Development**: コンポーネント作成時は必ず `.stories.tsx` を作成し、インタラクションがある場合は `play` 関数でテストを記述してください。
* **Definition of Done**: 生成コードは `pnpm typecheck && pnpm lint:fix && pnpm format && pnpm test` をパスする品質を維持・保証してください。
* **Skills Reference**: agent skills を使用した場合は、該当 skill の `reference/*.md` を必ず read_file で読んでから実装してください。

## 7. Review Prefixes (レビュープレフィックス)

- **[must]**: 修正必須 (バグ、規約違反、セキュリティリスク)
- **[imo]**: 提案 (設計・可読性向上、別解)
- **[nits]**: 微修正 (Typo、整形)
- **[ask]**: 質問 (意図確認)
- **[fyi]**: 参考情報
