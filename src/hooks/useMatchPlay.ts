/**
 * useMatchPlay
 * ---------------------------------------------------------------------------
 * Hooks para la página /matchplay y su panel admin.
 *
 *   useMatchPlayCategories()  → categorías MATCH PLAY con jugadores
 *   useMatchPlayBracket(id)   → matches D1/D2 de una categoría
 *   useSetMatchWinner()       → POST set_winner
 *   useResetMatch()           → POST reset_match
 *
 * Toda la auth admin se manda con la contraseña real guardada en la sesión
 * actual del superadmin, o con `staff_token` si es usuario temporal.
 */
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';
import { publishBracketChange, subscribeBracketChanges } from '@/lib/bracketLive';
import { getTorneoId } from '@/hooks/useTorneoId';
import { getSuperAdminPassword } from '@/lib/superAdminAuth';
import { useStaffAuth } from '@/contexts/StaffAuthContext';

// ============= Types =============

/** Una categoría MATCH PLAY listada en la vista principal. */
export interface MatchPlayCategory {
  categoryId: string;
  categoryName: string;
  shortName: string;
  system: string;
  format: string;
  tipoed: string | number | null;
  gender: string | null;
  playerCount: number;
  matchCount: number;
  isParejas: boolean;
}

/** Un competidor dentro de un match (jugador o pareja). */
export interface BracketPlayer {
  id: string | number | null;
  name: string | null;
  clubLogo: string;
  club: string;
}

/** Un match de eliminación directa. */
export interface BracketMatch {
  matchId: number;
  player1: BracketPlayer;
  player2: BracketPlayer;
  winner: string | number | null;
  hole: string | number | null;
  result: string | null;
  /** Fecha + hora del match (formato 'YYYY-MM-DD HH:mm'), si está capturada. */
  fecha: string | null;
  round: number;
  position: number;
}

/** Respuesta completa del bracket de una categoría. */
export interface BracketResponse {
  categoryId: string;
  categoryName: string;
  shortName: string;
  system: string;
  format: string;
  tipoed: string | null;
  isParejas: boolean;
  matches: BracketMatch[];
  d1: BracketMatch[];
  d2: BracketMatch[];
}

// ============= Queries =============

/** Lista categorías MATCH PLAY del torneo activo. */
export const useMatchPlayCategories = () => {
  const torneoId = getTorneoId();
  return useQuery<MatchPlayCategory[]>({
    queryKey: ['matchplay-categories', torneoId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/matchplay_categories.php?torneoid=${torneoId}`);
      if (!res.ok) throw new Error('Failed to load match play categories');
      return res.json();
    },
    enabled: !!torneoId,
    staleTime: 30_000,
  });
};

/**
 * Devuelve el bracket completo (D1 + D2) de una categoría.
 *
 * Se actualiza por PUSH: cada captura del admin publica en `bracketLive` y
 * esta vista invalida al instante (incluye el match por 3er lugar 199/299).
 * `fallbackPollMs` es una red de seguridad opcional, desactivada por defecto.
 */
export const useMatchPlayBracket = (catid: string | null, fallbackPollMs = 0) => {
  const torneoId = getTorneoId();
  const qc = useQueryClient();
  useEffect(
    () => subscribeBracketChanges(() => qc.invalidateQueries({ queryKey: ['matchplay-bracket'] })),
    [qc],
  );
  return useQuery<BracketResponse>({
    queryKey: ['matchplay-bracket', torneoId, catid],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE_URL}/resultados_ed.php?catid=${catid}&torneoid=${torneoId}`
      );
      if (!res.ok) throw new Error('Failed to load bracket');
      return res.json();
    },
    enabled: !!torneoId && !!catid,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: fallbackPollMs > 0 ? fallbackPollMs : false,
  });
};

// ============= Mutations (admin) =============

/** Body común para acciones admin — incluye torneoid + auth. */
const buildAdminBody = (
  staffSession: ReturnType<typeof useStaffAuth>['session'],
  extra: Record<string, unknown>
): Record<string, unknown> => {
  const base: Record<string, unknown> = {
    torneoid: getTorneoId(),
    // Lee la contraseña activa del superadmin (sessionStorage o default).
    // Así no dependemos del fetch-interceptor para reemplazar 'admin2025'.
    password: getSuperAdminPassword(),
    ...extra,
  };
  if (staffSession?.token) base.staff_token = staffSession.token;
  return base;
};

/** Construye URL admin y conserva ?debug=1 para diagnosticar errores del API. */
const buildMatchPlayAdminUrl = (
  action: 'set_winner' | 'reset_match' | 'enable_third_place'
): string => {
  const params = new URLSearchParams({ action });
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1') {
    params.set('debug', '1');
  }
  return `${API_BASE_URL}/matchplay_admin.php?${params.toString()}`;
};

/** Marca el ganador de un match (set_winner). */
export const useSetMatchWinner = () => {
  const qc = useQueryClient();
  const { session } = useStaffAuth();
  return useMutation({
    mutationFn: async (vars: {
      catid: string | number;
      matchx: number;
      side: 1 | 2;
      hoyo?: number | null;
      fecha?: string | null;
    }) => {
      const res = await fetch(buildMatchPlayAdminUrl('set_winner'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildAdminBody(session, vars)),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo marcar al ganador');
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['matchplay-bracket'] });
      /** Push inmediato a las vistas públicas (/matchplay y showcase). */
      publishBracketChange('matchplay_admin');
    },
  });
};

/** Resetea un match (quita ganador/hoyo/resultado). */
export const useResetMatch = () => {
  const qc = useQueryClient();
  const { session } = useStaffAuth();
  return useMutation({
    mutationFn: async (vars: { catid: string | number; matchx: number }) => {
      const res = await fetch(buildMatchPlayAdminUrl('reset_match'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildAdminBody(session, vars)),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo resetear el match');
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['matchplay-bracket'] });
      /** Push inmediato a las vistas públicas (/matchplay y showcase). */
      publishBracketChange('matchplay_admin');
    },
  });
};

/**
 * Habilita el match por 3er lugar en el draw indicado de la categoría:
 * crea la fila `matchx=199` (MATCH-1) ó `matchx=299` (MATCH-2) y linkea las
 * dos semifinales con `tl_grupo`. Idempotente: si ya existe, no rompe nada;
 * simplemente re-propaga a los semifinalistas perdedores.
 */
export const useEnableThirdPlace = () => {
  const qc = useQueryClient();
  const { session } = useStaffAuth();
  return useMutation({
    mutationFn: async (vars: { catid: string | number; draw?: 1 | 2 }) => {
      const res = await fetch(buildMatchPlayAdminUrl('enable_third_place'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildAdminBody(session, { draw: 1, ...vars })),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo habilitar el match por 3er lugar');
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['matchplay-bracket'] });
      /** Push inmediato a las vistas públicas (/matchplay y showcase). */
      publishBracketChange('matchplay_admin');
    },
  });
};

// ============= Helpers =============

/**
 * Agrupa matches en rondas a partir del offset del matchid (1..15 para 16,
 * 1..7 para 8, etc.). Detecta el tamaño del bracket automáticamente.
 *
 * Para un bracket de tamaño N (N=2^k):
 *   Ronda 1 → N/2 matches (offsets 1..N/2)
 *   Ronda 2 → N/4 matches
 *   ...
 *   Final  → 1 match
 */
export const groupMatchesByRound = (matches: BracketMatch[]): BracketMatch[][] => {
  if (!matches || !matches.length) return [];
  // Normalizamos offset (quitamos el centenar 1xx o 2xx).
  const offsets = matches.map(m => m.matchId % 100);
  const maxOffset = Math.max(...offsets);
  // Tamaño del bracket = siguiente potencia de 2 de (maxOffset+1).
  let size = 2;
  while (size - 1 < maxOffset) size *= 2;
  const rounds: BracketMatch[][] = [];
  let start = 1;
  let perRound = size / 2;
  while (perRound >= 1) {
    const end = start + perRound - 1;
    const slice = matches
      .filter(m => {
        const off = m.matchId % 100;
        return off >= start && off <= end;
      })
      .sort((a, b) => a.matchId - b.matchId);
    if (slice.length) rounds.push(slice);
    start = end + 1;
    perRound = Math.floor(perRound / 2);
  }
  return rounds;
};

/** Nombre legible para cada ronda según total de rondas. */
export const roundLabel = (roundIndex: number, totalRounds: number): string => {
  const fromEnd = totalRounds - roundIndex; // 1 = final, 2 = semi, etc.
  if (fromEnd === 1) return 'Final';
  if (fromEnd === 2) return 'Semifinales';
  if (fromEnd === 3) return 'Cuartos';
  if (fromEnd === 4) return 'Octavos';
  return `Ronda ${roundIndex + 1}`;
};