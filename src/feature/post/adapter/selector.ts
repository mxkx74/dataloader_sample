import type {
  PostFindAllOutputPort,
  PostFindByIdOutputPort,
} from "../use-case/queries/boundary";

export type PostListItem = {
  id: number;
  title: string;
  userId: number;
};

export type PostCardItem = {
  id: number;
  title: string;
  body: string;
  userId: number;
};

export const selectPostListItems = (
  data: PostFindAllOutputPort,
): PostListItem[] => {
  return data.map((post) => ({
    id: post.id,
    title: post.title,
    userId: post.userId,
  }));
};

export const selectPostCardItem = (
  data: PostFindByIdOutputPort,
): PostCardItem => ({
  id: data.id,
  title: data.title,
  body: data.body,
  userId: data.userId,
});
