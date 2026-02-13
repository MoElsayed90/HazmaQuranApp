/**
 * Typed HTTP client with retry, timeout, and error handling.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public url?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

const DEFAULT_TIMEOUT = 10000; // 10 seconds
const DEFAULT_RETRIES = 1;

/**
 * Enhanced fetch with timeout, retries, and error handling.
 */
export async function apiFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          url
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on client errors (4xx)
      if (error instanceof ApiError && error.status && error.status < 500) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 500)
        );
      }
    }
  }

  throw lastError || new ApiError("Request failed", undefined, url);
}

// Simple in-memory cache
const cache = new Map<string, { data: unknown; expiry: number }>();

export async function cachedFetch<T>(
  url: string,
  ttlMs: number = 5 * 60 * 1000, // 5 minutes default
  options: FetchOptions = {}
): Promise<T> {
  const cached = cache.get(url);
  if (cached && cached.expiry > Date.now()) {
    return cached.data as T;
  }

  const data = await apiFetch<T>(url, options);
  cache.set(url, { data, expiry: Date.now() + ttlMs });
  return data;
}

export function clearCache() {
  cache.clear();
}
