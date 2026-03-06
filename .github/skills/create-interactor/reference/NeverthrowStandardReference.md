# Neverthrow Implementation Reference (SOP)

このドキュメントは、プロジェクトにおける Railway Oriented Programming の標準構文を定義します。

## 🛠 基本変換 (Lifting)
- **非同期処理のラップ**: `safeAsync(promise)` -> `ResultAsync<T, E>`
- **同期バリデーション**: `safeParse(schema)(data)` -> `Result<T, E>`
- **初期値の生成**: `ok(value)` / `err(error)`

## 🔗 パイプライン操作
| メソッド | 用途 | シグネチャのイメージ |
| :--- | :--- | :--- |
| `.map()` | **純粋なデータ加工**。失敗の可能性がない変換。 | `(T) => U` |
| `.andThen()` | **同期的な連鎖**。次に失敗する可能性（Resultを返す処理）がある場合。 | `(T) => Result<U, E>` |
| `.asyncAndThen()` | **非同期の連鎖**。次の処理が Promise/ResultAsync を返す場合。 | `(T) => ResultAsync<U, E>` |

### ✅ 純粋変換の配置ルール
- **入力の一部抽出・再構成など純粋な変換は `map` でチェーンすること。**
- `andThen/asyncAndThen` に混在させない（失敗しない変換は `map` に限定する）。
- 例: `const fixBillingRequest = { facilityCode, billingIn }` のような派生は `map` に置く。

## 🏗 複数リソースの統合
- **Parallel (並列)**: **必ず** `Promise.all([promise1, promise2])` を使用する。
  - `safeAsync` と組み合わせて使うこと。
  - **合成は `asyncAndThen(() => safeAsync(Promise.all(...))).map(...)` の形で、`asyncAndThen` の直後に `.map(...)` を書くこと。**
```typescript
ok(request)
  .safeParse(inputSchema)
  .asyncAndThen((parsedRequest) =>
    safeAsync(
      Promise.all([fetchAPI1(parsedRequest), fetchAPI2(parsedRequest)])
    )
  )
  .map(([fixBilling, totalAmount]) => ({
    fixBilling,
    totalAmount,
  }))
``` 
- **Sequential (直列)**: `.asyncAndThen(val => fetchNext(val))`
  - 前の結果を次の入力に使う場合。

## 🧪 二重バリデーション（Boundary First）
- **入力境界**: `safeParse(InputSchema)` で入力を正規化し、汚染データを遮断する。
- **出力境界**: `safeParse(OutputSchema)` でUIに渡す形を再検証し、契約破りを防ぐ。
- **目的**: インタラクター内部を「信頼済みのデータのみが流れるパイプライン」にする。

## 🧰 withInteractorOption の運用
- **必須**: すべての Interactor は `withInteractorOption` でラップする。
- **意図**: 呼び出し側が `throwOnError` を選べるようにし、Error Boundary 連携を可能にする。
- **注意**: Interactor 内部で `throw` しない。エラーは必ず `Result` として維持する。

## ⚠️ アンチパターン
- **❌ パイプライン内での try-catch**: `safeAsync` を使えば不要。
- **❌ `.unwrapOr()` の早期使用**: 最後の最後まで `Result/ResultAsync` を維持し、Interactor の出口でのみ `withInteractorOption` に委ねよ。