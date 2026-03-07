import type { Result } from "neverthrow";

import { findAllPosts as findAllPostsClient } from "@/models/resources/post/client";
import { getPostLoader } from "@/models/resources/post/dataloader";
import { getUserLoader } from "@/models/resources/user/dataloader";
import { withInteractorOption } from "@/lib/withInteractorOption";
import { safeAsync, safeParse } from "@/lib/neverThrowUtils";
import type { Errors } from "@/lib/errors";
import {
  postFindAllInputSchema,
  postFindAllOutputSchema,
  postFindByIdInputSchema,
  postFindByIdOutputSchema,
  type PostFindAllInputPort,
  type PostFindAllOutputPort,
  type PostFindByIdInputPort,
  type PostFindByIdOutputPort,
} from "./boundary";

const findAllPostsInteractor = async (
  input: PostFindAllInputPort,
): Promise<Result<PostFindAllOutputPort, Errors>> => {
  return safeParse(postFindAllInputSchema, input)
    .asyncAndThen((parsed) =>
      safeAsync(findAllPostsClient({ limit: parsed.limit })),
    )
    .andThen(safeParse(postFindAllOutputSchema));
};

export const findAllPosts = withInteractorOption(findAllPostsInteractor);

const findPostByIdWithLoaderInteractor = async (
  input: PostFindByIdInputPort,
): Promise<Result<PostFindByIdOutputPort, Errors>> => {
  return safeParse(postFindByIdInputSchema, input)
    .asyncAndThen((parsed) => {
      const loader = getPostLoader();
      return safeAsync(loader.load(parsed.id));
    })
    .andThen((post) => {
      const loader = getUserLoader();
      return safeAsync(loader.load(post.userId)).map((user) => ({
        ...post,
        author: user,
      }));
    })
    .andThen(safeParse(postFindByIdOutputSchema));
};

export const findPostByIdWithLoader = withInteractorOption(
  findPostByIdWithLoaderInteractor,
);
