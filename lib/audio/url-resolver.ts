/**
 * Audio URL resolver: normalize and optionally fallback.
 * Ensures HTTPS (avoids mixed content), and supports provider abstraction.
 */

const DEV = typeof process !== "undefined" && process.env.NODE_ENV === "development";

/**
 * Normalize URL to HTTPS. IslamHouse and some APIs may return http:// which
 * causes mixed content or autoplay issues in modern browsers.
 */
export function normalizeAudioUrl(url: string | undefined | null): string {
  if (!url || typeof url !== "string" || !url.trim()) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://")) {
    return "https://" + trimmed.slice(7);
  }
  return trimmed;
}

/**
 * Resolve final URL for playback. Use this before passing to the audio element.
 * Logs in dev for debugging.
 */
export function resolveAudioUrl(url: string | undefined | null): string {
  const resolved = normalizeAudioUrl(url);
  if (DEV && resolved) {
    // eslint-disable-next-line no-console
    console.log("[audio] resolved URL:", resolved);
  }
  return resolved;
}
