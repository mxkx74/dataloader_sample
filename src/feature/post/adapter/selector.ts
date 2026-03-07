import type {
  PostFindAllOutputPort,
  PostFindByIdOutputPort,
} from "../use-case/queries/boundary";


export const selectPostListItems = (data: PostFindAllOutputPort) => {
  return data.map((post) => ({
    id: post.id,
    userId: post.userId,
  }));
};

export const selectPostCardItem = (data: PostFindByIdOutputPort) => ({
  id: data.id,
  title: data.title,
  body: data.body,
  userId: data.userId,
});
