/**
 * useValorStable Hook
 * ------------------------------------------------------------
 * Fetches the Stableford points rows (torneos.valorstable) for the
 * active tournament from /api/valorstable.php.
 *
 * The legacy table stores ONE ROW PER difpar:
 *   torneoid | difpar | valor
 * so we render exactly what the DB has (difpar → valor), sorted from the
 * highest difpar to the lowest, matching the club's reference table.
 *
 * Backwards compatible: if a database instead uses a single wide row with
 * named columns (bogey/par/birdie/...), those are normalized too.
 *
 * If the endpoint returns no data (missing table / no rows / fetch error),
 * `rows` is empty and the caller should hide the UI.
 */

import { useEffect, useState } from 'react';
import { useTorneoId } from './useTorneoId';

/** Legacy wide-row fallback: canonical labels mapped to candidate columns. */
const CANONICAL_ROWS: Array<{ label: string; keys: string[] }> = [
  { label: 'Bogey',          keys: ['bogey', 'vbogey', 'valor_bogey', 'bogeys'] },
  { label: 'Par',            keys: ['par', 'vpar', 'valor_par'] },
  { label: 'Birdie',         keys: ['birdie', 'vbirdie', 'valor_birdie', 'birdies'] },
  { label: 'Águila',         keys: ['aguila', 'eagle', 'vaguila', 'valor_aguila', 'aguilas'] },
  { label: 'Doble Águila',   keys: ['dobleaguila', 'doble_aguila', 'dobleeagle', 'doble_eagle', 'albatros', 'valor_dobleaguila'] },
];

/**
 * Row prepared for rendering in the Stableford points table.
 * `label` = difpar formatted (e.g. "+3", "0", "-2"); `value` = puntos.
 */
export interface StablefordPointRow {
  label: string;
  value: number;
}

/**
 * Formats a difpar for display exactly like the club's reference table:
 * plain signed integers (3, 2, 1, 0, -1, ...) with no leading "+".
 */
const formatDifpar = (n: number): string => String(n);

/** Maps API rows with { difpar, valor } into renderable rows. */
const normalizeDifparRows = (raw: Array<Record<string, unknown>>): StablefordPointRow[] => {
  const out: StablefordPointRow[] = [];
  raw.forEach((r) => {
    const lower: Record<string, unknown> = {};
    Object.keys(r).forEach((k) => { lower[k.toLowerCase()] = r[k]; });
    const d = Number(lower['difpar']);
    const v = Number(lower['valor'] ?? lower['puntos'] ?? lower['value']);
    if (Number.isFinite(d) && Number.isFinite(v)) {
      out.push({ label: formatDifpar(d), value: v });
    }
  });
  return out;
};

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
      .then((data: { rows?: Array<Record<string, unknown>>; row: Record<string, unknown> | null }) => {
        if (cancelled) return;
        const apiRows = Array.isArray(data?.rows) ? data.rows : [];
        // Preferred: one row per difpar (legacy `valorstable` schema).
        const difpar = normalizeDifparRows(apiRows);
        if (difpar.length) { setRows(difpar); return; }
        // Fallback: single wide row with named columns.
        setRows(normalizeRow(data?.row ?? apiRows[0] ?? null));
      })
      .catch(() => { if (!cancelled) setRows([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [torneoId]);

  return { rows, loading };
};