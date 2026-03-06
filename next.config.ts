import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  reactCompiler: true,
  typedRoutes: true,
  experimental: {
    // Router Cacheの保持時間をカスタマイズする設定
    staleTimes: {
      // 動的ルート（Dynamic Routes）のキャッシュ時間（秒）
      // デフォルトの0から任意の数値（例: 30秒）に変更
      dynamic: 60,
    },
  },
};

export default nextConfig;
