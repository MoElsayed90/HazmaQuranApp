"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  fetchReciters,
  fetchSurahs,
  fetchSurah,
  fetchRecitation,
  fetchReciterDetail,
  fetchMushafPage,
  fetchMushafPageByAyah,
  fetchMushafLayout,
  fetchChapterAudioFile,
} from "./fetchers";

export function useReciters() {
  return useQuery({
    queryKey: queryKeys.reciters.list(),
    queryFn: fetchReciters,
  });
}

export function useSurahs() {
  return useQuery({
    queryKey: queryKeys.surahs.list(),
    queryFn: fetchSurahs,
  });
}

export function useSurah(id: number, translation = "ar.muyassar") {
  return useQuery({
    queryKey: queryKeys.surahs.detail(id, translation),
    queryFn: () => fetchSurah(id, translation),
    enabled: id >= 1 && id <= 114,
  });
}

export function useRecitation(id: number) {
  return useQuery({
    queryKey: queryKeys.recitation.detail(id),
    queryFn: () => fetchRecitation(id),
    enabled: id > 0,
  });
}

export function useReciterDetail(reciterId: number, recitationIds: number[]) {
  return useQuery({
    queryKey: queryKeys.reciters.detail(reciterId, recitationIds),
    queryFn: () => fetchReciterDetail(reciterId, recitationIds),
    enabled: reciterId > 0,
  });
}

const MUSHAF_STALE_TIME = 24 * 60 * 60 * 1000; // 1 day

export function useMushafPage(page: number) {
  return useQuery({
    queryKey: queryKeys.mushaf.page(page),
    queryFn: () => fetchMushafPage(page),
    enabled: page >= 1 && page <= 604,
    staleTime: MUSHAF_STALE_TIME,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useMushafPageByAyah(ayahKey: string | null) {
  const valid = ayahKey != null && /^\d+:\d+$/.test(ayahKey);
  return useQuery({
    queryKey: queryKeys.mushaf.pageByAyah(ayahKey ?? ""),
    queryFn: () => fetchMushafPageByAyah(ayahKey!),
    enabled: valid,
    staleTime: MUSHAF_STALE_TIME,
  });
}

export function useMushafLayout(page: number) {
  return useQuery({
    queryKey: queryKeys.mushaf.layout(page),
    queryFn: () => fetchMushafLayout(page),
    enabled: page >= 1 && page <= 604,
    staleTime: MUSHAF_STALE_TIME,
  });
}

export function useChapterAudioFile(
  reciterId: string | null,
  chapter: number,
  segments = true
) {
  return useQuery({
    queryKey: queryKeys.chapterAudio.file(
      reciterId ?? "",
      chapter,
      segments
    ),
    queryFn: () => fetchChapterAudioFile(reciterId!, chapter, segments),
    enabled: reciterId != null && reciterId !== "" && chapter >= 1 && chapter <= 114,
    staleTime: MUSHAF_STALE_TIME,
  });
}
