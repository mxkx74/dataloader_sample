import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { findAllPlaceholders as findAllPlaceholdersClient } from "@/models/resources/placeholder/client";
import { safeAsync } from "@/lib/neverThrowUtils";
import { withInteractorOption } from "@/lib/withInteractorOption";
import {
  placeholderFindAllInputSchema,
  placeholderFindAllOutputSchema,
  type PlaceholderFindAllInputPort,
  type PlaceholderFindAllOutputPort,
} from "./boundary";
import { AppError, createValidationError } from "@/lib/errors";

const findAllPlaceholdersInteractor = (
  input: PlaceholderFindAllInputPort
): ResultAsync<PlaceholderFindAllOutputPort, AppError> => {
  const parsed = placeholderFindAllInputSchema.safeParse(input);
  if (!parsed.success) {
    return errAsync(createValidationError(parsed.error.message));
  }

  return safeAsync(findAllPlaceholdersClient({ limit: parsed.data.limit })).andThen(
    (data) => {
      const outputParsed = placeholderFindAllOutputSchema.safeParse(data);
      if (!outputParsed.success) {
        return errAsync(createValidationError(outputParsed.error.message));
      }
      return okAsync(outputParsed.data);
    }
  );
};

export const findAllPlaceholders = withInteractorOption(
  findAllPlaceholdersInteractor
);
