import { http, HttpResponse } from "msw";
import type { Placeholder } from "./schema";

const mockPlaceholders: Placeholder[] = Array.from({ length: 5 }, (_, index) => ({
  userId: 1,
  id: index + 1,
  title: `プレースホルダーのタスク ${index + 1}`,
  completed: index % 2 === 0,
}));

export const placeholderHandlers = [
  http.get("https://jsonplaceholder.typicode.com/todos", () => {
    return HttpResponse.json(mockPlaceholders);
  }),

  http.get("https://jsonplaceholder.typicode.com/todos/:id", ({ params }) => {
    const id = Number(params["id"]);
    const placeholder = mockPlaceholders.find((item) => item.id === id);
    if (!placeholder) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
    return HttpResponse.json(placeholder);
  }),
];
