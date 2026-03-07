import type { SubmissionResult } from '@conform-to/react';

import { describe, expect, it, vi } from 'vitest';

import { withCallbacks } from './withCallback';

type TestResult = SubmissionResult<string[]>;

const createSuccessResult = (): TestResult => ({
  status: 'success',
  initialValue: {},
});

const createErrorResult = (): TestResult => ({
  status: 'error',
  error: { field: ['エラーメッセージ'] },
  initialValue: {},
});

describe('withCallbacks', () => {
  describe('基本動作', () => {
    it('元の関数の結果をそのまま返す', async () => {
      const expectedResult = createSuccessResult();
      const fn = vi.fn().mockResolvedValue(expectedResult);

      const wrappedFn = withCallbacks(fn, {});
      const result = await wrappedFn('arg1', 'arg2');

      expect(result).toEqual(expectedResult);
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('引数を元の関数に正しく渡す', async () => {
      const fn = vi.fn().mockResolvedValue(createSuccessResult());

      const wrappedFn = withCallbacks(fn, {});
      await wrappedFn('a', 123, { key: 'value' });

      expect(fn).toHaveBeenCalledWith('a', 123, { key: 'value' });
    });
  });

  describe('onStartコールバック', () => {
    it('関数実行前にonStartが呼ばれる', async () => {
      const callOrder: string[] = [];
      const fn = vi.fn().mockImplementation(() => {
        callOrder.push('fn');
        return createSuccessResult();
      });
      const onStart = vi.fn().mockImplementation(() => {
        callOrder.push('onStart');
      });

      const wrappedFn = withCallbacks(fn, { onStart });
      await wrappedFn();

      expect(onStart).toHaveBeenCalledTimes(1);
      expect(callOrder).toEqual(['onStart', 'fn']);
    });
  });

  describe('onEndコールバック', () => {
    it('onStartの戻り値がある場合、onEndが呼ばれる', async () => {
      const fn = vi.fn().mockResolvedValue(createSuccessResult());
      const reference = { id: 'toast-123' };
      const onStart = vi.fn().mockReturnValue(reference);
      const onEnd = vi.fn();

      const wrappedFn = withCallbacks(fn, { onStart, onEnd });
      await wrappedFn();

      expect(onEnd).toHaveBeenCalledTimes(1);
      expect(onEnd).toHaveBeenCalledWith(reference);
    });

    it('onStartの戻り値がfalsyの場合、onEndは呼ばれない', async () => {
      const fn = vi.fn().mockResolvedValue(createSuccessResult());
      const onStart = vi.fn().mockReturnValue(undefined);
      const onEnd = vi.fn();

      const wrappedFn = withCallbacks(fn, { onStart, onEnd });
      await wrappedFn();

      expect(onEnd).not.toHaveBeenCalled();
    });

    it('onStartが0を返した場合、onEndは呼ばれる（undefinedでないため）', async () => {
      const fn = vi.fn().mockResolvedValue(createSuccessResult());
      const onStart = vi.fn().mockReturnValue(0);
      const onEnd = vi.fn();

      const wrappedFn = withCallbacks(fn, { onStart, onEnd });
      await wrappedFn();

      expect(onEnd).toHaveBeenCalledWith(0);
    });

    it('onEnd は関数実行後に呼ばれる', async () => {
      const callOrder: string[] = [];
      const fn = vi.fn().mockImplementation(() => {
        callOrder.push('fn');
        return createSuccessResult();
      });
      const onStart = vi.fn().mockImplementation(() => {
        callOrder.push('onStart');
        return 'reference';
      });
      const onEnd = vi.fn().mockImplementation(() => {
        callOrder.push('onEnd');
      });

      const wrappedFn = withCallbacks(fn, { onStart, onEnd });
      await wrappedFn();

      expect(callOrder).toEqual(['onStart', 'fn', 'onEnd']);
    });
  });

  describe('onSuccessコールバック', () => {
    it('statusがsuccessの場合、onSuccessが呼ばれる', async () => {
      const successResult = createSuccessResult();
      const fn = vi.fn().mockResolvedValue(successResult);
      const onSuccess = vi.fn();

      const wrappedFn = withCallbacks(fn, { onSuccess });
      await wrappedFn();

      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledWith(successResult);
    });

    it('statusがerrorの場合、onSuccessは呼ばれない', async () => {
      const fn = vi.fn().mockResolvedValue(createErrorResult());
      const onSuccess = vi.fn();

      const wrappedFn = withCallbacks(fn, { onSuccess });
      await wrappedFn();

      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('onErrorコールバック', () => {
    it('statusがerrorの場合、onErrorが呼ばれる', async () => {
      const errorResult = createErrorResult();
      const fn = vi.fn().mockResolvedValue(errorResult);
      const onError = vi.fn();

      const wrappedFn = withCallbacks(fn, { onError });
      await wrappedFn();

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(errorResult);
    });

    it('statusがsuccessの場合、onErrorは呼ばれない', async () => {
      const fn = vi.fn().mockResolvedValue(createSuccessResult());
      const onError = vi.fn();

      const wrappedFn = withCallbacks(fn, { onError });
      await wrappedFn();

      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('コールバックの組み合わせ', () => {
    it('成功時: onStart -> fn -> onEnd -> onSuccess の順で呼ばれる', async () => {
      const callOrder: string[] = [];
      const fn = vi.fn().mockImplementation(() => {
        callOrder.push('fn');
        return createSuccessResult();
      });

      const wrappedFn = withCallbacks(fn, {
        onStart: () => {
          callOrder.push('onStart');
          return 'ref';
        },
        onEnd: () => callOrder.push('onEnd'),
        onSuccess: () => callOrder.push('onSuccess'),
        onError: () => callOrder.push('onError'),
      });

      await wrappedFn();

      expect(callOrder).toEqual(['onStart', 'fn', 'onEnd', 'onSuccess']);
    });

    it('失敗時: onStart -> fn -> onEnd -> onError の順で呼ばれる', async () => {
      const callOrder: string[] = [];
      const fn = vi.fn().mockImplementation(() => {
        callOrder.push('fn');
        return createErrorResult();
      });

      const wrappedFn = withCallbacks(fn, {
        onStart: () => {
          callOrder.push('onStart');
          return 'ref';
        },
        onEnd: () => callOrder.push('onEnd'),
        onSuccess: () => callOrder.push('onSuccess'),
        onError: () => callOrder.push('onError'),
      });

      await wrappedFn();

      expect(callOrder).toEqual(['onStart', 'fn', 'onEnd', 'onError']);
    });

    it('コールバックを全て省略しても動作する', async () => {
      const expectedResult = createSuccessResult();
      const fn = vi.fn().mockResolvedValue(expectedResult);

      const wrappedFn = withCallbacks(fn, {});
      const result = await wrappedFn();

      expect(result).toEqual(expectedResult);
    });
  });

  describe('型推論', () => {
    it('onStartの戻り値の型がonEndに渡される', async () => {
      const fn = vi.fn().mockResolvedValue(createSuccessResult());
      const toastId = 'toast-123';

      const wrappedFn = withCallbacks(fn, {
        onStart: () => toastId,
        onEnd: (reference) => {
          expect(typeof reference).toBe('string');
          expect(reference).toBe(toastId);
        },
      });

      await wrappedFn();
    });
  });
});
