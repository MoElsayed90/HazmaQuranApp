/**
 * AlQuran Cloud API provider.
 * Provides surah data, ayahs, and translations.
 * API: https://alquran.cloud/api
 */
import type { QuranDataSource } from "../datasource";
import type {
  Surah,
  SurahDetail,
  Reciter,
  Recitation,
  AlQuranResponse,
  AlQuranSurah,
  AlQuranSurahDetail,
} from "../types";
import { cachedFetch } from "../client";

const BASE_URL = "https://api.alquran.cloud/v1";

// Cache surah list for 24 hours (it never changes)
const SURAH_LIST_TTL = 24 * 60 * 60 * 1000;
// Cache surah detail for 1 hour
const SURAH_DETAIL_TTL = 60 * 60 * 1000;

function mapSurah(s: AlQuranSurah): Surah {
  return {
    id: s.number,
    name: s.name,
    englishName: s.englishName,
    englishNameTranslation: s.englishNameTranslation,
    numberOfAyahs: s.numberOfAyahs,
    revelationType: s.revelationType,
  };
}

export class AlQuranCloudProvider implements QuranDataSource {
  async getSurahs(): Promise<Surah[]> {
    const response = await cachedFetch<AlQuranResponse<AlQuranSurah[]>>(
      `${BASE_URL}/surah`,
      SURAH_LIST_TTL
    );
    return response.data.map(mapSurah);
  }

  async getSurah(id: number, edition = "quran-uthmani"): Promise<SurahDetail> {
    const response = await cachedFetch<AlQuranResponse<AlQuranSurahDetail>>(
      `${BASE_URL}/surah/${id}/${edition}`,
      SURAH_DETAIL_TTL
    );

    const data = response.data;
    return {
      surah: {
        id: data.number,
        name: data.name,
        englishName: data.englishName,
        englishNameTranslation: data.englishNameTranslation,
        numberOfAyahs: data.numberOfAyahs,
        revelationType: data.revelationType,
      },
      ayahs: data.ayahs.map((a) => ({
        number: a.numberInSurah,
        numberInQuran: a.number,
        text: a.text,
        juz: a.juz,
        page: a.page,
      })),
    };
  }

  async getSurahWithTranslation(
    id: number,
    translationEdition: string
  ): Promise<SurahDetail> {
    // Fetch both Uthmanic text and translation in parallel
    const [quranResponse, translationResponse] = await Promise.all([
      cachedFetch<AlQuranResponse<AlQuranSurahDetail>>(
        `${BASE_URL}/surah/${id}/quran-uthmani`,
        SURAH_DETAIL_TTL
      ),
      cachedFetch<AlQuranResponse<AlQuranSurahDetail>>(
        `${BASE_URL}/surah/${id}/${translationEdition}`,
        SURAH_DETAIL_TTL
      ),
    ]);

    const data = quranResponse.data;
    const translationAyahs = translationResponse.data.ayahs;

    return {
      surah: {
        id: data.number,
        name: data.name,
        englishName: data.englishName,
        englishNameTranslation: data.englishNameTranslation,
        numberOfAyahs: data.numberOfAyahs,
        revelationType: data.revelationType,
      },
      ayahs: data.ayahs.map((a, index) => ({
        number: a.numberInSurah,
        numberInQuran: a.number,
        text: a.text,
        translation: translationAyahs[index]?.text,
        juz: a.juz,
        page: a.page,
      })),
    };
  }

  async getReciters(): Promise<Reciter[]> {
    // AlQuran Cloud doesn't have a reciters endpoint; delegate to IslamHouse
    return [];
  }

  async getRecitation(): Promise<Recitation> {
    throw new Error("Not implemented - use IslamHouse provider for recitations");
  }

  async searchSurahs(query: string): Promise<Surah[]> {
    const surahs = await this.getSurahs();
    const normalizedQuery = query.trim().toLowerCase();

    return surahs.filter(
      (s) =>
        s.name.includes(query) ||
        s.englishName.toLowerCase().includes(normalizedQuery) ||
        s.englishNameTranslation.toLowerCase().includes(normalizedQuery) ||
        String(s.id) === normalizedQuery
    );
  }

  async getAudioUrl(surahId: number, reciterId: number): Promise<string | null> {
    // Use well-known CDN patterns for common reciters
    // This is a simplified version - in production you'd want a proper mapping
    const paddedSurah = String(surahId).padStart(3, "0");

    // Common reciter audio CDN mappings
    const reciterPaths: Record<number, string> = {
      // Mishary Rashid Alafasy
      8326: `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${paddedSurah}.mp3`,
    };

    return reciterPaths[reciterId] || null;
  }
}
