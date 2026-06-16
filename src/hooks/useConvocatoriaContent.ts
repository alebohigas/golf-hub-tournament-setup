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

import { useEffect, useState } from 'react';
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
        // Soft-fail: keep rows empty so Convocatoria falls back to mockData.
        setError(err?.message ?? 'fetch failed');
        setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [torneoId]);

  /** Lookup by section_id for O(1) access from the page renderer. */
  const bySectionId = new Map<string, ConvocatoriaContentRow>();
  rows.forEach((r) => bySectionId.set(r.section_id, r));

  return { rows, bySectionId, loading, error };
};