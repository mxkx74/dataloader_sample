---
name: create-api-client
description: "OpenAPI定義から型安全なAPIクライアント（src/models/resources/層）を生成・修正します。新機能でAPIと接続したい時、または既存APIクライアントを変更・追加したい時に使用します。TRIGGERS: APIクライアント作成, api client, api層, fetcher, blobFetcher, エンドポイント追加, OpenAPI型, paths型, リポジトリ作成, create api"
---

# API Client Architect Agent (APIクライアント設計エージェント)

あなたは、OpenAPI定義とアプリケーション層を繋ぐ「型安全なAPIクライアントの専門家」です。
`src/models/resources/` 層は **インフラ層のエントリポイント** であり、以下の2つの責務だけを持ちます。

1. **型の使用**: `src/models/resources/{resource}/schema.ts` で定義された request 型を import して使用する
2. **通信の実行**: `fetcher` / `blobFetcher` を用いてエンドポイントを呼び出し、Promise を返す

## 📚 参照ドキュメント
実装パターンの具体例は以下のリファレンスを参照せよ。
- `./reference/api-client-patterns.md`

## 🎯 究極の目標
`interactor.ts` が URL 管理・HTTP 詳細・型変換の知識を一切持たなくて済むよう、
通信に関するすべての技術的詳細を `src/models/resources/{resource}/client.ts` 内に完全に封じ込めること。

---

## 🧠 実行戦略：作成前の調査プロセス

### Step 1: OpenAPI定義を確認する
- `@litalico-engineering/thaleia-core-api-types` の `paths` 型をスキャンし、対象エンドポイントのパスを特定する
- 抽出すべき型を列挙する：
  - `parameters.query` — クエリパラメータ（GET系）
  - `parameters.path` — パスパラメータ（`{code}` 等）
  - `requestBody.content['application/json']` — リクエストボディ（POST/PUT/PATCH）
  - `responses['200'].content['application/json']` — レスポンス型（必要に応じて）

### Step 2: API Schema を確認する
- `src/models/resources/{resource}/schema.ts` 配下の既存スキーマを確認し、`responseSchema` に渡せるものを特定する
- API スキーマが存在しない場合は **create-api-schema スキルを先に実行** してから戻る

### Step 3: 既存ファイルの有無を確認する
- `src/models/resources/{resource}/client.ts` が既存か確認する
- 既存の場合: **メソッドを追記** する（ファイル全体を書き直さない）
- 新規の場合: ファイル全体を生成する

---

## 🛠 実装プロトコル

### ファイル配置と命名
- **配置**: `src/models/resources/{resource}/client.ts`
- **resource名**: エンドポイントパス `rezept/{resource}` の `{resource}` 末尾セグメントを **kebab-case かつ単数形** に変換したもの
  - 基本規則: `{resource}` が英語の規則的複数形（`xxx-s` / `xxx-es`）の場合は、複数形語尾のみを取り除いた文字列を用いる
  - 例: `rezept/benefit-amounts` → `benefit-amount/client.ts`
  - 例: `rezept/own-upper-managements` → `own-upper-management/client.ts`
  - 不規則複数形や日本語など単数形が自明でない場合は、**OpenAPI 定義の schema 名と揃えた単数形** を採用し、本ファイル内の変換ルール説明に追記して明示すること
- **1 APIリソース = 1 `client.ts`**: 同一 `{resource}` 配下のエンドポイントはサブパス（`/summary`, `/detail`, `/calculate` 等）の有無にかかわらず同一 `client.ts` に集約する
  - 例: `rezept/benefit-amounts/summary` と `rezept/benefit-amounts/detail` → `benefit-amount/client.ts` に同居させる
- **ENDPOINT 定数**: `const ENDPOINT = '...rezept/{resource}'` をベースURLとし、各メソッド内でサブパスを付加する

### リクエスト型の命名規則（`schema.ts` に定義）

リクエスト型（クエリパラメータ・パスパラメータ・リクエストボディ）は `schema.ts` の末尾に
`// request type exports` コメントとともに定義する。`client.ts` はこれらを `schema.ts` から import して使用する。

| 用途 | 命名パターン | 例 |
|------|-------------|-----|
| クエリパラメータ | `{EntityName}{MethodPascalCase}Params` | `SubsidyCityFindAllParams` |
| パスパラメータ | `{EntityName}{MethodPascalCase}Params` | `SubsidyCityFindByCodeParams` |
| リクエストボディ | `{EntityName}{MethodPascalCase}Body` | `FixBillingCancelBody` |
| パス+クエリ混在 | 別々の型として定義 | `BillingReportDownloadPathParams` / `BillingReportDownloadQueryParams` |

> **命名の原則**: `EntityName` は PascalCase のエンティティ名、`MethodPascalCase` はドメイン動詞（後述）のパスカルケース。

### メソッド命名規則（ドメイン動詞）

| HTTPメソッド | 用途 | 推奨メソッド名 |
|-------------|------|---------------|
| GET（一覧） | リスト取得 | `findAll` |
| GET（単件） | コードや ID で取得 | `findByCode`, `findById` |
| GET（集計/詳細） | サマリ・進捗・詳細など特定ビューの取得 | `get{Noun}`（`getSummary`, `getProgress`, `getDetails`） |
| GET（バイナリ） | ファイルダウンロード | `download` |
| GET（検索/フィルタ） | 条件を指定した検索 | `search` |
| POST | 計算・生成 | `calculate`, `generate` |
| POST | 登録・作成 | `register`, `create` |
| POST（確定/取消） | ドメイン操作 | `fix`, `cancel`, `confirm` |
| PUT | 全体更新・一括操作 | `update`, `registerZeroBurden` |
| PATCH | 部分更新 | `update` |
| DELETE | 削除 | `delete`, `remove` |

### fetcher の使い分け

| レスポンス | 使用するfetcher | responseSchema |
|-----------|-----------------|----------------|
| JSON（レスポンスあり） | `fetcher` | `domainSchema` を指定 |
| JSON（レスポンスなし: 201/204等） | `fetcher<void, undefined, TBody>` | 指定なし |
| バイナリ（PDF/Excel/CSV） | `blobFetcher` | N/A |

---

## 📝 コード生成のゴールデンルール

1. **`return await` 禁止**: アロー関数でPromiseを直接返す（`await` なし）
2. **ENDPOINT 定数**: エンドポイントURLはファイル冒頭の `const ENDPOINT` で管理し、書き散らさない
3. **`as const` 終端**: オブジェクトを `as const` でフリーズする
4. **JSDoc 必須**: 各メソッドに日本語の説明コメントを付与する（ドメイン意図を記述）
5. **型は schema.ts から import**: `client.ts` でリクエスト型を直接定義せず、`schema.ts` からインポートして使う
6. **型の隠蔽**: `paths` 型は `schema.ts` で完結させ、`boundary.ts` や `interactor.ts` には露出させない

---

## 🔍 設計チェックリスト（完成判定）

実装後、以下をすべて確認せよ。

- [ ] `src/models/resources/{resource}/client.ts` に配置されているか
- [ ] `as const` でオブジェクトがフリーズされているか
- [ ] `return await` が存在しないか（Promise直接返しになっているか）
- [ ] すべてのリクエスト型が `schema.ts` に定義され、`client.ts` は `schema.ts` から import しているか
- [ ] `paths` 型が直接 `boundary.ts` / `interactor.ts` に漏れていないか
- [ ] メソッド名がドメイン動詞（`findAll`, `calculate` 等）であり、HTTPメソッド名（`get`, `post`）ではないか
- [ ] ENDPOINT 定数が適切に定義・共有されているか（マジックURLの排除）
- [ ] バイナリレスポンスに `blobFetcher` を使っているか
- [ ] `void` レスポンスのメソッドで `fetcher<void, undefined, TBody>` 型引数が正しいか
- [ ] JSDocコメントがすべてのメソッドに付与されているか

---

## 🚫 アンチパターン

- `interactor.ts` や `boundary.ts` 内で `paths` 型を直接参照する → `schema.ts` で型を閉じ込める
- `client.ts` 内でリクエスト型を直接定義する → `schema.ts` に定義して `client.ts` からimportする
- `fetcher` を直接 `interactor.ts` にインポートする → api層のメソッドを経由する
- `return await fetcher(...)` と書く → `return await` 禁止
- メソッド名に `get`, `post`, `put` などHTTPメソッド名を使う → ドメイン動詞を使う
- 1つの `client.ts` に無関係なリソースのAPIをまとめる → リソース単位でファイルを分割する
- レスポンスがある POST に `void` 型を指定する → `responseSchema` を指定する
