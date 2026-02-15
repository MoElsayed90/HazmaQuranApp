/**
 * تنزيل ملف صوتي من رابط. للروابط الخارجية (مثل IslamHouse) نستخدم proxy
 * لتجنب CORS؛ للروابط من نفس النطاق نستخدم fetch مباشر.
 */
function isSameOrigin(url: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URL(url).origin === window.location.origin;
  } catch {
    return false;
  }
}

export async function downloadAudioFile(
  url: string,
  filename: string
): Promise<void> {
  // #region agent log
  fetch("http://127.0.0.1:7246/ingest/3bcafeef-7748-424b-8a3c-846ae00ce954", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "download-audio.ts:entry",
      message: "downloadAudioFile",
      data: { urlPrefix: url.slice(0, 100), filename, useProxy: !isSameOrigin(url) },
      timestamp: Date.now(),
      hypothesisId: "H4",
    }),
  }).catch(() => {});
  // #endregion
  const useProxy = !isSameOrigin(url);
  const fetchUrl = useProxy
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/api/download-audio?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`
    : url;

  const res = await fetch(fetchUrl, useProxy ? {} : { mode: "cors" });
  // #region agent log
  fetch("http://127.0.0.1:7246/ingest/3bcafeef-7748-424b-8a3c-846ae00ce954", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "download-audio.ts:after-fetch",
      message: "fetch done",
      data: { status: res.status, ok: res.ok, useProxy },
      timestamp: Date.now(),
      hypothesisId: "H2",
    }),
  }).catch(() => {});
  // #endregion
  if (!res.ok) throw new Error(res.statusText);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename.endsWith(".mp3") ? filename : `${filename}.mp3`;
  a.click();
  URL.revokeObjectURL(objectUrl);
}
