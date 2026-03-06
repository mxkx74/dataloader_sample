import { Result, ResultAsync } from "neverthrow";
import { AppError } from "./errors";

type InteractorOptions = {
  throwOnError?: boolean;
};

type Interactor<TInput, TOutput> = (
  input: TInput
) => ResultAsync<TOutput, AppError> | Promise<Result<TOutput, AppError>>;

type InteractorWithOptions<TInput, TOutput> = (
  input: TInput,
  options?: InteractorOptions
) => Promise<Result<TOutput, AppError>>;

/**
 * Interactor を `throwOnError` オプションでラップする高階関数。
 *
 * - `throwOnError: false` (デフォルト): `Result` 型を返す
 * - `throwOnError: true`: エラー時に例外をスローする（Error Boundary 向け）
 *
 * @example
 * ```ts
 * export const findAllPlaceholders = withInteractorOption(findAllPlaceholdersInteractor);
 *
 * // Result として取得
 * const result = await findAllPlaceholders({ page: 1 });
 *
 * // throwOnError モード（Server Component で Suspense/ErrorBoundary と併用）
 * const data = await findAllPlaceholders({ page: 1 }, { throwOnError: true });
 * ```
 */
export const withInteractorOption = <TInput, TOutput>(
  interactor: Interactor<TInput, TOutput>
): InteractorWithOptions<TInput, TOutput> => {
  return async (input: TInput, options: InteractorOptions = {}) => {
    const { throwOnError = false } = options;
    const result = await interactor(input);
    if (throwOnError && result.isErr()) {
      throw result.error;
    }
    return result;
  };
};
