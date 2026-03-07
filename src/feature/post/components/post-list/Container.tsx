import { Suspense } from "react";
import { findAllPosts } from "../../use-case/queries/interactor";
import { selectPostListItems } from "../../adapter/selector";
import { PostCardContainer, PostCardSkeleton } from "../post-card";

export async function PostListContainer() {
  const data = await findAllPosts({ limit: 10 }, { throwOnError: true });
  const items = selectPostListItems(data);

  return (
    <ul className="grid gap-4 list-none p-0 m-0" role="list">
      {items.map((item) => (
        <li key={item.id}>
          <Suspense fallback={<PostCardSkeleton />}>
            <PostCardContainer postId={item.id} />
          </Suspense>
        </li>
      ))}
    </ul>
  );
}
