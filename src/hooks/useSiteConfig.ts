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
  /**
   * Carousel/ribbon presentation settings.
   *  - order:         Custom sponsor display order as an array of sponsor IDs (numbers).
   *                   Sponsors not present in this list fall back to alphabetical order
   *                   (server default) and are appended after the configured ones.
   *  - randomize:     When true, the displayed order is shuffled on every page load.
   *                   The custom `order` is ignored in this case.
   *  - visibleCount:  Number of logos that should be FULLY visible in the ribbon
   *                   viewport at any moment. Each slot occupies `100% / visibleCount`
   *                   of the container width, so logos entering/leaving on the edges
   *                   are partial (not counted). 0 / undefined = legacy auto sizing.
   *  - enabledIds:    Whitelist of sponsor IDs allowed to appear in the ribbon.
   *                   When undefined, all sponsors with a working logo are shown
   *                   (legacy behavior). When defined (even empty), only the listed
   *                   IDs are rendered.
   */
  carousel?: {
    order?: number[];
    randomize?: boolean;
    visibleCount?: number;
    enabledIds?: number[];
  };
}

/** Spacing presets between attraction cards on the Eventos page */
export type EventosGap = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Configuration for the Eventos page poster grid.
 * Stored independently per breakpoint so admin can tune desktop vs. mobile.
 *  - desktopColumns: 1–4
 *  - mobileColumns:  1–4
 *  - desktopGap / mobileGap: spacing preset between cards
 */
export interface EventosConfig {
  desktopColumns: number;
  mobileColumns: number;
  desktopGap: EventosGap;
  mobileGap: EventosGap;
  /**
   * Optional custom poster order for the desktop layout. Stored as a list
   * of zero-based indices into the static poster array defined in the
   * public component. Indices not present in the list fall back to the
   * default static order and are appended at the end.
   */
  desktopOrder?: number[];
  /** Optional custom poster order for the mobile layout (same semantics). */
  mobileOrder?: number[];
}

/**
 * Configuration for the Avisos page poster grid.
 * Mirrors EventosConfig (cols + gap per breakpoint) so admins can tune
 * the visual presentation of the avisos posters independently from eventos.
 */
export interface AvisosConfig {
  desktopColumns: number;
  mobileColumns: number;
  desktopGap: EventosGap;
  mobileGap: EventosGap;
  /** Optional custom poster order per breakpoint (see EventosConfig). */
  desktopOrder?: number[];
  mobileOrder?: number[];
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
  eventos_config: EventosConfig | null;
  avisos_config: AvisosConfig | null;
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
  eventos_config?: EventosConfig | null;
  avisos_config?: AvisosConfig | null;
}

// ============= Constants =============

const TORNEO_ID_KEY = 'golf-app-torneo-id';
const MENU_ORDER_KEY = 'tournament_menu_item_order';
const VISIBILITY_KEY = 'tournament_page_visibility';
const GROUPS_KEY = 'tournament_menu_groups';
const PAGE_GROUPS_KEY = 'tournament_page_group_assignments';
const LIVE_SCORING_KEY = 'tournament_live_scoring_config';
const SPONSORS_CONFIG_KEY = 'tournament_sponsors_config';
const EVENTOS_CONFIG_KEY = 'tournament_eventos_config';
const AVISOS_CONFIG_KEY = 'tournament_avisos_config';

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

      // Sync eventos config
      if (config.eventos_config) {
        localStorage.setItem(EVENTOS_CONFIG_KEY, JSON.stringify(config.eventos_config));
      }

      // Sync avisos config
      if (config.avisos_config) {
        localStorage.setItem(AVISOS_CONFIG_KEY, JSON.stringify(config.avisos_config));
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
