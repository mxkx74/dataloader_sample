import { z } from "zod/v4";
import { postListSchema } from "@/models/resources/post/schema";

export const postFindAllInputSchema = z.object({
  limit: z.number().int().positive().optional(),
});

export const postFindAllOutputSchema = z.array(
  postListSchema.element.pick({
    id: true,
    userId: true,
  }),
);

export type PostFindAllInputPort = z.infer<typeof postFindAllInputSchema>;
export type PostFindAllOutputPort = z.infer<typeof postFindAllOutputSchema>;

export const postFindByIdInputSchema = z.object({
  id: z.number().int().positive(),
});

export const postFindByIdOutputSchema = postListSchema.element;

export type PostFindByIdInputPort = z.infer<typeof postFindByIdInputSchema>;
export type PostFindByIdOutputPort = z.infer<typeof postFindByIdOutputSchema>;
