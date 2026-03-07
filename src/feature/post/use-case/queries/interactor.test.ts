import { describe, it, expect } from "vitest";
import { findAllPosts, findPostByIdWithLoader } from "./interactor";

describe("findAllPosts", () => {
  it("記事の一覧を取得できること", async () => {
    const result = await findAllPosts({});

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.length).toBeGreaterThan(0);
      expect(result.value[0]).toMatchObject({
        id: expect.any(Number),
        userId: expect.any(Number),
      });
    }
  });

  it("limit パラメータを指定しても取得できること", async () => {
    const result = await findAllPosts({ limit: 3 });

    expect(result.isOk()).toBe(true);
  });
});

describe("findPostByIdWithLoader", () => {
  it("DataLoader 経由で記事とユーザー情報を取得できること", async () => {
    const result = await findPostByIdWithLoader({ id: 1 });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toMatchObject({
        id: 1,
        title: expect.any(String),
        body: expect.any(String),
        userId: expect.any(Number),
        author: {
          id: expect.any(Number),
          name: expect.any(String),
        },
      });
    }
  });

  it("存在しない ID を指定するとエラーになること", async () => {
    const result = await findPostByIdWithLoader({ id: 999 });

    expect(result.isErr()).toBe(true);
  });
});
