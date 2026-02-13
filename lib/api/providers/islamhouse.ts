/**
 * IslamHouse API provider.
 * Provides reciters and recitation audio data.
 * API: https://api3.islamhouse.com/v3/
 */
import type { QuranDataSource } from "../datasource";
import type {
  Surah,
  SurahDetail,
  Reciter,
  Recitation,
  IslamHouseCategoryResponse,
  IslamHouseRecitation,
  IslamHouseAuthor,
} from "../types";
import { cachedFetch } from "../client";
import { AlQuranCloudProvider } from "./alquran-cloud";

const API_KEY = process.env.NEXT_PUBLIC_ISLAMHOUSE_API_KEY || "paV29H2gm56kvLPy";
const BASE_URL = `https://api3.islamhouse.com/v3/${API_KEY}`;

// Default category for Quran reciters
const RECITERS_CATEGORY_ID = 364794;

// Cache reciters for 1 hour
const RECITERS_TTL = 60 * 60 * 1000;
// Cache recitations for 30 minutes
const RECITATION_TTL = 30 * 60 * 1000;

// Reciter image mappings (static images in public/). API does not provide images;
// these are curated placeholders for known reciters. Others get avatar fallback.
const RECITER_IMAGES: Record<number, string> = {
  135998: "/elhosry.png",
  167521: "/ali-banaa.png",
  8326: "/Mashari.png",
  8474: "/sodisy.png",
  86335: "/m3qly.png",
  111670: "/mohamed-seddik-el-menchaoui.png",
  111542: "/ABDElBASET.png",
  151567: "/Dosari.png",
};

function mapAuthorToReciter(author: IslamHouseAuthor): Reciter {
  return {
    id: author.id,
    name: author.title,
    imageUrl: RECITER_IMAGES[author.id] || undefined,
    recitationCount: author.recitations_info?.count || 0,
    recitationIds: author.recitations_info?.recitations_ids
      ? [...new Set(author.recitations_info.recitations_ids)]
      : [],
  };
}

// Delegate surah/ayah operations to AlQuran Cloud
const quranProvider = new AlQuranCloudProvider();

export class IslamHouseProvider implements QuranDataSource {
  async getSurahs(): Promise<Surah[]> {
    return quranProvider.getSurahs();
  }

  async getSurah(id: number, edition?: string): Promise<SurahDetail> {
    return quranProvider.getSurah(id, edition);
  }

  async getSurahWithTranslation(
    id: number,
    translationEdition: string
  ): Promise<SurahDetail> {
    return quranProvider.getSurahWithTranslation(id, translationEdition);
  }

  async getReciters(categoryId = RECITERS_CATEGORY_ID): Promise<Reciter[]> {
    const response = await cachedFetch<IslamHouseCategoryResponse>(
      `${BASE_URL}/quran/get-category/${categoryId}/ar/json`,
      RECITERS_TTL
    );

    return response.authors.map(mapAuthorToReciter);
  }

  async getRecitation(id: number): Promise<Recitation> {
    const response = await cachedFetch<IslamHouseRecitation>(
      `${BASE_URL}/quran/get-recitation/${id}/ar/json`,
      RECITATION_TTL
    );

    return {
      id: response.id,
      title: response.title,
      attachments: response.attachments.map((a) => ({
        id: a.id,
        title: a.title,
        size: a.size,
        url: a.url,
      })),
    };
  }

  async searchSurahs(query: string): Promise<Surah[]> {
    return quranProvider.searchSurahs(query);
  }

  async getAudioUrl(
    surahId: number,
    reciterId: number
  ): Promise<string | null> {
    return quranProvider.getAudioUrl(surahId, reciterId);
  }
}

// Singleton instance
let providerInstance: IslamHouseProvider | null = null;

export function getQuranProvider(): QuranDataSource {
  if (!providerInstance) {
    providerInstance = new IslamHouseProvider();
  }
  return providerInstance;
}
