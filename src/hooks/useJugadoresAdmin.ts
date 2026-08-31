/**
 * useJugadoresAdmin / useCamposAdmin
 * ---------------------------------------------------------------
 * Hooks de la sección ALIEN SYSTEM del panel /admin:
 *   · useJugadoresAdmin  → listado de jugadores (par, handicap, categoría)
 *   · useSaveJugadorAdmin→ edición de un jugador
 *   · useCamposAdmin     → campos con horarios, categorías, tees y hoyos
 *
 * Backends: /api/jugadores_admin.php y /api/campos_admin.php
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCamposAdminUrl, getJugadoresAdminUrl } from '@/config/api';

// ============= Jugadores =============

/** Jugador tal como lo devuelve jugadores_admin.php. */
export interface AdminJugador {
  id: number;
  numjugador: string;
  nombre: string;
  apellido: string;
  jugador: string;
  club: string;
  sexo: string;
  estatus: string;
  categoriaid: number;
  categoria: string;
  abreviatura: string | null;
  sistema: string | null;
  /** Handicap Index (jugadores.indexjgo) */
  hi: string | null;
  /** Handicap de Juego calculado por la BD */
  hj: string | null;
  /** Handicap Neto calculado por la BD */
  hn: string | null;
  teesalidaid: number;
  teeName: string | null;
  teeColor: string | null;
  campoid: number;
  campo: string;
  /** Par del campo para el tee de la categoría */
  par: number | null;
  rating: string | null;
  slope: string | null;
}

/** Categoría (catálogo) con datos del campo asociado. */
export interface AdminJugadorCategoria {
  id: number;
  categoria: string;
  abreviatura: string | null;
  sistema: string | null;
  porcentaje: string | null;
  salida: number;
  teeName: string | null;
  teeColor: string | null;
  campoid: number;
  campo: string;
  par: number | null;
  rating: string | null;
  slope: string | null;
}

interface JugadoresAdminResponse {
  players: AdminJugador[];
  categories: AdminJugadorCategoria[];
  tees: { id: number; tee: string; color: string | null }[];
}

/** Lee los jugadores del torneo activo, con filtro por categoría y búsqueda. */
export const useJugadoresAdmin = (opts: { catid?: string; q?: string } = {}) =>
  useQuery<JugadoresAdminResponse>({
    queryKey: ['jugadores-admin', opts.catid ?? '', opts.q ?? ''],
    queryFn: async () => {
      const res = await fetch(getJugadoresAdminUrl(opts), { cache: 'no-store' });
      if (!res.ok) throw new Error('No se pudieron cargar los jugadores');
      return res.json();
    },
    staleTime: 10_000,
  });

/** Payload de edición de un jugador. */
export interface JugadorMutation {
  torneoid: number;
  password: string;
  id: number;
  action?: 'update';
  nombre?: string;
  apellido?: string;
  club?: string;
  sexo?: string;
  estatus?: string;
  indexjgo?: string | number | null;
  categoriaid?: number;
  teesalidaid?: number;
}

/** Guarda los cambios de un jugador. */
export const useSaveJugadorAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: JugadorMutation) => {
      const res = await fetch(getJugadoresAdminUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', ...payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as any).error || 'No se pudo guardar');
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jugadores-admin'] });
      qc.invalidateQueries({ queryKey: ['players'] });
    },
  });
};

// ============= Campos =============

/** Un hoyo de un tee de salida. */
export interface AdminCampoHole {
  numero: number;
  par: number;
  yardas: number;
  ventaja: number;
}

/** Tee de salida del campo con rating/slope/par y sus 18 hoyos. */
export interface AdminCampoTee {
  id: number;
  tee: string | null;
  color: string | null;
  rating: string | null;
  slope: string | null;
  par: number | null;
  holes: AdminCampoHole[];
  totalPar: number;
  totalYardas: number;
}

/** Horario del calendario de juego (caljuego) para el campo. */
export interface AdminCampoHorario {
  fecha: string;
  fechaFormato: string;
  categoriaid: number;
  categoria: string;
  horaInicio1: string | null;
  horaInicio10: string | null;
  salhoyos: string | null;
  numfoursome: number | null;
}

/** Campo con toda la información que alimenta las tarjetas. */
export interface AdminCampo {
  id: number;
  campo: string;
  horarios: AdminCampoHorario[];
  categorias: {
    id: number;
    categoria: string;
    abreviatura: string | null;
    sistema: string | null;
    salida: number;
    teeName: string | null;
    teeColor: string | null;
    rating: string | null;
    slope: string | null;
    par: number | null;
  }[];
  tees: AdminCampoTee[];
  /** Tiempos por hoyo editables por el staff (tabla `hoyos`). */
  hoyos: { numero: number; par: number | null; minutos: string | null }[];
  /**
   * PAR TIME resuelto con la misma cadena que el Time Line:
   * `hoyos` → `hoyosxsalida` → estimación por par. `fuente` indica de
   * dónde salió el número, para detectar valores estimados.
   */
  parTime: {
    numero: number;
    par: number | null;
    minutos: number;
    fuente: 'hoyos' | 'hoyosxsalida' | 'estimado';
  }[];
}

/** Lee los campos del torneo activo con horarios, categorías, tees y hoyos. */
export const useCamposAdmin = () =>
  useQuery<{ campos: AdminCampo[] }>({
    queryKey: ['campos-admin'],
    queryFn: async () => {
      const res = await fetch(getCamposAdminUrl(), { cache: 'no-store' });
      if (!res.ok) throw new Error('No se pudieron cargar los campos');
      return res.json();
    },
    staleTime: 30_000,
  });
