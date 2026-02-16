"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  fetchReciters,
  fetchSurahs,
  fetchSurah,
  fetchRecitation,
  fetchReciterDetail,
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
