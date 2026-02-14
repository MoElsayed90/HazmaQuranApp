/**
 * Quran.Foundation Content API v4 response shapes (subset we use).
 */

export interface QFChapter {
  id: number;
  revelation_place: string;
  name_arabic: string;
  name_complex?: string;
  name_simple?: string;
  verses_count: number;
  translated_name?: {
    name: string;
    name_simple?: string;
    language_name?: string;
  };
}

export interface QFChaptersResponse {
  chapters: QFChapter[];
}

export interface QFVerse {
  id: number;
  chapter_id: number;
  verse_number: number;
  verse_key: string;
  verse_index?: number;
  text_uthmani: string;
  juz_number: number;
  page_number: number;
  translations?: Array<{ text: string; resource_id?: number }>;
  audio?: { verse_key: string; url: string };
}

export interface QFVersesResponse {
  verses: QFVerse[];
  pagination: {
    current_page: number;
    next_page: number | null;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
}

export interface QFRecitation {
  id: number;
  reciter_name: string;
  style: string;
  translated_name?: { name: string; language_name?: string };
}

export interface QFChapterAudioFile {
  id: number;
  chapter_id: number;
  file_size?: number;
  format?: string;
  audio_url: string;
  total_files?: number;
}

export interface QFRecitationChapterAudioResponse {
  audio_files: QFChapterAudioFile[];
}

/** Single chapter audio (Option B: GET chapter_recitations/{reciter_id}/{chapter_number}) */
export interface QFChapterRecitationSingleResponse {
  audio_url?: string;
  audio_file?: { audio_url?: string };
}

/** Verse-level timestamp when segments=true on chapter_recitations */
export interface QFVerseTimestamp {
  verse_key: string;
  timestamp_from: number;
  timestamp_to: number;
  duration: number;
  segments?: Array<[number, number, number]>; // [word_index, start_ms, end_ms]
}

/** Chapter audio with timestamps (GET chapter_recitations/{id}/{chapter}?segments=true) */
export interface QFChapterRecitationWithSegmentsResponse {
  audio_file?: {
    id?: number;
    chapter_id?: number;
    audio_url?: string;
    file_size?: number;
    format?: string;
  };
  timestamps?: QFVerseTimestamp[];
}

/** Ayah-by-ayah audio (GET recitations/{id}/audio_files?chapter_number=...) */
export interface QFAyahAudioFile {
  verse_key: string;
  url: string;
}
export interface QFRecitationAyahAudioResponse {
  audio_files: QFAyahAudioFile[];
}

/** Normalized verse segment for app use (verse number in surah, times in ms) */
export interface VerseSegment {
  verseNumber: number;
  startMs: number;
  endMs: number;
}

/** Translation resource from GET /resources/translations */
export interface QFTranslation {
  id: number;
  name: string;
  author_name?: string;
  slug?: string;
  language_name?: string;
  translated_name?: { name?: string; language_name?: string };
}

/** Tafsir resource from GET /resources/tafsirs */
export interface QFTafsirResource {
  id: number;
  name: string;
  author_name?: string;
  slug?: string;
  language_name?: string;
  translated_name?: { name?: string; language_name?: string };
}

/** Single tafsir entry (verse-level) from GET /tafsirs/{id}?chapter_number= */
export interface QFTafsirEntry {
  id?: number;
  resource_id?: number;
  verse_id?: number;
  verse_key: string;
  chapter_id: number;
  verse_number: number;
  text: string;
  resource_name?: string;
  language_name?: string;
}

export interface QFTafsirResponse {
  tafsirs: QFTafsirEntry[];
  meta?: { tafsir_name?: string; author_name?: string };
}

/** Verse on a mushaf page (GET /verses/by_page/{page_number}) */
export interface QFMushafVerse {
  verse_key: string;
  verse_number?: number;
  chapter_id?: number;
  page_number?: number;
  image_url?: string;
  image_width?: number;
  text_uthmani?: string;
  translations?: Array<{ text: string; resource_id?: number }>;
  tafsirs?: Array<{ text: string; resource_id?: number }>;
  audio?: { verse_key: string; url: string };
}

export interface QFMushafPageResponse {
  verses: QFMushafVerse[];
  pagination?: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
}

/** Chapter reciter from GET /resources/chapter_reciters */
export interface QFChapterReciter {
  id: number;
  name: string;
  arabic_name?: string;
  relative_path?: string;
  format?: string;
  files_size?: number;
}

export interface QFChapterRecitersResponse {
  reciters: QFChapterReciter[];
}
