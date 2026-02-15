/**
 * تنزيل ملف صوتي من رابط (حتى cross-origin) بدل فتحه في تاب جديد.
 * يستخدم fetch + blob + object URL لتفعيل التحميل المباشر.
 */
export async function downloadAudioFile(
  url: string,
  filename: string
): Promise<void> {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(res.statusText);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename.endsWith(".mp3") ? filename : `${filename}.mp3`;
  a.click();
  URL.revokeObjectURL(objectUrl);
}
