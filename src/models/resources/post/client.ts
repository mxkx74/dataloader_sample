import { fetcher } from "@/lib/fetcher";
import {
  postListSchema,
  type PostFindAllParams,
  type PostFindManyByIdsParams,
} from "./schema";
import type { PostList } from "./schema";

const BASE_URL =
  process.env["NEXT_PUBLIC_API_BASE_URL"] ??
  "https://jsonplaceholder.typicode.com";

export const findAllPosts = (
  params: PostFindAllParams = {},
): Promise<PostList> => {
  const url = new URL(`${BASE_URL}/posts`);
  if (params.limit !== undefined) {
    url.searchParams.set("_limit", String(params.limit));
  }
  return fetcher<PostList>(url.toString(), {
    method: "GET",
    responseSchema: postListSchema,
  });
};

export const findManyPostsByIds = (
  params: PostFindManyByIdsParams,
): Promise<PostList> => {
  const url = new URL(`${BASE_URL}/posts`);
  params.ids.forEach((id) => url.searchParams.append("id", String(id)));
  return fetcher<PostList>(url.toString(), {
    method: "GET",
    responseSchema: postListSchema,
  });
};
