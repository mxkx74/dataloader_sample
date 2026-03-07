import { z } from "zod";

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string(),
});

export const userListSchema = z.array(userSchema);

export type User = z.infer<typeof userSchema>;
export type UserList = z.infer<typeof userListSchema>;

/** GET /users バルク取得パラメータ */
export type UserFindManyByIdsParams = {
  ids: readonly number[];
};
