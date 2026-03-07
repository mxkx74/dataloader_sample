import { err, ok } from 'neverthrow';
import { describe, expect, it } from 'vitest';

import { withInteractorOption } from './withInteractorOption';

describe('withInteractorOption', () => {
  type UserInput = {
    userId: number;
  };

  // テスト用の成功するinteractor
  const successInteractor = async (input: UserInput) => {
    await Promise.resolve();
    return ok({
      id: input.userId,
      name: 'Test User',
      email: 'test@example.com',
    });
  };

  // テスト用の失敗するinteractor
  const errorInteractor = async (_input: UserInput) => {
    await Promise.resolve();
    return err(new Error('User not found'));
  };

  // テスト用のエラー文字列を返すinteractor
  const stringErrorInteractor = async (_input: UserInput) => {
    await Promise.resolve();
    return err('String error message');
  };

  describe('基本動作 - throwOnError未指定またはfalse', () => {
    it('成功時はResultを返す', async () => {
      const wrapped = withInteractorOption(successInteractor);
      const result = await wrapped({ userId: 1 });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual({
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        });
      }
    });

    it('失敗時はResultのエラーを返す', async () => {
      const wrapped = withInteractorOption(errorInteractor);
      const result = await wrapped({ userId: 1 });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.message).toBe('User not found');
      }
    });
  });

  describe('selectorオプション', () => {
    it('selectorオプションでデータを変換できる', async () => {
      const wrapped = withInteractorOption(successInteractor);
      const result = await wrapped(
        { userId: 1 },
        {
          selector: (user) => user.name,
        }
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Test User');
      }
    });
  });

  describe('throwOnErrorオプション', () => {
    it('throwOnError: trueの場合、成功時は値を直接返す', async () => {
      const wrapped = withInteractorOption(successInteractor);
      const result = await wrapped({ userId: 1 }, { throwOnError: true });

      expect(result).toEqual({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      });
    });

    it('throwOnError: trueの場合、エラー時は例外をthrowする', async () => {
      const wrapped = withInteractorOption(errorInteractor);

      await expect(wrapped({ userId: 1 }, { throwOnError: true })).rejects.toThrow(
        'User not found'
      );
    });

    it('throwOnError: trueの場合、Error以外のエラーはErrorでラップしてthrowする', async () => {
      const wrapped = withInteractorOption(stringErrorInteractor);

      await expect(wrapped({ userId: 1 }, { throwOnError: true })).rejects.toThrow(
        'String error message'
      );
    });

    it('throwOnError: falseの場合、成功時はResultを返す', async () => {
      const wrapped = withInteractorOption(successInteractor);
      const result = await wrapped({ userId: 1 }, { throwOnError: false });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual({
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        });
      }
    });

    it('throwOnError: falseの場合、エラー時はResultのエラーを返す', async () => {
      const wrapped = withInteractorOption(errorInteractor);
      const result = await wrapped({ userId: 1 }, { throwOnError: false });

      expect(result.isErr()).toBe(true);
    });
  });

  describe('selectorとthrowOnErrorの組み合わせ', () => {
    it('throwOnError: trueかつselectorを使用した場合、変換後の値を直接返す', async () => {
      const wrapped = withInteractorOption(successInteractor);
      const result = await wrapped(
        { userId: 1 },
        {
          throwOnError: true,
          selector: (user) => user.name,
        }
      );

      expect(typeof result).toBe('string');
      expect(result).toBe('Test User');
    });

    it('throwOnError: falseかつselectorを使用した場合、変換後の値のResultを返す', async () => {
      const wrapped = withInteractorOption(successInteractor);
      const result = await wrapped(
        { userId: 1 },
        {
          throwOnError: false,
          selector: (user) => user.name,
        }
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Test User');
      }
    });
  });

  describe('オプションなし', () => {
    it('オプションを渡さない場合は元のResultをそのまま返す', async () => {
      const wrapped = withInteractorOption(successInteractor);
      const result = await wrapped({ userId: 1 });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual({
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        });
      }
    });
  });
});
