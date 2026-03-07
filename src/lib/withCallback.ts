import type { SubmissionResult } from '@conform-to/react';

type Callbacks<T, R = unknown> = {
  onStart?: () => R;
  onEnd?: (reference: R) => void;
  onSuccess?: (result: T) => void;
  onError?: (result: T) => void;
};

/**
 * conformのフォームアクションにコールバックを追加する高階関数
 */
export const withCallbacks = <
  Args extends unknown[],
  T extends SubmissionResult<string[]>,
  R = unknown,
>(
  fn: (...args: Args) => Promise<T>,
  callbacks: Callbacks<T, R>
) => {
  return async (...args: Args) => {
    const reference = callbacks.onStart?.();
    const result = await fn(...args);

    if (reference !== undefined) {
      callbacks.onEnd?.(reference);
    }

    if (result.status === 'success') {
      callbacks.onSuccess?.(result);
    }

    if (result.status === 'error') {
      callbacks.onError?.(result);
    }

    return result;
  };
};
