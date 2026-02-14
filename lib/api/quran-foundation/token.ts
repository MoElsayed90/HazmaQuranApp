/**
 * Server-only OAuth2 token for Quran.Foundation API.
 * Cache with expiry buffer; clear on 401 so caller can retry.
 */

import { getQFConfig } from "./config";

const EXPIRY_BUFFER_MS = 60 * 1000; // refresh 60s before expiry per spec

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

let cached: CachedToken | null = null;
let inFlight: Promise<string> | null = null;

export function clearToken(): void {
  cached = null;
}

export async function getAccessToken(): Promise<string> {
  const config = getQFConfig();
  const now = Date.now();

  if (cached && cached.expiresAt > now + EXPIRY_BUFFER_MS) {
    return cached.accessToken;
  }

  if (inFlight) {
    return inFlight;
  }

  inFlight = (async () => {
    try {
      const url = `${config.authBaseUrl}/oauth2/token`;
      const body = new URLSearchParams({
        grant_type: "client_credentials",
        scope: "content",
      }).toString();
      const auth = Buffer.from(
        `${config.clientId}:${config.clientSecret}`,
        "utf-8"
      ).toString("base64");

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${auth}`,
        },
        body,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`QF token failed: ${res.status} ${text}`);
      }

      const data = (await res.json()) as {
        access_token: string;
        expires_in: number;
      };

      cached = {
        accessToken: data.access_token,
        expiresAt: now + (data.expires_in ?? 3600) * 1000,
      };
      return cached.accessToken;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}
