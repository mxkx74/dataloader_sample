import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { selectPostCardItem } from "../../adapter/selector";

type Props = {
  post: ReturnType<typeof selectPostCardItem>;
};

export function PostCardPresentational({ post }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{post.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{post.body}</p>
        <p className="text-xs text-muted-foreground mt-2">
          投稿者: {post.author.name}
        </p>
      </CardContent>
    </Card>
  );
}

export function PostCardSkeleton() {
  return (
    <Card aria-busy="true" aria-label="読み込み中">
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-3 w-1/4 mt-2" />
      </CardContent>
    </Card>
  );
}
