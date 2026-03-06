import { describe, it, expect } from "vitest";
import { selectPlaceholderRows } from "./selector";

describe("selectPlaceholderRows", () => {
  it("Placeholder リストを PlaceholderRow に変換できること", () => {
    const input = [
      { userId: 1, id: 1, title: "テストタスク", completed: false },
      { userId: 1, id: 2, title: "完了タスク", completed: true },
    ];

    const result = selectPlaceholderRows(input);

    expect(result).toEqual([
      { id: 1, title: "テストタスク", completed: false, userId: 1 },
      { id: 2, title: "完了タスク", completed: true, userId: 1 },
    ]);
  });

  it("空の配列を渡すと空の配列を返すこと", () => {
    const result = selectPlaceholderRows([]);
    expect(result).toEqual([]);
  });
});
