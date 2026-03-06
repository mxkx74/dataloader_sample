import { describe, expect, it } from 'vitest';

import { formatProvidedIn, isValidYearMonth, sanitizeToNumeric } from './utils';

describe('formatProvidedIn', () => {
  it('yyyyMM形式の文字列を「yyyy年MM月」にフォーマットする', () => {
    expect(formatProvidedIn('202601')).toBe('2026年01月');
    expect(formatProvidedIn('202512')).toBe('2025年12月');
  });

  it('6文字でない文字列はそのまま返す', () => {
    expect(formatProvidedIn('2026')).toBe('2026');
    expect(formatProvidedIn('20260')).toBe('20260');
    expect(formatProvidedIn('2026013')).toBe('2026013');
  });

  it('空文字列や不正な形式はそのまま返す', () => {
    expect(formatProvidedIn('')).toBe('');
  });
});

describe('isValidYearMonth', () => {
  it('有効なyyyyMM形式を判定できる', () => {
    expect(isValidYearMonth('202601')).toBe(true);
    expect(isValidYearMonth('202512')).toBe(true);
    expect(isValidYearMonth('200001')).toBe(true);
    expect(isValidYearMonth('999912')).toBe(true);
  });

  it('月が01～12の範囲内である必要がある', () => {
    expect(isValidYearMonth('202600')).toBe(false);
    expect(isValidYearMonth('202613')).toBe(false);
    expect(isValidYearMonth('202699')).toBe(false);
  });

  it('6文字でない形式は無効', () => {
    expect(isValidYearMonth('2026')).toBe(false);
    expect(isValidYearMonth('20260')).toBe(false);
    expect(isValidYearMonth('2026013')).toBe(false);
  });

  it('数字以外を含む形式は無効', () => {
    expect(isValidYearMonth('202a01')).toBe(false);
    expect(isValidYearMonth('2026-01')).toBe(false);
    expect(isValidYearMonth('2026/01')).toBe(false);
  });

  it('空文字列は無効', () => {
    expect(isValidYearMonth('')).toBe(false);
  });
});

describe('sanitizeToNumeric', () => {
  it('半角数字以外を削除する', () => {
    expect(sanitizeToNumeric('202-601')).toBe('202601');
    expect(sanitizeToNumeric('2026/01')).toBe('202601');
    expect(sanitizeToNumeric('2026年01月')).toBe('202601');
  });

  it('半角数字のみの場合はそのまま返す', () => {
    expect(sanitizeToNumeric('202601')).toBe('202601');
    expect(sanitizeToNumeric('123456')).toBe('123456');
  });

  it('空文字列を渡すと空文字列を返す', () => {
    expect(sanitizeToNumeric('')).toBe('');
  });

  it('数字以外のみの場合は空文字列を返す', () => {
    expect(sanitizeToNumeric('年月')).toBe('');
    expect(sanitizeToNumeric('-/')).toBe('');
  });
});
