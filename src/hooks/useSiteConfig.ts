/**
 * Site Config Hook
 * Fetches server-side config (torneoid, menu_order, visibility, groups) for the current domain
 * Syncs to localStorage so all visitors share the same config set by admin
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';
import { persistTorneoId } from '@/hooks/useTorneoId';

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
   * Map of route paths → boolean indicating whether the sponsor ribbon should
   * be rendered as `position: sticky` (stuck to the top of the viewport while
   * the page scrolls) **on mobile viewports only**. Desktop always renders
   * the ribbon in its normal in-flow position. When undefined or false for a
   * given path, the ribbon scrolls away with the page as usual.
   */
  ribbonStickyMobilePages?: Record<string, boolean>;
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
   * Toggle de visibilidad para la matriz "Calendario de Eventos"
   * (componente CalendarioEventosTable). Cuando es `true`, la página
   * /eventos renderiza la tabla con días en columnas + áreas en filas
   * (sticky headers). Default: `false` — solo torneos que lo hayan
   * habilitado explícitamente desde /admin lo verán.
   */
  showCalendarioMatriz?: boolean;
  /**
   * Custom poster order shared between desktop and mobile. Stored as a
   * list of zero-based indices into the static poster array defined in
   * the public component. Indices not present in the list fall back to
   * the default static order and are appended at the end.
   */
  posterOrder?: number[];
  /**
   * @deprecated Legacy fields kept for backwards compatibility with
   * configs saved before order was unified across breakpoints. Read at
   * runtime as a fallback when `posterOrder` is missing; never written.
   */
  desktopOrder?: number[];
  /** @deprecated See `desktopOrder`. */
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
  /** Shared custom poster order (see EventosConfig.posterOrder). */
  posterOrder?: number[];
  /** @deprecated Legacy per-breakpoint orders, kept for backwards compat. */
  desktopOrder?: number[];
  /** @deprecated See `desktopOrder`. */
  mobileOrder?: number[];
}

/**
 * Configuration for the Premios page poster grid.
 * Mirrors AvisosConfig/EventosConfig so admins can independently tune
 * the columns + gap per breakpoint for the Premios poster gallery.
 */
export interface PremiosConfig {
  desktopColumns: number;
  mobileColumns: number;
  desktopGap: EventosGap;
  mobileGap: EventosGap;
  /** Shared custom poster order across breakpoints. */
  posterOrder?: number[];
  /** @deprecated Legacy per-breakpoint orders. */
  desktopOrder?: number[];
  /** @deprecated See `desktopOrder`. */
  mobileOrder?: number[];
}

/**
 * Configuration for the Hoteles page poster grid.
 * Mirrors PremiosConfig/AvisosConfig/EventosConfig so admins can
 * independently tune the columns + gap per breakpoint for the
 * Hoteles poster gallery.
 */
export interface HotelesConfig {
  desktopColumns: number;
  mobileColumns: number;
  desktopGap: EventosGap;
  mobileGap: EventosGap;
  /** Shared custom poster order across breakpoints. */
  posterOrder?: number[];
  /** @deprecated Legacy per-breakpoint orders. */
  desktopOrder?: number[];
  /** @deprecated See `desktopOrder`. */
  mobileOrder?: number[];
}

/**
 * ThemeConfig
 * Active color palette for the tournament's public-facing pages.
 * Each color is stored as an HSL string of the form "H S% L%"
 * (matching the values consumed by tailwind hsl(var(--token))).
 */
export interface ThemeConfig {
  /** Human-readable palette name, e.g. "Verde Bosque" or "Custom". */
  name: string;
  /** Primary brand color (buttons, links, headers). */
  primary: string;
  /** Secondary accent color (badges, highlights). */
  secondary: string;
  /** Tertiary accent color (gold/highlight). */
  accent: string;
  /** Page background color. */
  background: string;
}

/**
 * StatsConfig
 * Per-tournament overrides for the home Stats ribbon numbers.
 * Each field is optional: a `null` or missing value means
 * "use the auto-computed value from the tournament API".
 * Numeric value (>= 0) forces the displayed number.
 *
 *  - totalHistoricalPlayers: Big number for "Participantes Registrados".
 *  - yearsHistory:           Raw years of history (used to derive display).
 *  - maxCategories:          Max categories shown ribbon (e.g. "12+").
 */
export interface StatsConfig {
  totalHistoricalPlayers?: number | null;
  yearsHistory?: number | null;
  maxCategories?: number | null;
}

/**
 * PopupConfig
 * -----------------------------------------------------------------------
 * Site-wide POP UP overlay configuration set from Admin > POP tab.
 * The overlay renders once per page load on any route listed in `paths`,
 * centered over a darkened backdrop, with a close button. When
 * `durationSeconds > 0`, it auto-dismisses after that many seconds.
 *  - enabled:         master on/off switch.
 *  - imageUrl:        absolute or app-relative URL of the popup image.
 *  - paths:           list of route pathnames where the popup is shown.
 *                     Use ['*'] (or empty) to show on every page.
 *  - durationSeconds: auto-close delay in seconds (0 = stay until X click).
 *  - widthPx:         rendered max-width in pixels (image scales to fit,
 *                     clamped by the viewport on small screens).
 *  - altText:         accessible alt text for the popup image.
 */
export interface PopupConfig {
  enabled: boolean;
  imageUrl: string;
  paths: string[];
  durationSeconds: number;
  widthPx: number;
  altText?: string;
  /** Optional caption text shown together with the image inside the popup card. */
  text?: string;
  /** Caption font size in pixels (12–48). */
  textFontSize?: number;
  /** Font family preset for the caption. */
  textFontFamily?: 'sans' | 'serif' | 'mono' | 'display';
  /** Bold weight toggle for the caption. */
  textBold?: boolean;
  /** Italic toggle for the caption. */
  textItalic?: boolean;
  /** Hex color for the caption text. */
  textColor?: string;
  /** Horizontal text alignment. */
  textAlign?: 'left' | 'center' | 'right';
  /** Whether the caption sits above or below the image inside the popup card. */
  textPosition?: 'above' | 'below';
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
  premios_config: PremiosConfig | null;
  hoteles_config: HotelesConfig | null;
  theme_config: ThemeConfig | null;
  stats_config: StatsConfig | null;
  popup_config: PopupConfig | null;
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
  premios_config?: PremiosConfig | null;
  hoteles_config?: HotelesConfig | null;
  theme_config?: ThemeConfig | null;
  stats_config?: StatsConfig | null;
  popup_config?: PopupConfig | null;
}

// ============= Constants =============

const MENU_ORDER_KEY = 'tournament_menu_item_order';
const VISIBILITY_KEY = 'tournament_page_visibility';
const GROUPS_KEY = 'tournament_menu_groups';
const PAGE_GROUPS_KEY = 'tournament_page_group_assignments';
const LIVE_SCORING_KEY = 'tournament_live_scoring_config';
const SPONSORS_CONFIG_KEY = 'tournament_sponsors_config';
const EVENTOS_CONFIG_KEY = 'tournament_eventos_config';
const AVISOS_CONFIG_KEY = 'tournament_avisos_config';
const PREMIOS_CONFIG_KEY = 'tournament_premios_config';
const HOTELES_CONFIG_KEY = 'tournament_hoteles_config';

/** Read a JSON response and fail loudly when production returns HTML/text */
const readJsonResponse = async <T,>(res: Response, fallbackMessage: string): Promise<T> => {
  const text = await res.text();
  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`${fallbackMessage}: respuesta no es JSON válido`);
  }

  if (!res.ok) {
    throw new Error(data?.error || fallbackMessage);
  }

  return data as T;
};

// ============= Fetch Functions =============

/**
 * Fetch full site config from server
 */
const fetchSiteConfig = async (): Promise<SiteConfig> => {
  const res = await fetch(`${API_BASE_URL}/site_config.php`);
  return readJsonResponse<SiteConfig>(res, 'No se pudo cargar site_config.php');
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
  return readJsonResponse<{ domain: string; saved: boolean }>(res, 'No se pudo guardar site_config.php');
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

      // Sync torneoid from production DB and clear stale local values if missing
      persistTorneoId(config.torneoid);

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

      // Sync premios config
      if (config.premios_config) {
        localStorage.setItem(PREMIOS_CONFIG_KEY, JSON.stringify(config.premios_config));
      }

      // Sync hoteles config
      if (config.hoteles_config) {
        localStorage.setItem(HOTELES_CONFIG_KEY, JSON.stringify(config.hoteles_config));
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
