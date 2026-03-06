import { Skeleton } from "@/components/ui/skeleton";

export function PlaceholderSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }, (_, skeletonIndex) => (
        <Skeleton key={skeletonIndex} className="h-10 w-full" />
      ))}
    </div>
  );
}
