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
