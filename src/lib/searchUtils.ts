/**
 * Search Utilities
 * Helpers for sanitizing and matching player name searches.
 * Handles real-world DB issues: leading/trailing spaces, double spaces,
 * accented characters, mixed case.
 */

/**
 * Normalize a string for accent-insensitive, whitespace-tolerant matching.
 * - Trims leading/trailing whitespace
 * - Collapses any internal whitespace runs into a single space
 * - Lowercases
 * - Strips diacritics (e.g. "Núñez" → "nunez")
 *
 * @param text Raw string (may be null/undefined for safety)
 * @returns Normalized lowercase ASCII-ish string with single spaces
 */
export const normalizeSearchText = (text: string | null | undefined): string => {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/\s+/g, ' ')             // collapse whitespace
    .trim()
    .toLowerCase();
};

/**
 * Test whether a player name matches the search query using normalized text.
 * Both haystack and needle are normalized before substring comparison.
 */
export const matchesPlayerName = (
  playerName: string | null | undefined,
  query: string | null | undefined
): boolean => {
  const q = normalizeSearchText(query);
  if (!q) return false;
  return normalizeSearchText(playerName).includes(q);
};

/**
 * Build a deduplicated, alphabetically-sorted list of unique player names
 * from a raw list. Names are cleaned (whitespace collapsed/trimmed) for display
 * but original casing/accents are preserved.
 *
 * Deduplication is based on the normalized form so "Juan  Perez" and
 * "juan perez " collapse to a single entry.
 */
export const buildUniqueNameSuggestions = (rawNames: (string | null | undefined)[]): string[] => {
  const seen = new Map<string, string>(); // normalized → cleaned display name
  for (const raw of rawNames) {
    if (!raw) continue;
    const display = raw.replace(/\s+/g, ' ').trim();
    if (!display) continue;
    const key = normalizeSearchText(display);
    if (!seen.has(key)) seen.set(key, display);
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b, 'es'));
};

/**
 * Filter a list of suggestion names by a query (normalized substring match).
 * Returns at most `limit` suggestions for performance.
 */
export const filterSuggestions = (
  suggestions: string[],
  query: string,
  limit = 8
): string[] => {
  const q = normalizeSearchText(query);
  if (!q) return [];
  const matches: string[] = [];
  for (const name of suggestions) {
    if (normalizeSearchText(name).includes(q)) {
      matches.push(name);
      if (matches.length >= limit) break;
    }
  }
  return matches;
};
