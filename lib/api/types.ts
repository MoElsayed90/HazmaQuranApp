// ============================================================
// Normalized domain types used throughout the application
// ============================================================

export interface Surah {
  id: number;
  name: string;           // Arabic name
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
}

export interface Ayah {
  number: number;         // Ayah number within the surah
  numberInQuran: number;  // Global ayah number (1-6236)
  text: string;           // Arabic text (Uthmanic)
  translation?: string;   // Optional translation text
  juz: number;
  page: number;
}

export interface SurahDetail {
  surah: Surah;
  ayahs: Ayah[];
}

export interface Reciter {
  id: number;
  name: string;           // Arabic name
  englishName?: string;
  imageUrl?: string;
  recitationCount?: number;
  recitationIds?: number[];
}

export interface Recitation {
  id: number;
  title: string;
  reciterId?: number;
  attachments: Attachment[];
}

export interface Attachment {
  id: number;
  title: string;
  size: string;
  url: string;
  duration?: number;       // seconds
  /** Optional chapter/surah id (e.g. from Quran.Foundation) for lookup */
  chapterId?: number;
}

export interface AudioFile {
  surahId: number;
  ayahNumber?: number;     // undefined = full surah
  url: string;
  reciterId: number;
}

// ============================================================
// IslamHouse API raw response types
// ============================================================

export interface IslamHouseAuthor {
  id: number;
  title: string;
  add_date: number;
  recitations_info?: {
    count: number;
    recitations_ids: number[];
  };
}

export interface IslamHouseCategoryResponse {
  authors: IslamHouseAuthor[];
}

export interface IslamHouseRecitation {
  id: number;
  title: string;
  attachments: IslamHouseAttachment[];
}

export interface IslamHouseAttachment {
  id: number;
  title: string;
  size: string;
  url: string;
}

// ============================================================
// Al-Quran Cloud API types (for surah data + ayahs)
// ============================================================

export interface AlQuranResponse<T> {
  code: number;
  status: string;
  data: T;
}

export interface AlQuranSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
}

export interface AlQuranAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

export interface AlQuranSurahDetail {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: "Meccan" | "Medinan";
  numberOfAyahs: number;
  ayahs: AlQuranAyah[];
}

// ============================================================
// App state types
// ============================================================

export interface Bookmark {
  surahId: number;
  surahName: string;
  ayahNumber: number;
  ayahText: string;
  createdAt: number;
}

export interface LastReadPosition {
  surahId: number;
  surahName: string;
  ayahNumber: number;
  timestamp: number;
}

export interface LastAudioPosition {
  surahId: number;
  surahName: string;
  ayahNumber?: number;
  reciterId: number;
  reciterName: string;
  audioUrl: string;
  progress: number;       // 0-1
  timestamp: number;
}

export interface AppSettings {
  theme: "light" | "dark" | "system";
  fontSize: "sm" | "base" | "lg" | "xl";
  defaultReciterId: number | null;
  showTranslation: boolean;
  translationEdition: string;
  /** Audio reciter edition id (e.g. alafasy, husary) for CDN URLs */
  audioEdition: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  fontSize: "base",
  defaultReciterId: null,
  showTranslation: false,
  translationEdition: "ar.muyassar",
  audioEdition: "alafasy",
};
