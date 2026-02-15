import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Removes Arabic diacritics (harakat) so search works with or without tashkeel. */
export function stripArabicDiacritics(text: string): string {
  if (typeof text !== "string") return ""
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
}

/** Alef-like characters (آ أ إ ٱ) normalized to plain Alef (ا) for consistent search. */
const ARABIC_ALEF_LIKE = /[\u0622\u0623\u0625\u0671]/g
const ARABIC_ALEF = "\u0627"

/** Normalizes Arabic text for search: strip diacritics + unify Alef variants so "الف" matches "الفاتحة". */
export function normalizeArabicForSearch(text: string): string {
  if (typeof text !== "string") return ""
  return stripArabicDiacritics(text).replace(ARABIC_ALEF_LIKE, ARABIC_ALEF)
}
