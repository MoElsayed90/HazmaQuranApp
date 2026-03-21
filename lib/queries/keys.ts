/**
 * Central query keys for React Query.
 * Use these in hooks and invalidations to avoid duplication.
 */
export const queryKeys = {
  reciters: {
    all: ["reciters"] as const,
    list: () => [...queryKeys.reciters.all] as const,
    detail: (id: number, recitationIds: number[]) =>
      ["reciters", id, recitationIds] as const,
  },
  surahs: {
    all: ["surahs"] as const,
    list: () => [...queryKeys.surahs.all] as const,
    detail: (id: number, translation?: string) =>
      translation ? ["surahs", id, translation] as const : ["surahs", id] as const,
  },
  recitation: {
    all: ["recitation"] as const,
    detail: (id: number) => [...queryKeys.recitation.all, id] as const,
  },
  mushaf: {
    page: (page: number) => ["mushaf", "page", page] as const,
    pageByAyah: (ayahKey: string) => ["mushaf", "pageByAyah", ayahKey] as const,
    layout: (page: number) => ["mushaf", "layout", page] as const,
  },
  chapterAudio: {
    file: (reciterId: string, chapter: number, segments: boolean) =>
      ["chapterAudio", reciterId, chapter, segments] as const,
  },
} as const;
