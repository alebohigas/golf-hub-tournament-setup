/**
 * useValorStable Hook
 * ------------------------------------------------------------
 * Fetches the Stableford points row (torneos.valorstable) for the
 * active tournament from /api/valorstable.php.
 *
 * Returns a normalized array of `{ label, value }` rows suitable for
 * rendering as a table. Column names in the legacy `valorstable` table
 * vary between databases, so we probe several common synonyms for each
 * canonical row (Bogey, Par, Birdie, Águila, Doble Águila).
 *
 * If the endpoint returns no data (missing table / no row / fetch
 * error), `rows` is an empty array and the caller should hide the UI.
 */

import { useEffect, useState } from 'react';
import { useTorneoId } from './useTorneoId';

/** Canonical rows we render, mapped to candidate column keys in the DB. */
const CANONICAL_ROWS: Array<{ label: string; keys: string[] }> = [
  { label: 'Bogey',          keys: ['bogey', 'vbogey', 'valor_bogey', 'bogeys'] },
  { label: 'Par',            keys: ['par', 'vpar', 'valor_par'] },
  { label: 'Birdie',         keys: ['birdie', 'vbirdie', 'valor_birdie', 'birdies'] },
  { label: 'Águila',         keys: ['aguila', 'eagle', 'vaguila', 'valor_aguila', 'aguilas'] },
  { label: 'Doble Águila',   keys: ['dobleaguila', 'doble_aguila', 'dobleeagle', 'doble_eagle', 'albatros', 'valor_dobleaguila'] },
];

/** Row prepared for rendering in the Stableford points table. */
export interface StablefordPointRow {
  label: string;
  value: number;
}

/**
 * Given the raw row from the API, resolve each canonical row's value by
 * trying candidate keys (case-insensitive). Missing entries are skipped.
 */
const normalizeRow = (raw: Record<string, unknown> | null): StablefordPointRow[] => {
  if (!raw) return [];
  // Build a lowercased key index for case-insensitive lookups.
  const lower: Record<string, unknown> = {};
  Object.keys(raw).forEach((k) => { lower[k.toLowerCase()] = raw[k]; });

  const out: StablefordPointRow[] = [];
  for (const { label, keys } of CANONICAL_ROWS) {
    for (const k of keys) {
      const v = lower[k.toLowerCase()];
      if (v !== undefined && v !== null && v !== '') {
        const n = Number(v);
        if (Number.isFinite(n)) {
          out.push({ label, value: n });
          break;
        }
      }
    }
  }
  return out;
};

export const useValorStable = () => {
  const { torneoId } = useTorneoId();
  const [rows, setRows] = useState<StablefordPointRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!torneoId) { setRows([]); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/valorstable.php?torneoid=${encodeURIComponent(torneoId)}`)
      .then((r) => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((data: { row: Record<string, unknown> | null }) => {
        if (cancelled) return;
        setRows(normalizeRow(data?.row ?? null));
      })
      .catch(() => { if (!cancelled) setRows([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [torneoId]);

  return { rows, loading };
};