import type { Result } from 'neverthrow';

type WithInteractorOptions<TResponse, TSelected = TResponse> = {
  throwOnError?: boolean;
  selector?: (data: TResponse) => TSelected;
};

/**
 * @description interactorにselector、throwOnErrorオプションを付与するHOF
 * @param interactor
 * @returns wrapped interactor
 */
export const withInteractorOption = <TInput, TResponse, TErrors>(
  interactor: (input: TInput) => PromiseLike<Result<TResponse, TErrors>>
) => {
  // throwOnError: trueの場合は値またはselectorの結果を返す
  function wrapped<TSelected = TResponse>(
    request: TInput,
    options: { throwOnError: true; selector?: (data: TResponse) => TSelected }
  ): Promise<TSelected extends TResponse ? TResponse : TSelected>;

  // throwOnError: false/未指定の場合はResultを返す
  function wrapped<TSelected = TResponse>(
    request: TInput,
    options?: { throwOnError?: false; selector?: (data: TResponse) => TSelected }
  ): Promise<Result<TSelected extends TResponse ? TResponse : TSelected, TErrors>>;

  // 実装
  async function wrapped<TSelected = TResponse>(
    request: TInput,
    options?: WithInteractorOptions<TResponse, TSelected>
  ) {
    const { throwOnError = false, selector } = options ?? {};
    const result = await interactor(request);

    if (result.isErr()) {
      if (throwOnError) {
        if (result.error instanceof Error) {
          throw result.error;
        }
        // Errorインスタンスでない場合はErrorでラップしてthrow
        throw new Error(String(result.error));
      }
      return result;
    }

    // result.isOk() の場合
    if (selector) {
      return throwOnError ? selector(result.value) : result.map(selector);
    }
    return throwOnError ? result.value : result;
  }

  return wrapped;
};
