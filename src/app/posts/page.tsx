import { Suspense } from "react";
import { PostListContainer } from "@/feature/post/components";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "記事一覧",
  description: "DataLoader によるバッチ取得と Streaming UI のサンプルページ",
};

function PostListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 10 }, (_, skeletonIndex) => (
        <Skeleton key={skeletonIndex} className="h-32 w-full" />
      ))}
    </div>
  );
}

export default function PostsPage() {
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">記事一覧</h1>
      <Suspense fallback={<PostListSkeleton />}>
        <PostListContainer />
      </Suspense>
    </main>
  );
}
