import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

/**
 * 提供年月をフォーマットする関数
 */
export function formatProvidedIn(providedIn: string) {
  if (providedIn?.length !== 6) return providedIn;
  return `${providedIn.slice(0, 4)}年${providedIn.slice(4)}月`;
}

/**
 * yyyyMM形式を判定する関数
 */
export function isValidYearMonth(yearMonth: string) {
  return /^\d{4}(0[1-9]|1[0-2])$/.test(yearMonth);
}

/**
 * 半角数字以外の文字を削除する関数
 */
export function sanitizeToNumeric(value: string) {
  return value.replace(/[^0-9]/g, "");
}
