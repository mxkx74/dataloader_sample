import { http, HttpResponse } from "msw";
import type { User } from "./schema";

const mockUsers: User[] = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  name: `ユーザー ${index + 1}`,
  username: `user${index + 1}`,
  email: `user${index + 1}@example.com`,
}));

export const userHandlers = [
  http.get("https://jsonplaceholder.typicode.com/users", ({ request }) => {
    const url = new URL(request.url);
    const ids = url.searchParams
      .getAll("id")
      .map(Number)
      .filter((id) => !Number.isNaN(id));

    if (ids.length > 0) {
      const filtered = mockUsers.filter((user) => ids.includes(user.id));
      return HttpResponse.json(filtered);
    }

    return HttpResponse.json(mockUsers);
  }),
];
