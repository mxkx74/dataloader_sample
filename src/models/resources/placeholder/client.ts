import {
  placeholderListSchema,
  placeholderSchema,
  type Placeholder,
  type PlaceholderFindAllParams,
  type PlaceholderFindByIdParams,
} from "./schema";

const BASE_URL = "https://jsonplaceholder.typicode.com";

export const findAllPlaceholders = async (
  params: PlaceholderFindAllParams = {}
): Promise<Placeholder[]> => {
  const url = new URL(`${BASE_URL}/todos`);
  if (params.limit !== undefined) {
    url.searchParams.set("_limit", String(params.limit));
  }
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch placeholders: ${response.status}`);
  }
  const json: unknown = await response.json();
  return placeholderListSchema.parse(json);
};

export const findPlaceholderById = async (
  params: PlaceholderFindByIdParams
): Promise<Placeholder> => {
  const response = await fetch(`${BASE_URL}/todos/${params.id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch placeholder ${params.id}: ${response.status}`);
  }
  const json: unknown = await response.json();
  return placeholderSchema.parse(json);
};
