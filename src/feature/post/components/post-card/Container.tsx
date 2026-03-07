import { findPostByIdWithLoader } from "../../use-case/queries/interactor";
import { selectPostCardItem } from "../../adapter/selector";
import { PostCardPresentational } from "./Presentational";

type Props = {
  postId: number;
};

export async function PostCardContainer({ postId }: Props) {
  const data = await findPostByIdWithLoader(
    { id: postId },
    { throwOnError: true },
  );
  const post = selectPostCardItem(data);

  return <PostCardPresentational post={post} />;
}
