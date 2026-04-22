/**
 * posterOrder.ts
 * -------------------------------------------------------------
 * Small utility that resolves a user-defined poster ordering against
 * the static poster list shared by Eventos and Avisos.
 *
 * The ordering is stored in `site_config` as an array of indices into
 * the static array (e.g. `[2, 0, 1, 3]`). This keeps the persisted data
 * tiny and decoupled from the actual asset URLs.
 *
 * Resolution rules (intentionally tolerant):
 *  - Indices outside the array are ignored.
 *  - Duplicated indices are deduped (first occurrence wins).
 *  - Any item NOT referenced in the order list is appended at the end
 *    in its original static order. This means a partial order is valid
 *    and additional posters added later remain visible by default.
 */

/**
 * Reorder a static list according to an optional list of indices.
 * Returns a NEW array — the input is not mutated.
 *
 * @param items   The original static list (e.g. ATRACCIONES).
 * @param order   Optional list of indices (zero-based) into `items`.
 * @returns       A reordered copy of `items`.
 */
export function applyOrder<T>(items: T[], order?: number[]): T[] {
  if (!order || order.length === 0) return items.slice();

  const seen = new Set<number>();
  const result: T[] = [];

  // First pass: honor the requested order, skipping invalid/duplicate entries.
  for (const idx of order) {
    if (
      typeof idx === 'number' &&
      Number.isInteger(idx) &&
      idx >= 0 &&
      idx < items.length &&
      !seen.has(idx)
    ) {
      seen.add(idx);
      result.push(items[idx]);
    }
  }

  // Second pass: append any items missing from the order list, in their
  // original static position. Keeps the list complete even if `order` is
  // partial or stale (e.g. when posters are added/removed later).
  for (let i = 0; i < items.length; i++) {
    if (!seen.has(i)) result.push(items[i]);
  }

  return result;
}

/**
 * Build the canonical "identity" order (`[0, 1, 2, ..., n-1]`) for a list.
 * Used as the starting point when the admin has not customized an order yet.
 */
export function identityOrder(length: number): number[] {
  return Array.from({ length }, (_, i) => i);
}

/**
 * Resolve a possibly-partial saved order into a complete, deduped order
 * over `[0, length-1]`. Useful for admin UIs that need a stable list to
 * drag around.
 */
export function resolveOrder(length: number, order?: number[]): number[] {
  if (!order || order.length === 0) return identityOrder(length);

  const seen = new Set<number>();
  const result: number[] = [];

  for (const idx of order) {
    if (
      typeof idx === 'number' &&
      Number.isInteger(idx) &&
      idx >= 0 &&
      idx < length &&
      !seen.has(idx)
    ) {
      seen.add(idx);
      result.push(idx);
    }
  }

  for (let i = 0; i < length; i++) {
    if (!seen.has(i)) result.push(i);
  }

  return result;
}