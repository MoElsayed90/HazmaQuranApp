import type { Surah, SurahDetail, Reciter, Recitation } from "./types";

/**
 * Abstract data source for Quran data.
 * Implementations can be swapped (IslamHouse, Quran.com Foundation, AlQuran Cloud, etc.)
 */
export interface QuranDataSource {
  /** Get list of all 114 surahs */
  getSurahs(): Promise<Surah[]>;

  /** Get a surah with its ayahs */
  getSurah(id: number, edition?: string): Promise<SurahDetail>;

  /** Get a surah with translation */
  getSurahWithTranslation(
    id: number,
    translationEdition: string
  ): Promise<SurahDetail>;

  /** Get list of reciters */
  getReciters(categoryId?: number): Promise<Reciter[]>;

  /** Get recitation details (attachments/audio files) */
  getRecitation(id: number): Promise<Recitation>;

  /** Search surahs by name (Arabic or English) */
  searchSurahs(query: string): Promise<Surah[]>;

  /** Get audio URL for a specific surah by a reciter */
  getAudioUrl(surahId: number, reciterId: number): Promise<string | null>;
}
