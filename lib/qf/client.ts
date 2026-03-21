/**
 * Quran.Foundation Content API client (server-only).
 * Attaches OAuth token and x-client-id to all requests.
 */

import { getAccessToken, clearTokenCache } from "./oauth";

const DEFAULT_TIMEOUT_MS = 15_000;

const getBaseUrl = () =>
  process.env.QF_CONTENT_BASE_URL ?? "https://apis.quran.foundation";
const getContentPrefix = () => "/content/api/v4";

async function qfFetchInternal(
  path: string,
  init?: RequestInit,
  isRetry = false
): Promise<Response> {
  const token = await getAccessToken();
  const clientId = process.env.QF_CLIENT_ID ?? "";
  const base = getBaseUrl();
  const prefix = getContentPrefix();

  const url = path.startsWith("http")
    ? path
    : `${base}${prefix}${path.startsWith("/") ? path : `/${path}`}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    init?.signal ? 0 : DEFAULT_TIMEOUT_MS
  );

  const res = await fetch(url, {
    ...init,
    signal: init?.signal ?? controller.signal,
    headers: {
      "x-auth-token": token,
      "x-client-id": clientId,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  clearTimeout(timeoutId);

  if (res.status === 401 && !isRetry) {
    clearTokenCache();
    return qfFetchInternal(path, init, true);
  }

  return res;
}

export async function qfFetch(path: string, init?: RequestInit): Promise<Response> {
  return qfFetchInternal(path, init);
}

export async function qfFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await qfFetch(path, init);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`QF API error ${res.status}: ${errText.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}
