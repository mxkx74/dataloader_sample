import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DataLoader サンプル",
  description: "DataLoader による効率的なバッチ取得のサンプル",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
