import { Suspense } from "react";
import { PlaceholderListContainer } from "@/feature/placeholder/components";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "DataLoader サンプル",
  description: "DataLoader による効率的なバッチ取得のサンプルページ",
};

function PlaceholderSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }, (_, skeletonIndex) => (
        <Skeleton key={skeletonIndex} className="h-10 w-full" />
      ))}
    </div>
  );
}

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
