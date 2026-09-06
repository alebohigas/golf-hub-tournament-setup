/**
 * salidasMatchPlay
 * ---------------------------------------------------------------
 * Enfrentamientos de MATCH PLAY administrados desde el panel
 * (Admin → ALIEN SYSTEM → Match Play) y guardados en la base
 * (`site_config.salidas_matchplay_config`).
 *
 * ¿Por qué existe?
 *  La vista pública de Salidas puede recibir los matches reales desde
 *  `salidas_det.php` (cruce con `elimin_salidas_cat`). Cuando ese endpoint
 *  no está actualizado en el hosting, esta configuración permite definir a
 *  mano el orden de los enfrentamientos de cada grupo de salida, de modo
 *  que la página muestre "VS" y el separador por match SIN depender de
 *  ningún archivo externo.
 *
 * Estructura guardada:
 *  {
 *    byCaljgoid: {
 *      "1234": {                       // caljuego.id (día + categoría)
 *        enabled: true,                // forzar render MATCH PLAY (VS)
 *        groups: {                     // salidagrupo.id
 *          "987": ["JUGADOR A", "JUGADOR B", "JUGADOR C", "JUGADOR D"]
 *        }
 *      }
 *    }
 *  }
 *
 * El orden de cada grupo se lee de 2 en 2: 1º vs 2º, 3º vs 4º, …
 * ---------------------------------------------------------------
 */

/** Configuración de un caljuego (día + categoría). */
export interface SalidasMatchPlayEntry {
  /** true = la vista pública agrupa por match e inserta "VS". */
  enabled?: boolean;
  /** Orden manual de jugadores por grupo de salida (`salidagrupo.id`). */
  groups?: Record<string, string[]>;
}

/** Configuración completa (todas las categorías del torneo). */
export interface SalidasMatchPlayConfig {
  byCaljgoid?: Record<string, SalidasMatchPlayEntry>;
}

/** Jugador mínimo requerido por los helpers (compatible con SalidasPlayer). */
interface PlayerLike {
  name: string;
  matchNo?: number;
  matchSide?: number;
}

/** Normaliza un nombre para comparar (sin acentos, mayúsculas, un espacio). */
export const normalizeMatchName = (name: string): string =>
  (name ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

/** Devuelve la configuración de un caljuego (o undefined). */
export const getMatchPlayEntry = (
  config: SalidasMatchPlayConfig | null | undefined,
  caljgoid: string | number | null | undefined
): SalidasMatchPlayEntry | undefined => {
  if (!config?.byCaljgoid || caljgoid == null) return undefined;
  return config.byCaljgoid[String(caljgoid)];
};

/**
 * Aplica el orden manual de un grupo: reordena los jugadores según la lista
 * configurada y les asigna `matchNo` / `matchSide` (2 jugadores por match).
 * Los jugadores que no aparecen en la lista se conservan al final.
 */
export const applyMatchPlayOrder = <T extends PlayerLike>(
  players: T[],
  order: string[] | undefined
): T[] => {
  const list = players ?? [];
  if (!list.length) return list;

  let ordered: T[];
  if (order?.length) {
    const pending = [...list];
    ordered = [];
    order.forEach((name) => {
      const key = normalizeMatchName(name);
      const idx = pending.findIndex((p) => normalizeMatchName(p.name) === key);
      if (idx >= 0) ordered.push(...pending.splice(idx, 1));
    });
    ordered.push(...pending);
  } else {
    ordered = [...list];
  }

  // 2 jugadores por match, en el orden resultante.
  return ordered.map((p, i) => ({
    ...p,
    matchNo: Math.floor(i / 2) + 1,
    matchSide: (i % 2) + 1,
  }));
};

/** Grupo mínimo requerido (compatible con SalidasGroup). */
interface GroupLike<T extends PlayerLike> {
  id: string;
  players?: T[];
}

/**
 * Aplica la configuración manual a todos los grupos de una categoría.
 * Si no hay configuración habilitada, devuelve los grupos sin cambios.
 */
export const applyMatchPlayConfigToGroups = <T extends PlayerLike, G extends GroupLike<T>>(
  groups: G[] | undefined,
  entry: SalidasMatchPlayEntry | undefined
): G[] => {
  const list = groups ?? [];
  if (!entry?.enabled) return list;
  return list.map((g) => ({
    ...g,
    players: applyMatchPlayOrder<T>((g.players ?? []) as T[], entry.groups?.[String(g.id)]),
  }));
};
