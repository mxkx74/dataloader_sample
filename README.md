# dataloader_sample

Next.js (App Router) と [DataLoader](https://github.com/graphql/dataloader) を組み合わせた、バッチ処理・キャッシュ制御のサンプルアプリケーションです。  
複数コンポーネントから同一リクエスト内で発生する重複 API 呼び出しを DataLoader でバッチ化・重複排除することを目的としています。

## ローカルでの起動方法

### 前提条件

- Node.js 24.11 以上
- pnpm 10.23 以上

### 手順

```bash
# 依存パッケージのインストール
pnpm install

# 開発サーバーの起動（Turbopack 使用）
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### その他のコマンド

| コマンド | 説明 |
|---|---|
| `pnpm build` | プロダクションビルド |
| `pnpm start` | プロダクションサーバーの起動 |
| `pnpm lint` | ESLint によるコード検査 |
| `pnpm typecheck` | TypeScript の型検査 |
| `pnpm test` | Vitest によるテスト実行 |

## 使用ライブラリ

### 主要ライブラリ

| ライブラリ | 説明 |
|---|---|
| [Next.js](https://nextjs.org/) v16 | React フレームワーク（App Router 使用） |
| [React](https://react.dev/) v19 | UI ライブラリ |
| [dataloader](https://github.com/graphql/dataloader) | API リクエストのバッチ処理・重複排除 |
| [neverthrow](https://github.com/supermacro/neverthrow) | 関数型エラーハンドリング（Result 型） |
| [zod](https://zod.dev/) | スキーマバリデーション |
| [@conform-to/react](https://conform.guide/) | 型安全なフォーム管理 |

### UI 関連

| ライブラリ | 説明 |
|---|---|
| [Tailwind CSS](https://tailwindcss.com/) v4 | ユーティリティファーストな CSS フレームワーク |
| [@radix-ui/react-slot](https://www.radix-ui.com/) | アクセシブルな UI プリミティブ |
| [class-variance-authority](https://cva.style/) | バリアントベースのクラス名管理 |
| [clsx](https://github.com/lukeed/clsx) / [tailwind-merge](https://github.com/dcastil/tailwind-merge) | 条件付きクラス名合成 |
| [lucide-react](https://lucide.dev/) | アイコンライブラリ |

### 開発・テスト

| ライブラリ | 説明 |
|---|---|
| [Vitest](https://vitest.dev/) | ユニットテストフレームワーク |
| [msw](https://mswjs.io/) v2 | API モック（Mock Service Worker） |
| [@testing-library/react](https://testing-library.com/) | React コンポーネントテストユーティリティ |
| [TypeScript](https://www.typescriptlang.org/) v5 | 静的型付け |
