/**
 * Centralized Quran audio service.
 * Uses Islamic Network CDN (CORS-friendly, reliable):
 * - Verse: https://cdn.islamic.network/quran/audio/128/{edition}/{ayahNumberGlobal}.mp3
 * - Full surah: https://cdn.islamic.network/quran/audio-surah/128/{edition}/{surahPadded}.mp3
 * Ayah number is global 1-6236.
 */

const CDN_BASE = "https://cdn.islamic.network/quran";
const BITRATE = 128;

/** Edition slugs supported by the CDN (reciter identifier) */
export const AUDIO_EDITIONS = {
  alafasy: { slug: "ar.alafasy", name: "مشاري راشد العفاسي" },
  /** المصحف المعلم — محمود خليل الحصري (نفس slug للآيات) */
  husaryMuelam: { slug: "ar.husary", name: "محمود خليل الحصري (المصحف المعلم)" },
  minshawi: { slug: "ar.minshawi", name: "محمد صديق المنشاوي" },
  abdulbaset: { slug: "ar.abdulbasitmurattal", name: "عبد الباسط عبد الصمد" },
} as const;

export type AudioEditionId = keyof typeof AUDIO_EDITIONS;

const DEFAULT_EDITION: AudioEditionId = "alafasy";

const editionSlug = (editionId: string): string => {
  const key = editionId as AudioEditionId;
  return AUDIO_EDITIONS[key]?.slug ?? AUDIO_EDITIONS.alafasy.slug;
};

/** Get audio URL for a single ayah (global number 1-6236) */
export function getAyahAudioUrl(
  ayahNumberGlobal: number,
  editionId: string = DEFAULT_EDITION
): string {
  const edition = editionSlug(editionId);
  return `${CDN_BASE}/audio/${BITRATE}/${edition}/${ayahNumberGlobal}.mp3`;
}

/** Get audio URL for full surah */
export function getSurahAudioUrl(
  surahId: number,
  editionId: string = DEFAULT_EDITION
): string {
  const edition = editionSlug(editionId);
  const padded = String(surahId).padStart(3, "0");
  return `${CDN_BASE}/audio-surah/${BITRATE}/${edition}/${padded}.mp3`;
}

export function getEditionName(editionId: string): string {
  const key = editionId as AudioEditionId;
  return AUDIO_EDITIONS[key]?.name ?? AUDIO_EDITIONS.alafasy.name;
}
