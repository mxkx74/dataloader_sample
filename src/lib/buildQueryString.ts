// ネストされたオブジェクトや配列の特殊な処理は未実装
export function buildQueryString(params: unknown): string {
  if (!params || typeof params !== 'object') return '';

  // undefined/null の値を持つプロパティを除外
  const entries = Object.entries(params)
    .filter(([, value]) => value != null)
    .map(([key, value]) => [key, String(value)]);

  return new URLSearchParams(entries).toString();
}
