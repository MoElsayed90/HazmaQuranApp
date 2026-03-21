/**
 * Quran.Foundation OAuth2 Client Credentials helper (server-only).
 * Never import from client components.
 */

let cached: { token: string; expiresAt: number } | null = null;
let pending: Promise<string> | null = null;

const BUFFER_MS = 60_000; // Refresh 60 seconds before expiry

async function fetchNewToken(): Promise<string> {
  const base = process.env.QF_OAUTH_BASE_URL;
  const clientId = process.env.QF_CLIENT_ID;
  const clientSecret = process.env.QF_CLIENT_SECRET;

  if (!clientId || !clientSecret || !base) {
    throw new Error(
      "Missing Quran Foundation API credentials. Request access: https://api-docs.quran.foundation/request-access"
    );
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "content",
  });

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${base}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: body.toString(),
    credentials: "omit",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[QF OAuth] Token request failed:", res.status, text.slice(0, 150));
    throw new Error("Failed to obtain access token from Quran Foundation OAuth2");
  }

  const data = (await res.json()) as { access_token: string; expires_in?: number };
  const token = data.access_token;
  const expiresIn = data.expires_in ?? 3600;
  cached = {
    token,
    expiresAt: Date.now() + expiresIn * 1000,
  };
  return token;
}

export async function getAccessToken(): Promise<string> {
  if (cached && Date.now() < cached.expiresAt - BUFFER_MS) {
    return cached.token;
  }
  if (pending) return pending;
  pending = fetchNewToken().finally(() => {
    pending = null;
  });
  return pending;
}

export function clearTokenCache(): void {
  cached = null;
}
