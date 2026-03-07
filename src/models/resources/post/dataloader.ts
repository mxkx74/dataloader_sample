import { createDataLoaderFactory } from "@/lib/dataloader";
import { findManyPostsByIds } from "./client";
import type { Post } from "./schema";

export const getPostLoader = createDataLoaderFactory<number, Post | Error>(
  async (ids) => {
    const posts = await findManyPostsByIds({ ids });
    return ids.map(
      (id) =>
        posts.find((post) => post.id === id) ??
        new Error(`Post not found: ${id}`),
    );
  },
);
