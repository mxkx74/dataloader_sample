import { createDataLoaderFactory } from "@/lib/dataloader";
import { findManyUsersByIds } from "./client";
import type { User } from "./schema";

export const getUserLoader = createDataLoaderFactory<number, User>(
  async (ids) => {
    const users = await findManyUsersByIds({ ids });
    return ids.map(
      (id) =>
        users.find((user) => user.id === id) ??
        new Error(`User not found: ${id}`),
    );
  },
);
