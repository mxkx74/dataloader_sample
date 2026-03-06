import { describe, it, expect } from "vitest";
import { findAllPlaceholders } from "./interactor";

describe("findAllPlaceholders", () => {
  it("プレースホルダーの一覧を取得できること", async () => {
    const result = await findAllPlaceholders({});

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.length).toBeGreaterThan(0);
      expect(result.value[0]).toMatchObject({
        id: expect.any(Number),
        title: expect.any(String),
        completed: expect.any(Boolean),
        userId: expect.any(Number),
      });
    }
  });

  it("limit パラメータを指定しても取得できること", async () => {
    const result = await findAllPlaceholders({ limit: 3 });

    expect(result.isOk()).toBe(true);
  });
});
