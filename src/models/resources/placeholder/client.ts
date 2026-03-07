import { fetcher } from "@/lib/fetcher";
import {
  placeholderListSchema,
  placeholderSchema,
  type PlaceholderFindAllParams,
  type PlaceholderFindByIdParams,
} from "./schema";
import type { Placeholder, PlaceholderList } from "./schema";

const BASE_URL =
  process.env["NEXT_PUBLIC_API_BASE_URL"] ??
  "https://jsonplaceholder.typicode.com";

export const findAllPlaceholders = (
  params: PlaceholderFindAllParams = {},
): Promise<PlaceholderList> => {
  const url = new URL(`${BASE_URL}/todos`);
  if (params.limit !== undefined) {
    url.searchParams.set("_limit", String(params.limit));
  }
  return fetcher<PlaceholderList>(url.toString(), {
    method: "GET",
    responseSchema: placeholderListSchema,
  });
};

export const findPlaceholderById = (
  params: PlaceholderFindByIdParams,
): Promise<Placeholder> => {
  return fetcher<Placeholder>(`${BASE_URL}/todos/${params.id}`, {
    method: "GET",
    responseSchema: placeholderSchema,
  });
};
