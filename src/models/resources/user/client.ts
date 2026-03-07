import { fetcher } from "@/lib/fetcher";
import { userListSchema, type UserFindManyByIdsParams } from "./schema";
import type { UserList } from "./schema";

const BASE_URL =
  process.env["NEXT_PUBLIC_API_BASE_URL"] ??
  "https://jsonplaceholder.typicode.com";

export const findManyUsersByIds = (
  params: UserFindManyByIdsParams,
): Promise<UserList> => {
  const url = new URL(`${BASE_URL}/users`);
  params.ids.forEach((id) => url.searchParams.append("id", String(id)));
  return fetcher<UserList>(url.toString(), {
    method: "GET",
    responseSchema: userListSchema,
  });
};
