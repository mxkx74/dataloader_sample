# Architecture Guide (アーキテクチャガイド)

## Overview (概要)
このプロジェクトは Next.js (App Router) を使用した就労支援業務システムの、全サービス種別共通で利用する機能を集約したフロントエンドです。
機能単位で分割された **Vertical Slice Architecture (Feature-based)** を採用しており、各機能は高い凝集度を保つように設計されています。

## Directory Structure Principles (ディレクトリ構造の原則)

`src/` 配下は以下の方針で分割されています。

- **`app/`**: Next.js の App Router。ルーティングとページのエントリーポイントのみを配置し、ビジネスロジックは持ちません。
- **`components/`**: アプリケーション全体で共有される汎用コンポーネント。特定のドメイン知識を持たないUIパーツを配置します。
- **`models/`**: インフラ層のエントリポイント。共有プリミティブは `models/shared-schema/` に配置し、業務リソース単位のサブディレクトリ（`models/resources/{resource}/`）を作成し、スキーマ定義（`schema.ts`）・通信処理（`client.ts`）・モックデータ（`mock.ts`）をコロケーションする。副作用そのものは含むが、**Result型への隠蔽は use-case/interactor が担う**。
- **`feature/`**: 機能ごとの実装。アプリケーションの主要なコードはここに配置されます。
- **`lib/`**: 汎用ユーティリティ、外部ライブラリのラッパー（fetcherなど）。
- **`mocks/`**: MSW の `server.ts`（Node.js用）と `browser.ts`（ブラウザ用）、および全ハンドラーを統合する `handlers.ts` のみを配置します。個別リソースのモック実装は `models/resources/{resource}/mock.ts` に置きます。

## Feature Directory Structure (Feature ディレクトリの構成) - `src/feature/{feature_name}/`

各機能ディレクトリ内は、レイヤードアーキテクチャの概念を適用し、以下のように責務を分離しています。

### 1. `use-case/`
アプリケーションのユースケース（ユーザーが達成したい目的）を定義します。
- **`queries/`**: データ取得系 (GET)。単一または複数のAPI呼び出しを集約し、フロントエンドに必要な形にデータを整える処理もここで行います。`boundary.ts` (入出力定義) と `interactor.ts` (処理実装) を含みます。
- **`mutations/`**: データ更新系 (POST/PUT/PATCH/DELETE)。同様に `boundary.ts` と `interactor.ts` を含みます。

### 2. `adapter/`
UIコンポーネントとユースケース、またはドメインロジックを繋ぐ変換層です。
- **`selector.ts`**: APIレスポンス等のドメインデータを、UIが表示しやすい形に整形・集計するロジック。
- **`actions.ts`**: Server Actions のエントリーポイント。フォーム送信などのサーバーサイド処理を記述します。
- **`validationSchema.ts`**: フォーム入力値の検証ルール（Zodスキーマ）などを定義します。

### 3. `components/`
この機能専用のUIコンポーネントです。**Container/Presentational パターン**を採用しています。
- **`Container.tsx`**: サーバーサイド（React Server Components）で実行され、`use-case` (Interactor) を呼び出してデータを取得します。実質的な **BFF (Backend For Frontend)** の役割を担い、クライアントに必要なデータを準備して渡します。
- **`Presentational.tsx`**: UIの描画に加え、フォームハンドリングやローカルの状態管理（State Management）などのロジックを担当します。

## Design Patterns and Implementation Rules (設計パターンと実装ルール)

### Data Fetching Strategy (データ取得戦略)

パフォーマンスとUXを最適化するため、以下の戦略を基本とします。

1. **Nested Server Components (推奨)**
   - ページルートですべてのデータを一括取得するのではなく、データが必要なコンポーネント（Container）単位で分割して配置します。
   - 各 Container を `Suspense` でラップすることで、並列データ取得と部分的なローディング（Streaming）を実現します。

2. **Await in Server Component**
   - Server Component (Container) ではデータ取得を `await` し、**解決済みのデータ**を Client Component (Presentational) に Props として渡します。
   - これにより、Server Component がデータの取得責務を完全に担い、Client Component は表示・インタラクションに専念できます。

3. **Promise Passing (Client to Client)**
   - クライアントコンポーネント間で非同期データを連携する場合（例: 一覧からダイアログを開いて詳細を取得するなど）も、このパターンを推奨します。
   - **呼び出し元**: イベントハンドラ等で非同期データ取得を開始し、未解決の Promise を State 等で保持して呼び出し先（ダイアログ等）に渡します。
   - **呼び出し先**: 受け取った Promise を `React.use()` で解決します。これにより、データ取得中も Suspense と組み合わせた適切なローディング状態を表現できます。

### Error Handling (Use-Case Layer) (エラーハンドリング)

ユースケース層（`interactor.ts`）の実装では、堅牢性と予測可能性を高めるために **Railway Oriented Programming (ROP)** を採用しています。

- **ライブラリ**: `neverthrow` を使用し、関数の戻り値は常に `Result` 型（`Ok` または `Err`）で表現します。原則として、ロジック内で例外（`throw`）は使用せず、エラーも値として扱います。
- **実装ラッパー**: 全ての Interactor は `src/lib/withInteractorOption.ts` が提供する `withInteractorOption` 高階関数でラップしてエクスポートします。

### Interactor Behavior Control (Interactor の挙動制御 - throwOnError)

`withInteractorOption` ラッパーにより、呼び出し元は `throwOnError` オプションを使用してエラーハンドリングの戦略を選択できます。

1. **`throwOnError: false` (デフォルト)**
   - `Result` 型を返します。呼び出し元で `result.isErr()` をチェックし、エラー内容に応じた分岐処理を行う場合に適しています。

2. **`throwOnError: true`**
   - エラー発生時に例外をスローします。`error.tsx` (Error Boundary) でキャッチさせる場合や、`Suspense` と組み合わせてデータ取得を行う Server Component で有用です。

## Data Flow (データフロー)

1. **Page (`app/**`)**: URLパラメータを受け取り、構成要素となる Feature の `Container` (Server Component) を配置します。
2. **Container**:
   - `use-case/queries` (Interactor) を呼び出し、`await` でデータを取得します。
   - 解決済みのデータを `Presentational` に Props として渡します。
   - エラーハンドリングを `error.tsx` に委譲する場合は `throwOnError: true` を使用します。
3. **Interactor**: `models/resources/` 層の関数を呼び出し、`safeAsync` で副作用を `Result` 型に隠蔽します（Railway Oriented Programming）。Zodスキーマで入出力を検証し、`Result` 型を返します。
4. **Selector**: `adapter/selector.ts` を通して、取得した生データをUI表示用に整形・加工します。
5. **Presentational**:
   - 解決済みデータを Props として受け取り、描画します。
   - ユーザー操作に伴う Server Actions の呼び出しやフォームの状態管理を行います。

## Test Strategy (テスト戦略)

- **Unit Test (Vitest)**: ロジック（adapter, use-case, lib）やHooksの単体テストを行います。
- **Component Test (Storybook)**: `Presentational` コンポーネントの表示状態やインタラクションを確認します。

## Naming Conventions (命名規則)
- ディレクトリ名はケバブケース（例: `total-amount`, `benefit-amount`）。
- `src/models/resources/{resource}/` 配下のファイルは固定名（`schema.ts`, `client.ts`, `mock.ts`）。
- コンポーネントファイル名はパスカルケース（例: `TotalAmountTable.tsx`）。
- `src/lib/`, `src/hooks/` 等のその他ファイル名はキャメルケース（例: `neverThrowUtils.ts`）。
- 関数や変数名はキャメルケース。
- featureフォルダ内の`components/index.ts` は、そのフォルダが公開すべきモジュールのみを export するために使用します（Barrel File パターン）。

### API Schema (`src/models/resources/{resource}/schema.ts`)

APIリソース単位でスキーマを定義し、UIに対して**型安全で安定したデータモデルを供給する**インフラ層の契約ファイルです。

- **ディレクトリ**: `src/models/resources/{resource}/`（例: `src/models/resources/benefit-amount/schema.ts`）
- **ファイル名**: `schema.ts` 固定
- **スキーマ名**: キャメルケースのリソース名に `Schema` を付与する（例: `benefitAmountSchema`）
- **型名**: パスカルケースのリソース名（例: `BenefitAmountSummary`）
- 同一リソース配下の `/summary` や `/detail` などのサブエンドポイントは、同一の `schema.ts` に集約する（例: `/rezept/benefit-amounts/summary` と `/rezept/benefit-amounts/detail` → `benefit-amount/schema.ts`）
- **リクエスト型**: クエリパラメータ・パスパラメータ・リクエストボディの型も `schema.ts` で定義する。

型名：
- クエリ/パスパラメータ: `{EntityName}{MethodPascalCase}Params`（例: `SubsidyCityFindAllParams`, `BenefitAmountGetSummaryParams`）
- パスとクエリが混在: `{EntityName}{MethodPascalCase}PathParams` / `{EntityName}{MethodPascalCase}QueryParams`
- リクエストボディ: `{EntityName}{MethodPascalCase}Body`（例: `FixBillingFixBody`, `OwnUpperManagementCalculateBody`）

#### Shared Schema (`src/models/shared-schema/`)
- 複数リソースで共有される Branded Types や Enum は `src/models/shared-schema/` に配置する。
- フィールド名が `id` / `code`（またはその PascalCase 相当）で終わる文字列識別子は Branded Type として定義する。
- 命名規則: スキーマ `{entityName}CodeSchema` / `{entityName}IdSchema`、型 `{EntityName}Code` / `{EntityName}Id`。

### API Client (`src/models/resources/{resource}/client.ts`)

通信処理のみを担うファイルです。`lib/fetcher` / `lib/blobFetcher` を経由してエンドポイントを呼び出し、Promise を返します。副作用そのものは含みますが、**Result 型への隠蔽は use-case/interactor が担います**。リクエスト型は `schema.ts` で定義されたものを使用します。

- **ディレクトリ**: `src/models/resources/{resource}/`（例: `src/models/resources/benefit-amount/client.ts`）
- **ファイル名**: `client.ts` 固定
- メソッド命名規則の詳細は `create-api-client` スキルを参照。

### API Mock (`src/models/resources/{resource}/mock.ts`)

MSW v2 のハンドラーとモックデータを定義するファイルです。

- **ディレクトリ**: `src/models/resources/{resource}/`（例: `src/models/resources/benefit-amount/mock.ts`）
- **ファイル名**: `mock.ts` 固定
- 作成後、`src/mocks/handlers.ts` にハンドラーを追加登録すること。

### Boundary (`use-case/queries/boundary.ts`, `use-case/mutations/boundary.ts`)
- **InputSchema**: `{featureName}{ApiMethod}InputSchema`（例: `subsidyCityFindAllInputSchema`）
- **OutputSchema**: `{featureName}{ApiMethod}OutputSchema`（例: `subsidyCityFindAllOutputSchema`）
- **InputPort型**: `{FeatureName}{ApiMethod}InputPort`（例: `SubsidyCityFindAllInputPort`）
- **OutputPort型**: `{FeatureName}{ApiMethod}OutputPort`（例: `SubsidyCityFindAllOutputPort`）
- **複数APIを束ねるユースケース**: 業務的な名前をつけ、専用OutputSchemaを定義する（例: `ownUpperManagementDetailPageOutputSchema`）

### Interactor (`use-case/queries/interactor.ts`, `use-case/mutations/interactor.ts`)
- **取得系（queries）**: `{apiMethod}{FeatureName}` または `get{FeatureName}{Noun}`（例: `findAllSubsidyCity`, `getBenefitAmountDetail`, `getBillingReportProgress`）
- **更新系（mutations）**: `{verb}{FeatureName}` または `{verb}{Noun}`（例: `updateOtherUpperManagement`, `fixPayment`, `registerZeroBurden`）
- **複数APIを束ねる場合**: 業務的な名前を使用（例: `getOwnUpperManagementDetailPage`）
- 命名の詳細パターンは `create-interactor` スキルを参照。