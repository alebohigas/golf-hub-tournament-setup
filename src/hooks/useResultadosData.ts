/**
 * Results Data Hooks
 * React Query hooks for tournament results
 * Uses POLL_ACTIVE for frequent updates during tournament
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { getResultadosUrl, getResultadosCategoryUrl, POLL_ACTIVE } from '@/config/api';
import type { ResultCategory } from '@/data/resultadosData';

// ============= All Results =============

/** Fetch all categories with results */
export const useAllResults = () => {
  return useQuery<ResultCategory[]>({
    queryKey: ['resultados'],
    queryFn: async () => {
      // the API currently returns an object with separate arrays for
      // strokePlay and matchPlay; convert to flat list so consumers can
      // treat the result as a simple array (matches the mock data shape).
      const resp = await apiFetch<{
        strokePlay?: ResultCategory[];
        matchPlay?: ResultCategory[];
        // in case the API is eventually changed to return a raw array, handle it
        // generically as well
      } | ResultCategory[]>(getResultadosUrl());

      if (Array.isArray(resp)) {
        return resp;
      }

      const sp = resp.strokePlay ?? [];
      const mp = resp.matchPlay ?? [];
      return [...sp, ...mp];
    },
    staleTime: POLL_ACTIVE,
    refetchInterval: POLL_ACTIVE,
  });
};

// ============= Category Results =============

/**
 * Fetch results for a specific category
 * @param categoryId - Category identifier
 * @param enabled - Whether to enable the query
 */
export const useCategoryResults = (categoryId: string | null, enabled = true) => {
  return useQuery<ResultCategory>({
    queryKey: ['resultados', categoryId],
    queryFn: () => apiFetch<ResultCategory>(getResultadosCategoryUrl(categoryId!)),
    enabled: enabled && !!categoryId,
    staleTime: POLL_ACTIVE,
    refetchInterval: POLL_ACTIVE,
  });
};
