/**
 * useConvocatoriaContent Hook
 * ------------------------------------------------------------
 * Fetches per-tournament convocatoria section content from the
 * `convocatoria_content` MySQL table via /api/convocatoria_content.php.
 *
 * Returns a Map<section_id, ConvocatoriaContentRow> so the page
 * can render DB-backed content when present and fall back to
 * mockData for sections without a row.
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

// ============= Hook =============

/**
 * Loads convocatoria content for the active tournament.
 * Returns the raw rows, a lookup map by `section_id`, plus loading state.
 */
export const useConvocatoriaContent = () => {
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

    fetch(`/api/convocatoria_content.php?torneoid=${encodeURIComponent(torneoId)}`)
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

  /** Force re-fetch from the API (call after save/delete). */
  const refresh = useCallback(() => setRefreshTick((n) => n + 1), []);

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