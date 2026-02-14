/**
 * Server-only authenticated client for Quran.Foundation Content API.
 * All requests include x-auth-token and x-client-id. On 401, token is cleared and retried once.
 */

import { getQFConfig } from "./config";
import { getAccessToken, clearToken } from "./token";

export class QFApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public url: string
  ) {
    super(message);
    this.name = "QFApiError";
  }
}

export async function qfRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const config = getQFConfig();
  const token = await getAccessToken();
  const url = path.startsWith("http") ? path : `${config.apiBaseUrl}${path}`;

  const headers: HeadersInit = {
    "x-auth-token": token,
    "x-client-id": config.clientId,
    ...options.headers,
  };

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    const newToken = await getAccessToken();
    res = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        "x-auth-token": newToken,
      },
    });
    if (!res.ok) {
      throw new QFApiError(
        `QF API error: ${res.status} ${res.statusText}`,
        res.status,
        url
      );
    }
    return res.json() as Promise<T>;
  }

  if (res.status === 429) {
    const retryAfter = res.headers.get("Retry-After");
    const delayMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 2000;
    await new Promise((r) => setTimeout(r, Math.min(delayMs, 10000)));
    res = await fetch(url, { ...options, headers });
    if (res.status === 429) {
      throw new QFApiError(
        "Rate limit exceeded. Try again later.",
        429,
        url
      );
    }
  }

  if (!res.ok) {
    throw new QFApiError(
      `QF API error: ${res.status} ${res.statusText}`,
      res.status,
      url
    );
  }

  return res.json() as Promise<T>;
}
