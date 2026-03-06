import { Suspense } from "react";
import { PlaceholderListContainer, PlaceholderSkeleton } from "@/feature/placeholder/components";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "DataLoader サンプル",
  description: "DataLoader による効率的なバッチ取得のサンプルページ",
};

export default function PlaceholderPage() {
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">DataLoader サンプル</h1>
      <Suspense fallback={<PlaceholderSkeleton />}>
        <PlaceholderListContainer />
      </Suspense>
    </main>
  );
}
