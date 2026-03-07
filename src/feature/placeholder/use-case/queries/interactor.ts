import type { Result } from "neverthrow";

import { findAllPlaceholders as findAllPlaceholdersClient } from "@/models/resources/placeholder/client";
import { withInteractorOption } from "@/lib/withInteractorOption";
import { safeAsync, safeParse } from "@/lib/neverThrowUtils";
import type { Errors } from "@/lib/errors";
import {
  placeholderFindAllInputSchema,
  placeholderFindAllOutputSchema,
  type PlaceholderFindAllInputPort,
  type PlaceholderFindAllOutputPort,
} from "./boundary";

const findAllPlaceholdersInteractor = async (
  input: PlaceholderFindAllInputPort,
): Promise<Result<PlaceholderFindAllOutputPort, Errors>> => {
  return safeParse(placeholderFindAllInputSchema, input)
    .asyncAndThen((parsed) =>
      safeAsync(findAllPlaceholdersClient({ limit: parsed.limit })),
    )
    .andThen(safeParse(placeholderFindAllOutputSchema));
};

export const findAllPlaceholders = withInteractorOption(
  findAllPlaceholdersInteractor,
);
