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
