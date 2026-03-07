import { z } from "zod";

export const postSchema = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
  body: z.string(),
});

export const postListSchema = z.array(postSchema);

export type Post = z.infer<typeof postSchema>;
export type PostList = z.infer<typeof postListSchema>;

/** GET /posts パラメータ */
export type PostFindAllParams = {
  limit?: number;
};

/** GET /posts バルク取得パラメータ */
export type PostFindManyByIdsParams = {
  ids: readonly number[];
};
