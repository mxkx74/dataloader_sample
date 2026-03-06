import DataLoader from "dataloader";
import { cache } from "react";

/**
 * React の cache を利用して、1リクエストにつき1インスタンスを保証する DataLoader ゲッターを生成する。
 *
 * `createDataLoaderFactory` を呼び出すことで、返された関数を呼び出すたびに
 * 同一リクエスト内では同一の DataLoader インスタンスが返される。
 *
 * @example
 * ```ts
 * export const getPlaceholderLoader = createDataLoaderFactory(
 *   async (ids) => {
 *     const results = await fetchPlaceholders(ids as number[]);
 *     return ids.map((id) => results.find((r) => r.id === id) ?? new Error(`Not found: ${id}`));
 *   }
 * );
 *
 * // 同一リクエスト内では同一インスタンスが返される
 * const loader = getPlaceholderLoader();
 * const item = await loader.load(1);
 * ```
 */
export const createDataLoaderFactory = <K, V>(
  batchFn: DataLoader.BatchLoadFn<K, V>,
  options?: DataLoader.Options<K, V>
): (() => DataLoader<K, V>) => {
  return cache(
    () =>
      new DataLoader<K, V>(batchFn, {
        cache: true,
        ...options,
      })
  );
};
