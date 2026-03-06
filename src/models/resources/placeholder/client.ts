import { fetcher } from "@/lib/fetcher";
import {
  placeholderListSchema,
  placeholderSchema,
  type PlaceholderFindAllParams,
  type PlaceholderFindByIdParams,
} from "./schema";
import type { ResultAsync } from "neverthrow";
import type { AppError } from "@/lib/errors";
import type { Placeholder, PlaceholderList } from "./schema";

const BASE_URL =
  process.env["NEXT_PUBLIC_API_BASE_URL"] ??
  "https://jsonplaceholder.typicode.com";

export const findAllPlaceholders = (
  params: PlaceholderFindAllParams = {}
): ResultAsync<PlaceholderList, AppError> => {
  const url = new URL(`${BASE_URL}/todos`);
  if (params.limit !== undefined) {
    url.searchParams.set("_limit", String(params.limit));
  }
  return fetcher(url.toString(), placeholderListSchema);
};

export const findPlaceholderById = (
  params: PlaceholderFindByIdParams
): ResultAsync<Placeholder, AppError> => {
  return fetcher(`${BASE_URL}/todos/${params.id}`, placeholderSchema);
};
