import { z } from "zod";
import { placeholderListSchema } from "@/models/resources/placeholder/schema";

export const placeholderFindAllInputSchema = z.object({
  limit: z.number().int().positive().optional(),
});

export const placeholderFindAllOutputSchema = placeholderListSchema;

export type PlaceholderFindAllInputPort = z.infer<
  typeof placeholderFindAllInputSchema
>;

export type PlaceholderFindAllOutputPort = z.infer<
  typeof placeholderFindAllOutputSchema
>;
