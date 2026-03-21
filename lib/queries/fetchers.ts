import type { Reciter, Surah, SurahDetail, Recitation } from "@/lib/api/types";

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? "Request failed");
  }
  return res.json();
}

export async function fetchReciters(): Promise<Reciter[]> {
  return getJson<Reciter[]>("/api/reciters");
}

export async function fetchSurahs(): Promise<Surah[]> {
  return getJson<Surah[]>("/api/surahs");
}

export async function fetchSurah(
  id: number,
  translation = "ar.muyassar"
): Promise<SurahDetail> {
  const url = `/api/surahs/${id}?translation=${encodeURIComponent(translation)}`;
  return getJson<SurahDetail>(url);
}

export async function fetchRecitation(id: number): Promise<Recitation> {
  return getJson<Recitation>(`/api/recitation/${id}`);
}

export interface ReciterDetailResponse {
  reciter: Reciter | null;
  recitations: Recitation[];
}

export async function fetchReciterDetail(
  reciterId: number,
  recitationIds: number[]
): Promise<ReciterDetailResponse> {
  const ids = recitationIds.length
    ? `?recitations=${recitationIds.join(",")}`
    : "";
  return getJson<ReciterDetailResponse>(`/api/reciters/${reciterId}${ids}`);
}

// Mushaf
export interface MushafVerse {
  verseKey: string;
  text: string;
  chapterId: number;
  verseNumber: number;
  pageNumber: number;
}

export interface MushafPageResponse {
  pageNumber: number;
  imageUrl: string | null;
  verses: MushafVerse[];
  translations?: unknown[];
}

export async function fetchMushafPage(page: number): Promise<MushafPageResponse> {
  return getJson<MushafPageResponse>(`/api/mushaf/pages/${page}`);
}

export interface MushafLayoutBox {
  verseKey: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MushafLayoutResponse {
  pageNumber: number;
  boxes: MushafLayoutBox[];
}

export async function fetchMushafLayout(
  page: number
): Promise<MushafLayoutResponse> {
  return getJson<MushafLayoutResponse>(`/api/mushaf/layout/${page}`);
}

export interface MushafPageByAyahResponse {
  pageNumber: number;
}

export async function fetchMushafPageByAyah(
  ayahKey: string
): Promise<MushafPageByAyahResponse> {
  return getJson<MushafPageByAyahResponse>(
    `/api/mushaf/page-by-ayah?ayahKey=${encodeURIComponent(ayahKey)}`
  );
}

// Chapter audio (QF)
export interface ChapterAudioTimestamp {
  verseKey: string;
  from: number;
  to: number;
}

export interface ChapterAudioFileResponse {
  reciterId: string;
  chapter: number;
  audioUrl: string;
  timestamps?: ChapterAudioTimestamp[];
}

export async function fetchChapterAudioFile(
  reciterId: string,
  chapter: number,
  segments = true
): Promise<ChapterAudioFileResponse> {
  const url = `/api/audio/chapter-file?reciterId=${encodeURIComponent(reciterId)}&chapter=${chapter}&segments=${segments ? "1" : "0"}`;
  return getJson<ChapterAudioFileResponse>(url);
}
