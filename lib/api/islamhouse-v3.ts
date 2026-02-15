/**
 * IslamHouse API v3 client.
 * Base: https://api3.islamhouse.com/v3/{KEY}
 * All endpoints GET, path-based (showall, page/perPage in path), end with /json.
 */
import { cachedFetch } from "./client";

const KEY = process.env.NEXT_PUBLIC_ISLAMHOUSE_API_KEY || "paV29H2gm56kvLPy";
const BASE = `https://api3.islamhouse.com/v3/${KEY}`;

const CATEGORY_TTL = 30 * 60 * 1000;
const AUTHOR_TTL = 30 * 60 * 1000;
const ITEM_TTL = 10 * 60 * 1000;
const HOME_TTL = 5 * 60 * 1000;

// --- Categories ---

export function getCategoriesTree(uiLang: string) {
  return cachedFetch<unknown>(`${BASE}/main/get-categories-tree/${uiLang}/json`, CATEGORY_TTL);
}

export function getSubCategories(categoryId: string | number, uiLang: string) {
  return cachedFetch<unknown>(
    `${BASE}/main/get-sub-categories/${categoryId}/${uiLang}/json`,
    CATEGORY_TTL
  );
}

export function getCategoryTypesAvailable(categoryId: string | number, uiLang: string) {
  return cachedFetch<unknown>(
    `${BASE}/main/get-categroy-types-avaliable/${categoryId}/${uiLang}/showall/json`,
    CATEGORY_TTL
  );
}

export function getCategorySourceLanguages(categoryId: string | number, uiLang: string) {
  return cachedFetch<unknown>(
    `${BASE}/main/get-category-source-languages/${categoryId}/showall/${uiLang}/json`,
    CATEGORY_TTL
  );
}

export function getCategoryItems(
  categoryId: string | number,
  uiLang: string,
  page: number,
  perPage: number
) {
  return cachedFetch<unknown>(
    `${BASE}/main/get-category-items/${categoryId}/showall/${uiLang}/showall/${page}/${perPage}/json`,
    CATEGORY_TTL
  );
}

// --- Authors ---

export function getAuthors(uiLang: string, page: number, perPage: number) {
  return cachedFetch<unknown>(
    `${BASE}/mainsite/get-authors-data/author/showall/countdesc/${uiLang}/${page}/${perPage}/json`,
    AUTHOR_TTL
  );
}

export function getAuthor(authorId: string | number, uiLang: string) {
  return cachedFetch<unknown>(`${BASE}/main/get-author/${authorId}/${uiLang}/json`, AUTHOR_TTL);
}

export function getAuthorTypesAvailable(authorId: string | number, uiLang: string) {
  return cachedFetch<unknown>(
    `${BASE}/main/get-author-types-avaliable/${authorId}/${uiLang}/showall/json`,
    AUTHOR_TTL
  );
}

export function getAuthorItems(
  authorId: string | number,
  type: string,
  uiLang: string,
  page: number,
  perPage: number
) {
  return cachedFetch<unknown>(
    `${BASE}/main/get-author-items/${authorId}/${type}/${uiLang}/showall/${page}/${perPage}/json`,
    AUTHOR_TTL
  );
}

// --- Items ---

export function checkItem(itemId: string | number) {
  return cachedFetch<unknown>(`${BASE}/main/check-item/${itemId}/json`, ITEM_TTL);
}

export function getItem(itemId: string | number, uiLang: string) {
  return cachedFetch<unknown>(`${BASE}/main/get-item/${itemId}/${uiLang}/json`, ITEM_TTL);
}

export function getItemTranslations(itemId: string | number, uiLang: string) {
  return cachedFetch<unknown>(
    `${BASE}/main/get-item-translations/${itemId}/${uiLang}/json`,
    ITEM_TTL
  );
}

export function getItemRelated(itemId: string | number) {
  return cachedFetch<unknown>(`${BASE}/main/get-item-related/${itemId}/json`, ITEM_TTL);
}

export function getItemSeeAlso(itemId: string | number) {
  return cachedFetch<unknown>(`${BASE}/main/get-item-see-also/${itemId}/json`, ITEM_TTL);
}

export function getItemTree(itemId: string | number, uiLang: string) {
  return cachedFetch<unknown>(`${BASE}/main/get-item-tree/${itemId}/${uiLang}/json`, ITEM_TTL);
}

// --- Site helpers ---

export function getHome() {
  return cachedFetch<unknown>(`${BASE}/main/home/json`, HOME_TTL);
}

export function getAvailableLanguagesForQuran(uiLang: string) {
  return cachedFetch<unknown>(
    `${BASE}/main/get-available-languages/quran/${uiLang}/json`,
    HOME_TTL
  );
}

export function getLatestUpdated(uiLang: string, sourceLang: string) {
  return cachedFetch<unknown>(
    `${BASE}/main/latestupdated/showall/${uiLang}/${sourceLang}/8/json`,
    HOME_TTL
  );
}
