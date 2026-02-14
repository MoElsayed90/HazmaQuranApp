/**
 * Quran.Foundation Content API v4 provider.
 * Implements QuranDataSource using server-only token and client.
 */

import type { QuranDataSource } from "../datasource";
import type {
  Surah,
  SurahDetail,
  Reciter,
  Recitation,
  Ayah,
  Attachment,
} from "../types";
import { qfRequest } from "../quran-foundation/client";
import { getQFConfig } from "../quran-foundation/config";
import type {
  QFChapter,
  QFChaptersResponse,
  QFVerse,
  QFVersesResponse,
  QFRecitation,
  QFRecitationChapterAudioResponse,
  QFChapterRecitationSingleResponse,
  QFChapterRecitationWithSegmentsResponse,
  QFRecitationAyahAudioResponse,
  QFTranslation,
  QFTafsirResource,
  QFTafsirResponse,
  QFMushafPageResponse,
  QFChapterRecitersResponse,
  VerseSegment,
} from "../quran-foundation/types";

const BASE = "/content/api/v4";
const SURAH_LIST_TTL_MS = 24 * 60 * 60 * 1000;
const SURAH_DETAIL_TTL_MS = 60 * 60 * 1000;
const RECITATIONS_TTL_MS = 60 * 60 * 1000;
const CHAPTER_AUDIO_TTL_MS = 30 * 60 * 1000;

// In-memory cache for server request dedup (no client exposure)
const cache = new Map<
  string,
  { data: unknown; expiry: number }
>();

function getCached<T>(key: string, _ttlMs: number): T | null {
  const entry = cache.get(key);
  if (entry && entry.expiry > Date.now()) return entry.data as T;
  return null;
}

function setCache(key: string, data: unknown, ttlMs: number): void {
  cache.set(key, { data, expiry: Date.now() + ttlMs });
}

function mapRevelationPlace(place: string): "Meccan" | "Medinan" {
  const p = (place || "").toLowerCase();
  if (p === "madinah" || p === "medinan") return "Medinan";
  return "Meccan"; // makka, mecca, etc.
}

/** verse_key "chapter:verse" -> global numberInQuran (1-6236) using surah lengths */
function verseKeyToNumberInQuran(verseKey: string, surahs: Surah[]): number {
  const [c, v] = verseKey.split(":").map(Number);
  if (!c || !v) return 0;
  let sum = 0;
  for (const s of surahs) {
    if (s.id >= c) break;
    sum += s.numberOfAyahs;
  }
  return sum + v;
}

function mapChapterToSurah(c: QFChapter): Surah {
  const tn = c.translated_name;
  return {
    id: c.id,
    name: c.name_arabic || "",
    englishName: c.name_simple || tn?.name_simple || tn?.name || "",
    englishNameTranslation: tn?.name || c.name_simple || "",
    numberOfAyahs: c.verses_count ?? 0,
    revelationType: mapRevelationPlace(c.revelation_place || ""),
  };
}

function mapVerseToAyah(v: QFVerse): Ayah {
  const translation = v.translations?.[0]?.text;
  return {
    number: v.verse_number,
    numberInQuran: v.verse_index ?? 0,
    text: v.text_uthmani || "",
    translation: translation,
    juz: v.juz_number ?? 0,
    page: v.page_number ?? 0,
  };
}

// Fallback: translation edition slug -> QF resource id (when API list not yet loaded).
const TRANSLATION_IDS: Record<string, number> = {
  "ar.muyassar": 57,
  "en.clearcoran": 131,
  "en.sahih": 20,
};

const TRANSLATIONS_TTL_MS = 60 * 60 * 1000;
const TAFSIRS_TTL_MS = 60 * 60 * 1000;
const MUSHAF_PAGE_TTL_MS = 24 * 60 * 60 * 1000;

export class QuranFoundationProvider implements QuranDataSource {
  async getSurahs(): Promise<Surah[]> {
    const key = "qf:chapters";
    const cached = getCached<Surah[]>(key, SURAH_LIST_TTL_MS);
    if (cached) return cached;

    const res = await qfRequest<QFChaptersResponse>(
      `${BASE}/chapters?language=ar`
    );
    const list = (res.chapters || []).map(mapChapterToSurah);
    setCache(key, list, SURAH_LIST_TTL_MS);
    return list;
  }

  async getSurah(id: number, _edition?: string): Promise<SurahDetail> {
    return this.getSurahWithTranslation(id, "");
  }

  /** Resolve translation edition (slug or id string) to QF resource id */
  private async resolveTranslationId(translationEdition: string): Promise<number | undefined> {
    if (!translationEdition?.trim()) return undefined;
    const slug = translationEdition.trim();
    if (TRANSLATION_IDS[slug] != null) return TRANSLATION_IDS[slug];
    const num = parseInt(slug, 10);
    if (!Number.isNaN(num) && num > 0) return num;
    const list = await this.getTranslationsList();
    const bySlug = list.find((t) => t.slug === slug);
    if (bySlug) return bySlug.id;
    return undefined;
  }

  /** List of translations from API (for settings and resolution). */
  async getTranslationsList(): Promise<Array<{ id: number; name: string; slug: string; languageName: string }>> {
    const key = "qf:translations";
    const cached = getCached<Array<{ id: number; name: string; slug: string; languageName: string }>>(key, TRANSLATIONS_TTL_MS);
    if (cached) return cached;

    try {
      const res = await qfRequest<{ translations?: QFTranslation[] } | QFTranslation[]>(
        `${BASE}/resources/translations?language=en`
      );
      const arr = Array.isArray(res) ? res : (res as { translations?: QFTranslation[] }).translations ?? [];
      const list = arr.map((t) => ({
        id: t.id,
        name: t.translated_name?.name || t.name || "",
        slug: t.slug || String(t.id),
        languageName: t.language_name || t.translated_name?.language_name || "en",
      }));
      setCache(key, list, TRANSLATIONS_TTL_MS);
      return list;
    } catch {
      return [];
    }
  }

  /**
   * List available tafsirs (GET /resources/tafsirs).
   */
  async getTafsirsList(): Promise<
    Array<{ id: number; name: string; slug: string; languageName: string }>
  > {
    const key = "qf:tafsirs";
    const cached = getCached<Array<{ id: number; name: string; slug: string; languageName: string }>>(
      key,
      TAFSIRS_TTL_MS
    );
    if (cached) return cached;

    try {
      const res = await qfRequest<{ tafsirs?: QFTafsirResource[] } | QFTafsirResource[]>(
        `${BASE}/resources/tafsirs?language=en`
      );
      const arr = Array.isArray(res) ? res : (res as { tafsirs?: QFTafsirResource[] }).tafsirs ?? [];
      const list = arr.map((t) => ({
        id: t.id,
        name: t.translated_name?.name || t.name || "",
        slug: t.slug || String(t.id),
        languageName: t.language_name || t.translated_name?.language_name || "en",
      }));
      setCache(key, list, TAFSIRS_TTL_MS);
      return list;
    } catch {
      return [];
    }
  }

  /**
   * Get tafsir for a chapter (GET /tafsirs/{tafsir_id}?chapter_number=).
   */
  async getTafsirForChapter(
    tafsirId: number,
    chapterNumber: number
  ): Promise<Array<{ verseNumber: number; text: string }>> {
    const key = `qf:tafsir:${tafsirId}:${chapterNumber}`;
    const cached = getCached<Array<{ verseNumber: number; text: string }>>(key, SURAH_DETAIL_TTL_MS);
    if (cached) return cached;

    const res = await qfRequest<QFTafsirResponse>(
      `${BASE}/tafsirs/${tafsirId}?chapter_number=${chapterNumber}`
    );
    const entries = res.tafsirs || [];
    const out = entries.map((e) => ({
      verseNumber: e.verse_number,
      text: e.text || "",
    }));
    setCache(key, out, SURAH_DETAIL_TTL_MS);
    return out;
  }

  /**
   * Get mushaf page data (image + verse keys) for page view.
   * GET /verses/by_page/{page_number} with image fields.
   */
  async getMushafPage(
    pageNumber: number
  ): Promise<{
    pageNumber: number;
    imageUrl: string | null;
    imageWidth: number | null;
    verseKeys: string[];
  }> {
    if (pageNumber < 1 || pageNumber > 604) {
      return { pageNumber, imageUrl: null, imageWidth: null, verseKeys: [] };
    }
    const key = `qf:mushaf_page:${pageNumber}`;
    const cached = getCached<{
      pageNumber: number;
      imageUrl: string | null;
      imageWidth: number | null;
      verseKeys: string[];
    }>(key, MUSHAF_PAGE_TTL_MS);
    if (cached) return cached;

    const res = await qfRequest<QFMushafPageResponse>(
      `${BASE}/verses/by_page/${pageNumber}?per_page=50&fields=verse_key,image_url,image_width,page_number`
    );
    const verses = res.verses || [];
    const firstWithImage = verses.find((v) => v.image_url);
    const out = {
      pageNumber,
      imageUrl: firstWithImage?.image_url ?? null,
      imageWidth: firstWithImage?.image_width ?? null,
      verseKeys: verses.map((v) => v.verse_key),
    };
    setCache(key, out, MUSHAF_PAGE_TTL_MS);
    return out;
  }

  /**
   * Get mushaf page with translations, tafsirs, and audio in one request.
   * GET /verses/by_page/{page}?translations=...&tafsirs=...&audio=...
   */
  async getMushafPageFull(
    pageNumber: number,
    options: {
      translationId?: number;
      tafsirId?: number;
      audioId?: number;
    } = {}
  ): Promise<{
    pageNumber: number;
    imageUrl: string | null;
    imageWidth: number | null;
    verses: Array<{
      verse_key: string;
      verse_number: number;
      chapter_id: number;
      text: string;
      translation?: string;
      tafsir?: string;
      audioUrl?: string;
    }>;
  }> {
    if (pageNumber < 1 || pageNumber > 604) {
      return {
        pageNumber,
        imageUrl: null,
        imageWidth: null,
        verses: [],
      };
    }
    const { translationId, tafsirId, audioId } = options;
    const key = `qf:mushaf_full:${pageNumber}:${translationId ?? 0}:${tafsirId ?? 0}:${audioId ?? 0}`;
    type FullResult = {
      pageNumber: number;
      imageUrl: string | null;
      imageWidth: number | null;
      verses: Array<{
        verse_key: string;
        verse_number: number;
        chapter_id: number;
        text: string;
        translation?: string;
        tafsir?: string;
        audioUrl?: string;
      }>;
    };
    const cached = getCached<FullResult>(key, MUSHAF_PAGE_TTL_MS);
    if (cached) return cached;

    const params = new URLSearchParams();
    params.set("per_page", "50");
    params.set(
      "fields",
      "verse_key,verse_number,chapter_id,text_uthmani,image_url,image_width,page_number"
    );
    if (translationId) params.set("translations", String(translationId));
    if (tafsirId) params.set("tafsirs", String(tafsirId));
    if (audioId) params.set("audio", String(audioId));
    params.set("words", "false");

    const res = await qfRequest<QFMushafPageResponse>(
      `${BASE}/verses/by_page/${pageNumber}?${params.toString()}`
    );
    const verses = res.verses || [];
    const firstWithImage = verses.find((v) => v.image_url);
    const out = {
      pageNumber,
      imageUrl: firstWithImage?.image_url ?? null,
      imageWidth: firstWithImage?.image_width ?? null,
      verses: verses.map((v) => ({
        verse_key: v.verse_key,
        verse_number: v.verse_number ?? 0,
        chapter_id: v.chapter_id ?? 0,
        text: v.text_uthmani ?? "",
        translation: v.translations?.[0]?.text,
        tafsir: v.tafsirs?.[0]?.text,
        audioUrl: v.audio?.url,
      })),
    };
    setCache(key, out, MUSHAF_PAGE_TTL_MS);
    return out;
  }

  /**
   * Get chapter reciters list (includes arabic_name).
   * GET /resources/chapter_reciters?language=ar
   */
  async getChapterReciters(): Promise<Array<{ id: number; name: string; arabic_name?: string }>> {
    const key = "qf:chapter_reciters:ar";
    const cached = getCached<Array<{ id: number; name: string; arabic_name?: string }>>(key, RECITATIONS_TTL_MS);
    if (cached) return cached;

    try {
      const res = await qfRequest<QFChapterRecitersResponse>(
        `${BASE}/resources/chapter_reciters?language=ar`
      );
      const list = (res.reciters || []).map((r) => ({
        id: r.id,
        name: r.name,
        arabic_name: r.arabic_name,
      }));
      setCache(key, list, RECITATIONS_TTL_MS);
      return list;
    } catch {
      return [];
    }
  }

  async getSurahWithTranslation(
    id: number,
    translationEdition: string
  ): Promise<SurahDetail> {
    const cacheKey = `qf:surah:${id}:${translationEdition}`;
    const cached = getCached<SurahDetail>(cacheKey, SURAH_DETAIL_TTL_MS);
    if (cached) return cached;

    const surahs = await this.getSurahs();
    const surahMeta = surahs.find((s) => s.id === id);
    if (!surahMeta) {
      throw new Error(`Surah ${id} not found`);
    }

    const translationId = await this.resolveTranslationId(translationEdition);
    const translationParam = translationId
      ? `&translations=${translationId}`
      : "";

    const ayahs: Ayah[] = [];
    let page = 1;
    let hasMore = true;
    const perPage = 50;

    while (hasMore) {
      const path = `${BASE}/verses/by_chapter/${id}?per_page=${perPage}&page=${page}&fields=text_uthmani,juz_number,page_number,verse_index${translationParam}`;
      const res = await qfRequest<QFVersesResponse>(path);
      const verses = res.verses || [];
      for (const v of verses) {
        ayahs.push(mapVerseToAyah(v));
      }
      const pag = res.pagination;
      hasMore = pag?.next_page != null && verses.length === perPage;
      page = (pag?.next_page ?? page) + 1;
    }

    const detail: SurahDetail = {
      surah: surahMeta,
      ayahs,
    };
    setCache(cacheKey, detail, SURAH_DETAIL_TTL_MS);
    return detail;
  }

  async getReciters(_categoryId?: number): Promise<Reciter[]> {
    const env = getQFConfig().env;
    const key = `qf:recitations:${env}`;
    const cached = getCached<Reciter[]>(key, RECITATIONS_TTL_MS);
    if (cached) return cached;

    const url = `${BASE}/resources/recitations?language=ar`;
    const res = await qfRequest<{ recitations?: QFRecitation[] } | QFRecitation[]>(url);
    const arr = Array.isArray(res) ? res : (res as { recitations?: QFRecitation[] }).recitations ?? [];
    const chapterReciters = await this.getChapterReciters();
    const byId = new Map(chapterReciters.map((c) => [c.id, c]));

    if (process.env.NODE_ENV === "development") {
      console.log("[QF Reciters API]", { url, env, count: arr.length });
    }
    const list = arr.map((r: QFRecitation) => {
      const ch = byId.get(r.id);
      return {
        id: r.id,
        name: ch?.arabic_name || r.reciter_name || "",
        englishName: r.translated_name?.name || ch?.name || r.reciter_name,
        recitationCount: 114,
        recitationIds: [r.id],
      };
    });
    setCache(key, list, RECITATIONS_TTL_MS);
    return list;
  }

  async getRecitation(id: number): Promise<Recitation> {
    const key = `qf:recitation:${id}`;
    const cached = getCached<Recitation>(key, CHAPTER_AUDIO_TTL_MS);
    if (cached) return cached;

    let files: Array<{ id: number; chapter_id: number; file_size?: number; audio_url: string }> = [];
    try {
      const res = await qfRequest<QFRecitationChapterAudioResponse>(
        `${BASE}/chapter_recitations/${id}?language=en`
      );
      files = res.audio_files || [];
    } catch (e) {
      const status = (e as { status?: number })?.status;
      if (status === 404) {
        const res = await qfRequest<QFRecitationChapterAudioResponse>(
          `${BASE}/resources/recitations/${id}/chapter_audio_files`
        );
        files = res.audio_files || [];
      } else throw e;
    }
    const surahs = await this.getSurahs();
    const attachments: Attachment[] = files.map((f) => {
      const surah = surahs.find((s) => s.id === f.chapter_id);
      return {
        id: f.id,
        title: surah ? `سورة ${surah.name}` : `Chapter ${f.chapter_id}`,
        size: f.file_size != null ? String(f.file_size) : "",
        url: f.audio_url || "",
        chapterId: f.chapter_id,
      };
    });

    const reciters = await this.getReciters();
    const reciter = reciters.find((r) => r.recitationIds?.includes(id));
    const out: Recitation = {
      id,
      title: reciter?.name ?? `Recitation ${id}`,
      reciterId: reciter?.id,
      attachments,
    };
    setCache(key, out, CHAPTER_AUDIO_TTL_MS);
    return out;
  }

  async searchSurahs(query: string): Promise<Surah[]> {
    const surahs = await this.getSurahs();
    const q = query.trim().toLowerCase();
    if (!q) return surahs;
    return surahs.filter(
      (s) =>
        s.name.includes(query) ||
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q) ||
        String(s.id) === q
    );
  }

  async getAudioUrl(surahId: number, reciterId: number): Promise<string | null> {
    try {
      const res = await qfRequest<QFChapterRecitationSingleResponse>(
        `${BASE}/chapter_recitations/${reciterId}/${surahId}`
      );
      const url = res.audio_url ?? res.audio_file?.audio_url;
      if (url) return url;
    } catch (e) {
      const status = (e as { status?: number })?.status;
      if (status !== 404) throw e;
    }
    const recitation = await this.getRecitation(reciterId);
    const att = recitation.attachments.find((a) => a.chapterId === surahId);
    return att?.url ?? null;
  }

  /**
   * Get full chapter audio URL and verse-level segments for sync/highlighting.
   * Uses GET chapter_recitations/{reciterId}/{surahId}?segments=true.
   */
  async getChapterAudioWithSegments(
    surahId: number,
    reciterId: number
  ): Promise<{ audioUrl: string; segments: VerseSegment[] } | null> {
    const key = `qf:chapter_audio_segments:${surahId}:${reciterId}`;
    const cached = getCached<{ audioUrl: string; segments: VerseSegment[] }>(
      key,
      CHAPTER_AUDIO_TTL_MS
    );
    if (cached) return cached;

    try {
      const res = await qfRequest<QFChapterRecitationWithSegmentsResponse>(
        `${BASE}/chapter_recitations/${reciterId}/${surahId}?segments=true`
      );
      const url =
        res.audio_file?.audio_url ??
        (res as unknown as QFChapterRecitationSingleResponse).audio_url;
      if (!url) return null;

      const segments: VerseSegment[] = (res.timestamps || []).map((t) => {
        const verseNum = parseInt(t.verse_key.split(":")[1] || "0", 10);
        return {
          verseNumber: verseNum,
          startMs: t.timestamp_from,
          endMs: t.timestamp_to,
        };
      });

      const out = { audioUrl: url, segments };
      setCache(key, out, CHAPTER_AUDIO_TTL_MS);
      return out;
    } catch (e) {
      const status = (e as { status?: number })?.status;
      if (status === 404) return null;
      throw e;
    }
  }

  /**
   * Server-only: get per-ayah audio URLs for a surah (for reader playback).
   * Uses GET recitations/{id}/audio_files?chapter_number= per spec; fallback to verses/by_chapter with audio=.
   */
  async getAyahAudioUrls(
    surahId: number,
    recitationId: number
  ): Promise<Record<number, string>> {
    const key = `qf:ayah_audio:${surahId}:${recitationId}`;
    const cached = getCached<Record<number, string>>(key, CHAPTER_AUDIO_TTL_MS);
    if (cached) return cached;

    const surahs = await this.getSurahs();
    const out: Record<number, string> = {};

    try {
      const res = await qfRequest<QFRecitationAyahAudioResponse>(
        `${BASE}/recitations/${recitationId}/audio_files?chapter_number=${surahId}&fields=verse_key,url`
      );
      const files = res.audio_files || [];
      for (const f of files) {
        const num = verseKeyToNumberInQuran(f.verse_key, surahs);
        if (num && f.url) out[num] = f.url;
      }
    } catch (e) {
      const status = (e as { status?: number })?.status;
      if (status === 404) {
        let page = 1;
        let hasMore = true;
        const perPage = 50;
        while (hasMore) {
          const path = `${BASE}/verses/by_chapter/${surahId}?per_page=${perPage}&page=${page}&audio=${recitationId}&fields=verse_index,verse_key`;
          const res = await qfRequest<QFVersesResponse>(path);
          const verses = res.verses || [];
          for (const v of verses) {
            const audio = (v as QFVerse & { audio?: { url: string } }).audio;
            const url = audio?.url;
            const numInQuran = v.verse_index ?? verseKeyToNumberInQuran(v.verse_key, surahs);
            if (url && numInQuran) out[numInQuran] = url;
          }
          const pag = res.pagination;
          hasMore = pag?.next_page != null && verses.length === perPage;
          page = (pag?.next_page ?? page) + 1;
        }
      } else throw e;
    }

    setCache(key, out, CHAPTER_AUDIO_TTL_MS);
    return out;
  }
}
