/**
 * Tournament Data Hooks
 * React Query hooks for tournament, menu, sponsors, and stats
 * These use POLL_STATIC (no polling) since data rarely changes
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import {
  getMenuUrl,
  getSponsorsUrl,
  getTournamentUrl,
  getTournamentStatsUrl,
  getEventosUrl,
  POLL_STATIC,
} from '@/config/api';
import type { MenuItem, Sponsor, TournamentInfo, TournamentStats, EventDay } from '@/data/mockData';

// ============= Menu =============

/** Fetch enabled menu items from API */
export const useMenuItems = () => {
  return useQuery<MenuItem[]>({
    queryKey: ['menu'],
    queryFn: () => apiFetch<MenuItem[]>(getMenuUrl()),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: POLL_STATIC || false,
  });
};

// ============= Sponsors =============

/** Fetch sponsor list */
export const useSponsors = () => {
  return useQuery<Sponsor[]>({
    queryKey: ['sponsors'],
    queryFn: () => apiFetch<Sponsor[]>(getSponsorsUrl()),
    staleTime: 5 * 60 * 1000,
    refetchInterval: POLL_STATIC || false,
  });
};

// ============= Tournament Info =============

/** Fetch tournament general info */
export const useTournamentInfo = () => {
  return useQuery<TournamentInfo>({
    queryKey: ['tournament'],
    queryFn: async () => {
      const data = await apiFetch<any>(getTournamentUrl());
      return {
        ...data,
        logoUrl: data.logo || data.logoUrl || '',
        heroImageUrl: data.heroImage || data.heroImageUrl || '',
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: POLL_STATIC || false,
  });
};

// ============= Tournament Stats =============

/** Fetch tournament statistics */
export const useTournamentStats = () => {
  return useQuery<TournamentStats>({
    queryKey: ['tournament-stats'],
    queryFn: () => apiFetch<TournamentStats>(getTournamentStatsUrl()),
    staleTime: 2 * 60 * 1000,
    refetchInterval: POLL_STATIC || false,
  });
};

// ============= Eventos =============

/** Fetch event schedule */
export const useEventos = () => {
  return useQuery<EventDay[]>({
    queryKey: ['eventos'],
    queryFn: () => apiFetch<EventDay[]>(getEventosUrl()),
    staleTime: 5 * 60 * 1000,
    refetchInterval: POLL_STATIC || false,
  });
};
