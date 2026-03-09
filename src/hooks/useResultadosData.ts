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
      // Step 1: Fetch category list from resultados.php
      const catListResp = await apiFetch<{
        strokePlay?: Array<{ categoryId: string; name: string; shortName?: string; [key: string]: any }>;
        matchPlay?: Array<{ categoryId: string; name: string; shortName?: string; [key: string]: any }>;
      } | Array<{ categoryId: string; name: string; [key: string]: any }>>(getResultadosUrl());

      // Flatten the category list
      let categories: Array<{ categoryId: string; name: string; shortName?: string; [key: string]: any }> = [];
      if (Array.isArray(catListResp)) {
        categories = catListResp;
      } else {
        const sp = catListResp.strokePlay ?? [];
        const mp = catListResp.matchPlay ?? [];
        categories = [...sp, ...mp];
      }

      // Step 2: For each category, fetch its detailed results via resultados_jug.php
      const categoriesWithDetails = await Promise.all(
        categories.map(async (cat) => {
          try {
            const detailResp = await apiFetch<any>(getResultadosCategoryUrl(cat.categoryId));
            
            // Normalize the response to scoringTypes array
            const scoringTypes = Array.isArray(detailResp)
              ? detailResp
              : detailResp.scoringTypes
              ? Array.isArray(detailResp.scoringTypes)
                ? detailResp.scoringTypes
                : [{ scoringType: detailResp.scoringType || 'NETO', players: detailResp.players || [] }]
              : [{ scoringType: 'NETO', players: detailResp.players || [] }];

            return {
              categoryId: cat.categoryId,
              categoryName: cat.name || '',
              shortName: cat.shortName || '',
              scoringTypes,
            } as ResultCategory;
          } catch (err) {
            console.error(`Failed to fetch details for category ${cat.categoryId}:`, err);
            return {
              categoryId: cat.categoryId,
              categoryName: cat.name || '',
              shortName: cat.shortName || '',
              scoringTypes: [],
            } as ResultCategory;
          }
        })
      );

      return categoriesWithDetails;
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
