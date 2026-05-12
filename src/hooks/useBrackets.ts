/**
 * Brackets Hooks — Match Play / Knockout
 * ----------------------------------------------------------------------------
 * React Query hooks for the brackets.php endpoint family.
 * Used by both the admin tab (toggle is_bracket, configure size/seeding,
 * generate matchups) and the public BracketView in /competencias.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import {
  getBracketsListPrizesUrl,
  getBracketConfigUrl,
  getBracketsActionUrl,
  API_BASE_URL,
} from '@/config/api';
import { POLL_ACTIVE } from '@/config/api';

// ============= Types =============

/** A row from list_prizes — one per prize across all 6 tables */
export interface BracketPrizeRow {
  prize_table: 'oyes' | 'oyesx' | 'approach' | 'putt' | 'driver' | 'driverp';
  prize_id: number;
  descripcion: string;
  hoyo: number | null;
  categoriaid: number | null;
  premio: number | null;
  campo: number | null;
  is_bracket: 0 | 1;
  has_config: boolean;
  config_id: number | null;
  size: number | null;
  status: string | null;
}

/** A bracket_config row */
export interface BracketConfig {
  id: number;
  torneoid: number;
  prize_table: string;
  prize_id: number;
  size: number;
  seed_source: 'standings' | 'manual' | 'random';
  advancement: 'manual' | 'auto';
  seed_categoriaid: number | null;
  seed_premio: number | null;
  seed_hoyo: number | null;
  seed_campo: number | null;
  advancement_source: string | null;
  status: 'draft' | 'active' | 'complete';
  created_at: string;
  updated_at: string;
}

/** A bracket_matches row (with joined player names) */
export interface BracketMatch {
  id: number;
  bracket_config_id: number;
  round: number;
  position: number;
  player1_id: number | null;
  player2_id: number | null;
  player1_seed: number | null;
  player2_seed: number | null;
  player1_score: number | null;
  player2_score: number | null;
  player1_name: string | null;
  player2_name: string | null;
  winner_id: number | null;
  next_match_id: number | null;
  next_slot: number | null;
  status: 'pending' | 'in_progress' | 'complete';
}

// ============= Hooks =============

/** List every prize across all 6 bracket-eligible tables. */
export const useBracketPrizes = () =>
  useQuery<{ prizes: BracketPrizeRow[] }>({
    queryKey: ['brackets', 'list_prizes'],
    queryFn: () => apiFetch(getBracketsListPrizesUrl()),
    staleTime: POLL_ACTIVE,
  });

/** Fetch config + matches for a single bracketed prize. */
export const useBracketConfig = (
  prizeTable: string | null,
  prizeId: number | null,
  enabled = true,
) =>
  useQuery<{ config: BracketConfig | null; matches: BracketMatch[] }>({
    queryKey: ['brackets', 'config', prizeTable, prizeId],
    queryFn: () => apiFetch(getBracketConfigUrl(prizeTable!, prizeId!)),
    enabled: enabled && !!prizeTable && prizeId != null,
    staleTime: POLL_ACTIVE,
    refetchInterval: POLL_ACTIVE,
  });

/** POST helper — sends JSON body to brackets.php?action=X */
const postBracketAction = async <T>(action: string, body: Record<string, unknown>): Promise<T> => {
  const res = await fetch(getBracketsActionUrl(action), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let parsed: any = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = null; }
  if (!res.ok) {
    throw new Error(parsed?.error || `Bracket action '${action}' failed (${res.status})`);
  }
  return parsed as T;
};

/** Mutation: toggle is_bracket flag on a prize row */
export const useSetBracketFlag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { prize_table: string; prize_id: number; is_bracket: 0 | 1; password: string }) =>
      postBracketAction('set_flag', vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brackets', 'list_prizes'] });
    },
  });
};

/** Mutation: upsert bracket_config */
export const useSaveBracketConfig = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: Partial<BracketConfig> & { password: string }) =>
      postBracketAction('save_config', vars as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brackets'] });
    },
  });
};

/** Mutation: (re)generate matches from seed source */
export const useGenerateBracket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { bracket_config_id: number; password: string }) =>
      postBracketAction('generate', vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brackets'] });
    },
  });
};

/** Mutation: record a match score (auto-advances winner if config.advancement='auto') */
export const useRecordBracketScore = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { match_id: number; player1_score: number; player2_score: number; password: string }) =>
      postBracketAction('record_score', vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brackets'] });
    },
  });
};