import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Simplify<T> = T extends any[] | Date
  ? T
  : { [K in keyof T]: T[K] } & {};

export const capitalizeOnlyFirstLetter = (word: string): string =>
  word.charAt(0).toUpperCase() + word.slice(1);
export function convertUndefinedToNull<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(convertUndefinedToNull) as unknown as T;
  }

  if (typeof obj === "object") {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc[key as keyof T] = convertUndefinedToNull(value);
      return acc;
    }, {} as T);
  }

  return obj === undefined ? (null as unknown as T) : obj;
}
