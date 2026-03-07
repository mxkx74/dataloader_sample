import { http, HttpResponse } from "msw";
import type { Post } from "./schema";

const mockPosts: Post[] = Array.from({ length: 10 }, (_, index) => ({
  userId: 1,
  id: index + 1,
  title: `記事タイトル ${index + 1}`,
  body: `記事本文 ${index + 1}。これはサンプルの記事内容です。DataLoader によりバッチ取得されています。`,
}));

export const postHandlers = [
  http.get("https://jsonplaceholder.typicode.com/posts", ({ request }) => {
    const url = new URL(request.url);
    const ids = url.searchParams
      .getAll("id")
      .map(Number)
      .filter((id) => !Number.isNaN(id));

    if (ids.length > 0) {
      const filtered = mockPosts.filter((post) => ids.includes(post.id));
      return HttpResponse.json(filtered);
    }

    const limitParam = url.searchParams.get("_limit");
    const posts =
      limitParam !== null
        ? mockPosts.slice(0, Number(limitParam))
        : mockPosts;
    return HttpResponse.json(posts);
  }),
];
