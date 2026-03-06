import { describe, expect, it } from 'vitest';

import { buildQueryString } from './buildQueryString';

describe('buildQueryString', () => {
  it('オブジェクトからクエリ文字列を構築する', () => {
    const params = { name: 'test', page: 1, active: true };
    expect(buildQueryString(params)).toBe('name=test&page=1&active=true');
  });

  it('null と undefined の値を除外する', () => {
    const params = { key1: 'value1', key2: null, key3: undefined, key4: 'value4' };
    expect(buildQueryString(params)).toBe('key1=value1&key4=value4');
  });

  it('0, false, 空文字列は含める', () => {
    const params = { count: 0, active: false, text: '' };
    expect(buildQueryString(params)).toBe('count=0&active=false&text=');
  });

  it('空オブジェクトや無効な値の場合は空文字列を返す', () => {
    expect(buildQueryString({})).toBe('');
    expect(buildQueryString(null)).toBe('');
    expect(buildQueryString(undefined)).toBe('');
  });

  it('特殊文字を正しくエンコードする', () => {
    const params = { query: 'hello world', url: 'https://example.com' };
    expect(buildQueryString(params)).toBe('query=hello+world&url=https%3A%2F%2Fexample.com');
  });
});

describe('buildQueryString - 未実装の機能', () => {
  it('ネストされたオブジェクトは [object Object] として文字列化される', () => {
    const params = { user: { name: 'test' } };
    expect(buildQueryString(params)).toBe('user=%5Bobject+Object%5D');
  });

  it('配列はカンマ区切り文字列になる', () => {
    const params = { tags: ['tag1', 'tag2', 'tag3'] };
    expect(buildQueryString(params)).toBe('tags=tag1%2Ctag2%2Ctag3');
  });
});
