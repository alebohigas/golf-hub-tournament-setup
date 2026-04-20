/**
 * Site Config Hook
 * Fetches server-side config (torneoid, menu_order, visibility, groups) for the current domain
 * Syncs to localStorage so all visitors share the same config set by admin
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';

// ============= Types =============

/** Configuration for a single live scoring entry on the Live page */
export interface LiveScoringEntry {
  categoryId: string;
  categoryName: string;
  tipo: 'stroke' | 'stableford';
  gross: 0 | 1;
  enabled: boolean;
  /** Display order on /live page (lower = first). Default: categoryId ASC */
  order?: number;
}

/** Configuration for the Patrocinadores (sponsors) page */
export interface SponsorsConfig {
  /** Number of columns in the sponsor logo grid (1–6) */
  columns: number;
  /**
   * Map of route paths (e.g. "/", "/jugadores") → boolean indicating
   * whether the scrolling sponsor ribbon should be displayed on that page.
   * If undefined, the ribbon defaults to visible on every page (legacy behavior).
   */
  ribbonVisiblePages?: Record<string, boolean>;
}

/** Full server response for site config */
export interface SiteConfig {
  domain: string;
  torneoid: number | null;
  menu_order: Record<string, number> | null;
  visibility: Record<string, boolean> | null;
  menu_groups: any[] | null;
  page_group_assignments: Record<string, string> | null;
  live_scoring_config: LiveScoringEntry[] | null;
  sponsors_config: SponsorsConfig | null;
}

/** Payload for saving config (all fields optional except password) */
export interface SaveConfigPayload {
  password: string;
  torneoid?: number;
  menu_order?: Record<string, number> | null;
  visibility?: Record<string, boolean> | null;
  menu_groups?: any[] | null;
  page_group_assignments?: Record<string, string> | null;
  live_scoring_config?: LiveScoringEntry[] | null;
  sponsors_config?: SponsorsConfig | null;
}

// ============= Constants =============

const TORNEO_ID_KEY = 'golf-app-torneo-id';
const MENU_ORDER_KEY = 'tournament_menu_item_order';
const VISIBILITY_KEY = 'tournament_page_visibility';
const GROUPS_KEY = 'tournament_menu_groups';
const PAGE_GROUPS_KEY = 'tournament_page_group_assignments';
const LIVE_SCORING_KEY = 'tournament_live_scoring_config';
const SPONSORS_CONFIG_KEY = 'tournament_sponsors_config';

// ============= Fetch Functions =============

/**
 * Fetch full site config from server
 */
const fetchSiteConfig = async (): Promise<SiteConfig> => {
  const res = await fetch(`${API_BASE_URL}/site_config.php`);
  if (!res.ok) throw new Error('Failed to fetch site config');
  return res.json();
};

/**
 * Save config fields to server
 */
const saveSiteConfigApi = async (payload: SaveConfigPayload): Promise<{ domain: string; saved: boolean }> => {
  const res = await fetch(`${API_BASE_URL}/site_config.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || 'Failed to save config');
  }
  return res.json();
};

// ============= Hooks =============

/**
 * useSiteConfig
 * Fetches server-side config and syncs all values to localStorage
 * so the app uses server-defined settings for all visitors
 */
export const useSiteConfig = () => {
  return useQuery<SiteConfig>({
    queryKey: ['site-config'],
    queryFn: async () => {
      const config = await fetchSiteConfig();

      // Sync torneoid
      if (config.torneoid) {
        localStorage.setItem(TORNEO_ID_KEY, String(config.torneoid));
      }

      // Sync menu order
      if (config.menu_order) {
        localStorage.setItem(MENU_ORDER_KEY, JSON.stringify(config.menu_order));
      }

      // Sync visibility
      if (config.visibility) {
        localStorage.setItem(VISIBILITY_KEY, JSON.stringify(config.visibility));
      }

      // Sync menu groups
      if (config.menu_groups) {
        localStorage.setItem(GROUPS_KEY, JSON.stringify(config.menu_groups));
      }

      // Sync page group assignments
      if (config.page_group_assignments) {
        localStorage.setItem(PAGE_GROUPS_KEY, JSON.stringify(config.page_group_assignments));
      }

      // Sync live scoring config
      if (config.live_scoring_config) {
        localStorage.setItem(LIVE_SCORING_KEY, JSON.stringify(config.live_scoring_config));
      }

      // Sync sponsors config
      if (config.sponsors_config) {
        localStorage.setItem(SPONSORS_CONFIG_KEY, JSON.stringify(config.sponsors_config));
      }

      return config;
    },
    staleTime: 30 * 1000, // 30 seconds - keep fresh for admin changes
    retry: 1,
  });
};

/**
 * useSaveSiteConfig
 * Mutation to save any config fields to server
 */
export const useSaveSiteConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveConfigPayload) => saveSiteConfigApi(payload),
    onSuccess: () => {
      // Invalidate to re-fetch fresh config
      queryClient.invalidateQueries({ queryKey: ['site-config'] });
      queryClient.invalidateQueries({ queryKey: ['tournament'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-stats'] });
    },
  });
};
