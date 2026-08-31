/**
 * useCategoriasAdmin
 * ---------------------------------------------------------------
 * Hooks de lectura/escritura para el CRUD de CATEGORÍAS usado por
 * /admin → pestaña "Categorías". Backed by /api/categorias_admin.php.
 *
 * Rating / Slope / Par se guardan en `campo_tee` por (campo, tee de
 * salida); el endpoint hace el UPSERT automáticamente.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCategoriasAdminUrl } from '@/config/api';

/** Una categoría editable en el panel. */
export interface AdminCategoria {
  id: number;
  categoria: string;
  abreviatura: string | null;
  sistema: string | null;
  formato: string | null;
  estilo: string | null;
  hcpIdxMin: string | null;
  hcpIdxMax: string | null;
  porcentaje: string | null;
  hoyosajugar: number | null;
  sexo: string | null;
  gross: number;
  maxjugadores: number | null;
  /** id del tee de salida (tabla `salidas`) */
  salida: number;
  teeName: string | null;
  teeColor: string | null;
  /** id del campo (tabla `campos`) al que aplican rating/slope/par */
  campoid: number;
  rating: string | null;
  slope: string | null;
  parcampo: string | null;
  estatus: number;
  playerCount: number;
  /** Valores crudos de TODAS las columnas de torneos.categorias. */
  raw?: Record<string, string | number | null>;
}

/** Metadato de una columna real de la tabla `categorias`. */
export interface CategoriaColumn {
  name: string;
  type: string;
  numeric: boolean;
}

/** Catálogo de tees de salida. */
export interface TeeOption { id: number; tee: string; color: string | null }
/** Catálogo de campos. */
export interface CampoOption { id: number; campo: string }

interface CategoriasAdminResponse {
  categories: AdminCategoria[];
  tees: TeeOption[];
  campos: CampoOption[];
  /** Columnas reales de la tabla (para la vista/edición completa). */
  columns?: CategoriaColumn[];
}

/** Lee categorías + catálogos del torneo activo. */
export const useCategoriasAdmin = () =>
  useQuery<CategoriasAdminResponse>({
    queryKey: ['categorias-admin'],
    queryFn: async () => {
      const res = await fetch(getCategoriasAdminUrl(), { cache: 'no-store' });
      if (!res.ok) throw new Error('No se pudieron cargar las categorías');
      return res.json();
    },
    staleTime: 10_000,
  });

/** Payload de create/update/delete. */
export interface CategoriaMutation {
  action: 'create' | 'update' | 'delete';
  torneoid: number;
  password: string;
  id?: number;
  force?: boolean;
  categoria?: string;
  abreviatura?: string;
  sistema?: string;
  formato?: string;
  estilo?: string;
  sexo?: string;
  hcpIdxMin?: string | number | null;
  hcpIdxMax?: string | number | null;
  porcentaje?: string | number | null;
  hoyosajugar?: string | number | null;
  maxjugadores?: string | number | null;
  gross?: number;
  salida?: number;
  campoid?: number;
  rating?: string | number | null;
  slope?: string | number | null;
  parcampo?: string | number | null;
  /** Edición genérica: cualquier columna real de `categorias`. */
  fields?: Record<string, string | number | null>;
}

/** Crea / edita / elimina una categoría. */
export const useSaveCategoriaAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CategoriaMutation) => {
      const res = await fetch(getCategoriasAdminUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as any).error || 'No se pudo guardar');
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categorias-admin'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
