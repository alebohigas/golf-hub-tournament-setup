/**
 * useConvocatoriaContent Hook
 * ------------------------------------------------------------
 * Fetches per-tournament convocatoria section content from the
 * `convocatoria_content` MySQL table via /api/convocatoria_content.php.
 *
 * Returns a Map<section_id, ConvocatoriaContentRow> so the page
 * can render DB-backed content when present and fall back to
 * mockData for sections without a row.
 *
 * Auto-refresh (no localStorage involved):
 *  - `pollMs` re-fetches on an interval (public page keeps itself fresh).
 *  - window focus / tab visibility triggers an immediate re-fetch.
 *  - a BroadcastChannel signal (`CONVOCATORIA_CHANNEL`) fired by
 *    saveSection/clearSection makes every open tab (public page included)
 *    reload the config the instant an admin toggles a section.
 */

import { useEffect, useState, useCallback } from 'react';
import { useTorneoId } from './useTorneoId';

// ============= Types =============

/** Row returned by /api/convocatoria_content.php (one per section). */
export interface ConvocatoriaContentRow {
  section_id: string;
  section_type: string;
  title: string | null;
  /** Parsed JSON payload (shape depends on section_type). */
  content: unknown;
  sort_order: number;
  enabled: boolean;
}

interface ApiResponse {
  sections: ConvocatoriaContentRow[];
}

/** Cross-tab channel name used to announce convocatoria config changes. */
const CONVOCATORIA_CHANNEL = 'convocatoria_content_changed';

/** Options accepted by {@link useConvocatoriaContent}. */
export interface UseConvocatoriaContentOptions {
  /** Poll interval in ms. `0`/undefined disables polling. */
  pollMs?: number;
  /** Re-fetch when the tab regains focus/visibility. Default: true. */
  refreshOnFocus?: boolean;
}

/**
 * Notifies all open tabs (and this one) that convocatoria config changed.
 * Safe no-op when BroadcastChannel is unavailable.
 */
const broadcastConvocatoriaChange = () => {
  try {
    const ch = new BroadcastChannel(CONVOCATORIA_CHANNEL);
    ch.postMessage({ type: 'changed', at: Date.now() });
    ch.close();
  } catch {
    /* unsupported browser: polling/focus refresh still covers it */
  }
};

// ============= Hook =============

/**
 * Loads convocatoria content for the active tournament.
 * Returns the raw rows, a lookup map by `section_id`, plus loading state.
 */
export const useConvocatoriaContent = (options: UseConvocatoriaContentOptions = {}) => {
  const { pollMs = 0, refreshOnFocus = true } = options;
  const { torneoId } = useTorneoId();
  const [rows, setRows] = useState<ConvocatoriaContentRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  /** Bump to force a refetch after admin save/delete. */
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (!torneoId) {
      setRows([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    /**
     * Cache-buster (`_t`) + `no-store` para garantizar que el GET traiga
     * siempre la versión más reciente guardada en el editor de /admin.
     */
    fetch(
      `/api/convocatoria_content.php?torneoid=${encodeURIComponent(torneoId)}&_t=${Date.now()}`,
      { cache: 'no-store' }
    )
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<ApiResponse>;
      })
      .then((data) => {
        if (cancelled) return;
        setRows(Array.isArray(data?.sections) ? data.sections : []);
      })
      .catch((err) => {
        if (cancelled) return;
        // Soft-fail: keep rows empty. The page no longer falls back to mock
        // data — sections without DB content are simply hidden.
        setError(err?.message ?? 'fetch failed');
        setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [torneoId, refreshTick]);

  /** Force re-fetch from the API (call after save/delete). */
  const refresh = useCallback(() => setRefreshTick((n) => n + 1), []);

  /** Interval polling so the public page picks up admin changes on its own. */
  useEffect(() => {
    if (!pollMs || pollMs <= 0) return;
    const id = window.setInterval(refresh, pollMs);
    return () => window.clearInterval(id);
  }, [pollMs, refresh]);

  /** Re-fetch on focus / tab visibility so a returning viewer sees the truth. */
  useEffect(() => {
    if (!refreshOnFocus) return;
    const onFocus = () => refresh();
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refreshOnFocus, refresh]);

  /** Live cross-tab sync: admin toggle → public page reloads immediately. */
  useEffect(() => {
    let ch: BroadcastChannel | null = null;
    try {
      ch = new BroadcastChannel(CONVOCATORIA_CHANNEL);
      ch.onmessage = () => refresh();
    } catch {
      ch = null;
    }
    return () => {
      try {
        ch?.close();
      } catch {
        /* noop */
      }
    };
  }, [refresh]);

  /** Lookup by section_id for O(1) access from the page renderer. */
  const bySectionId = new Map<string, ConvocatoriaContentRow>();
  rows.forEach((r) => bySectionId.set(r.section_id, r));

  /**
   * True when a DB row exists for `sectionId` AND its decoded content is
   * not empty. Used by the /admin badge to distinguish "BD" vs "Vacío".
   */
  const hasContent = useCallback((sectionId: string): boolean => {
    const row = bySectionId.get(sectionId);
    if (!row) return false;
    const c = row.content;
    if (c === null || c === undefined) return false;
    if (Array.isArray(c)) return c.length > 0;
    if (typeof c === 'object') {
      const obj = c as Record<string, unknown>;
      if (Array.isArray(obj.items)) return (obj.items as unknown[]).length > 0;
      return Object.values(obj).some((v) =>
        typeof v === 'string'
          ? v.trim() !== ''
          : Array.isArray(v)
            ? v.length > 0
            : v != null
      );
    }
    if (typeof c === 'string') return c.trim() !== '';
    return true;
  }, [bySectionId]);

  /**
   * Upsert a convocatoria_content row.
   * Returns true on success. On failure, returns false and surfaces a
   * console error — caller is expected to toast the user.
   */
  const saveSection = useCallback(async (input: {
    sectionId: string;
    sectionType?: string;
    title?: string | null;
    content: unknown;
    sortOrder?: number;
    enabled?: boolean;
  }): Promise<boolean> => {
    if (!torneoId) return false;
    try {
      const res = await fetch('/api/convocatoria_content.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: 'admin2025',
          torneoid: Number(torneoId),
          section_id: input.sectionId,
          section_type: input.sectionType ?? 'generic',
          title: input.title ?? null,
          content: input.content,
          sort_order: input.sortOrder ?? 0,
          enabled: input.enabled !== false,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      refresh();
      broadcastConvocatoriaChange();
      return true;
    } catch (err) {
      console.error('saveSection failed', err);
      return false;
    }
  }, [torneoId, refresh]);

  /**
   * Delete a convocatoria_content row so the section returns to "Vacío"
   * (hidden on the public page).
   */
  const clearSection = useCallback(async (sectionId: string): Promise<boolean> => {
    if (!torneoId) return false;
    try {
      const res = await fetch('/api/convocatoria_content.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: 'admin2025',
          torneoid: Number(torneoId),
          section_id: sectionId,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      refresh();
      broadcastConvocatoriaChange();
      return true;
    } catch (err) {
      console.error('clearSection failed', err);
      return false;
    }
  }, [torneoId, refresh]);

  return {
    rows,
    bySectionId,
    loading,
    error,
    hasContent,
    saveSection,
    clearSection,
    refresh,
  };
};