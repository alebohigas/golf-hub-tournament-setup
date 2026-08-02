/**
 * Brackets Hooks — Putt Finales (Caballero / Dama)
 * ----------------------------------------------------------------------------
 * React Query hooks contra /api/brackets.php para los dos brackets fijos
 * por torneo (M y F), sembrados desde el ranking acumulado de putt.
 *
 * Usados por:
 *   - AdminBrackets ("Brackets Putt"): config de tamaño + visibilidad,
 *     generación, captura de scores, override manual de ganador.
 *   - BracketView en /competicion: render público read-only por sexo.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import {
  getPuttFinalesUrl,
  getPuttFinalesAdminUrl,
  getBracketsActionUrl,
  POLL_ACTIVE,
} from '@/config/api';

// ============= Tipos =============

/** Fila bracket_config (subconjunto que usamos). */
export interface BracketConfig {
  id: number;
  torneoid: number;
  prize_table: string;        // siempre 'putt_finales'
  prize_id: number;           // 1=M, 2=F
  sexo: 'M' | 'F' | null;
  size: number;
  status: 'draft' | 'active' | 'complete';
  visible: 0 | 1;
  created_at: string;
  updated_at: string;
}

/** Fila bracket_matches (con nombres joinados). */
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

/** Shape de la respuesta para un sexo. */
export interface PuttBracketSide {
  config: BracketConfig | null;
  matches: BracketMatch[];
  visible: boolean;
  /** Sólo presente en endpoint admin. */
  candidates_count?: number;
  /**
   * Lista de clasificados que ya entraron al ranking acumulado del bracket
   * (1..bracket_size). Se va llenando día a día y se publica bajo el bracket
   * en /competicion → Putt Finales (Caballeros/Damas).
   */
  qualifiers?: BracketQualifier[];
  /** Cupos totales del bracket (16/32/64/128). */
  bracket_size?: number;
}

/** Fila de clasificado para Putt Finales (mostrada bajo el bracket). */
export interface BracketQualifier {
  rank: number;
  name: string;
  distance: number | null;
  /** Fecha en formato YYYY-MM-DD (o null si la columna no aplica). */
  fecha: string | null;
  /**
   * Fecha+hora completa `YYYY-MM-DD HH:MM:SS` cuando `puttjug.fecha` es
   * DATETIME. Usada para mostrar la hora de registro junto al día.
   */
  fecha_full?: string | null;
  /** Categoría/grupo del jugador (puttjug.premiosjugcol). */
  categoria?: string | null;
}

/** Respuesta combinada M/F. */
export interface PuttFinalesData {
  M: PuttBracketSide;
  F: PuttBracketSide;
}

// ============= Hooks (lectura) =============

/** Público: bracket actual para un sexo (M o F). */
export const usePuttFinales = () =>
  useQuery<PuttFinalesData>({
    queryKey: ['brackets', 'putt_finales', 'public'],
    queryFn: () => apiFetch(getPuttFinalesUrl()),
    staleTime: POLL_ACTIVE,
    refetchInterval: POLL_ACTIVE,
  });

/** Admin: mismo + candidates_count por sexo. */
export const usePuttFinalesAdmin = () =>
  useQuery<PuttFinalesData>({
    queryKey: ['brackets', 'putt_finales', 'admin'],
    queryFn: () => apiFetch(getPuttFinalesAdminUrl()),
    staleTime: POLL_ACTIVE,
  });

// ============= POST helper =============

/** Envía JSON al endpoint /api/brackets.php?action=X. */
const postBracketAction = async <T,>(action: string, body: Record<string, unknown>): Promise<T> => {
  const res = await fetch(getBracketsActionUrl(action), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let parsed: any = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = null; }
  if (!res.ok) {
    throw new Error(parsed?.error || `Bracket action '${action}' falló (${res.status})`);
  }
  return parsed as T;
};

// ============= Hooks (mutaciones) =============

/** Upsert config (size, visible) para un sexo. NO regenera matches. */
export const useSavePuttConfig = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      torneoid: number;
      sexo: 'M' | 'F';
      size: number;
      visible: boolean;
      password: string;
    }) => postBracketAction('save_putt_config', vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brackets'] }),
  });
};

/** Regenera todos los matches desde el ranking acumulado para un sexo. */
export const useGeneratePuttBracket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { torneoid: number; sexo: 'M' | 'F'; password: string }) =>
      postBracketAction('generate_putt', vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brackets'] }),
  });
};

/** Captura scores; el backend marca ganador y avanza automáticamente. */
export const useRecordBracketScore = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      match_id: number;
      player1_score: number | null;
      player2_score: number | null;
      password: string;
    }) => postBracketAction('record_score', vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brackets'] }),
  });
};

/** Override manual del ganador (walkover / corrección). */
export const useSetBracketWinner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { match_id: number; winner_id: number; password: string }) =>
      postBracketAction('set_winner', vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brackets'] }),
  });
};

/**
 * Resetea un match: limpia scores + ganador y deshace el avance al
 * siguiente bracket. Útil cuando se capturó por error y se quiere volver
 * a empezar ese emparejamiento desde cero.
 */
export const useResetBracketMatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { match_id: number; password: string }) =>
      postBracketAction('reset_match', vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brackets'] }),
  });
};

/**
 * Habilita el match por 3er lugar del bracket Putt (Caballero o Dama):
 * crea la fila con `match_num = 99` en la última ronda y siembra a los
 * perdedores de las dos semifinales. Idempotente.
 */
export const useEnablePuttThirdPlace = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { torneoid: number; sexo: 'M' | 'F'; password: string }) =>
      postBracketAction('enable_third_place', vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brackets'] }),
  });
};