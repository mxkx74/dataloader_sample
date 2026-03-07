import { z } from "zod";
import {
  postSchema,
  postListSchema,
} from "@/models/resources/post/schema";

export const postFindAllInputSchema = z.object({
  limit: z.number().int().positive().optional(),
});

export const postFindAllOutputSchema = postListSchema;

export type PostFindAllInputPort = z.infer<typeof postFindAllInputSchema>;
export type PostFindAllOutputPort = z.infer<typeof postFindAllOutputSchema>;

export const postFindByIdInputSchema = z.object({
  id: z.number().int().positive(),
});

export const postFindByIdOutputSchema = postSchema;

export type PostFindByIdInputPort = z.infer<typeof postFindByIdInputSchema>;
export type PostFindByIdOutputPort = z.infer<typeof postFindByIdOutputSchema>;
