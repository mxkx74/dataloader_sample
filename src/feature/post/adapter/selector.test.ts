import { describe, it, expect } from "vitest";
import { selectPostListItems, selectPostCardItem } from "./selector";

describe("selectPostListItems", () => {
  it("Post リストを PostListItem に変換できること", () => {
    const input = [
      { userId: 1, id: 1, title: "タイトル 1", body: "本文 1" },
      { userId: 2, id: 2, title: "タイトル 2", body: "本文 2" },
    ];

    const result = selectPostListItems(input);

    expect(result).toEqual([
      { id: 1, title: "タイトル 1", userId: 1 },
      { id: 2, title: "タイトル 2", userId: 2 },
    ]);
  });

  it("空の配列を渡すと空の配列を返すこと", () => {
    const result = selectPostListItems([]);
    expect(result).toEqual([]);
  });
});

describe("selectPostCardItem", () => {
  it("Post を PostCardItem に変換できること", () => {
    const input = { userId: 1, id: 1, title: "タイトル 1", body: "本文 1" };

    const result = selectPostCardItem(input);

    expect(result).toEqual({
      id: 1,
      title: "タイトル 1",
      body: "本文 1",
      userId: 1,
    });
  });
});
