import { z } from "zod";

export const placeholderSchema = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
});

export const placeholderListSchema = z.array(placeholderSchema);

export type Placeholder = z.infer<typeof placeholderSchema>;
export type PlaceholderList = z.infer<typeof placeholderListSchema>;

/** GET /todos パラメータ */
export type PlaceholderFindAllParams = {
  limit?: number;
};

/** GET /todos/:id パラメータ */
export type PlaceholderFindByIdParams = {
  id: number;
};
