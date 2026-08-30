/**
 * tarjetasHeader — catálogo de campos del ENCABEZADO de la tarjeta de juego
 * -----------------------------------------------------------------------------
 * El encabezado de cada tarjeta es una rejilla de 3 renglones. Cada "campo"
 * ocupa una columna completa de esa rejilla y define internamente qué se pinta
 * en los renglones 1-2 (bloque superior) y en el renglón 3 (bloque inferior).
 *
 * Lo comparten:
 *   · Admin → Tarjetas (`AdminTarjetasPrint`) para elegir campos y su orden.
 *   · /admin/tarjetas-impresion (`AdminTarjetasImpresion`) para maquetar.
 * Así la vista previa, la impresión y el PDF usan SIEMPRE la misma maqueta.
 */

/** Claves válidas de campo del encabezado. */
export type TarjetaHeaderKey =
  | 'hoyohora'
  | 'jugador'
  | 'vtja'
  | 'categoria'
  | 'tee'
  | 'sistema'
  | 'folio';

/** Etiqueta mostrada en Admin para cada campo. */
export const TARJETA_HEADER_LABELS: Record<TarjetaHeaderKey, string> = {
  hoyohora: 'Hoyo + hora',
  jugador: 'Jugador (ID, nombre y club)',
  vtja: 'HCP. NETO',
  categoria: 'Categoría + marcas de salida',
  tee: 'Marcas de salida (solo)',
  sistema: 'Sistema de juego',
  folio: 'Folio',
};

/**
 * Ancho de la columna de cada campo dentro de la rejilla del encabezado.
 * `1fr` significa que el campo absorbe el espacio libre (jugador).
 */
export const TARJETA_HEADER_WIDTHS: Record<TarjetaHeaderKey, string> = {
  hoyohora: '30mm',
  jugador: 'minmax(0,1fr)',
  /*
    HCP. NETO: ancho fijo de 20 mm — suficiente para la etiqueta completa
    ("HCP. NETO" en una sola línea, sin cortes) en cualquier tamaño de hoja,
    ya que el encabezado se mide en milímetros y no en porcentajes.
  */
  vtja: '20mm',
  /*
    Categoría: se le cede ~1 columna de ancho al bloque del jugador
    (que es `1fr` y por lo tanto se encoge solo) para que el nombre de la
    categoría quepa completo sin recortes.
  */
  categoria: '58mm',
  tee: '30mm',
  sistema: '26mm',
  folio: '24mm',
};

/** Orden por defecto (el solicitado por el club). */
export const TARJETA_HEADER_DEFAULT: TarjetaHeaderKey[] = [
  'hoyohora',
  'vtja',
  'jugador',
  'categoria',
];

/** Todas las claves disponibles (para los selectores de Admin). */
export const TARJETA_HEADER_ALL = Object.keys(
  TARJETA_HEADER_LABELS,
) as TarjetaHeaderKey[];

/**
 * Normaliza una lista de campos del encabezado: descarta claves inválidas y
 * duplicadas y regresa el orden por defecto si no queda ninguna.
 */
export const normalizeTarjetaHeader = (
  input: readonly string[] | string | null | undefined,
): TarjetaHeaderKey[] => {
  const list = typeof input === 'string' ? input.split(',') : (input ?? []);
  const seen = new Set<string>();
  const out: TarjetaHeaderKey[] = [];
  for (const raw of list) {
    const key = String(raw).trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    if (!(key in TARJETA_HEADER_LABELS)) continue;
    seen.add(key);
    out.push(key as TarjetaHeaderKey);
  }
  return out.length ? out : [...TARJETA_HEADER_DEFAULT];
};

// ============= Marcas de salida (color de tee) =============

/**
 * Color visual de cada tipo de marca de salida según el nombre que guarda la
 * base (`campo_tee.tee` / `salidas`). Se usa para pintar el "chip" de color en
 * el encabezado de la tarjeta junto a la leyenda del tee.
 */
const TEE_SWATCHES: { match: RegExp; color: string; label: string }[] = [
  { match: /negr|black/i, color: '#111111', label: 'Negras' },
  { match: /azul|blue/i, color: '#1D4ED8', label: 'Azules' },
  { match: /blanc|white/i, color: '#FFFFFF', label: 'Blancas' },
  { match: /dorad|oro|gold/i, color: '#C9A227', label: 'Doradas' },
  { match: /plat|silver|gris|grey|gray/i, color: '#9CA3AF', label: 'Plata' },
  { match: /roj|red/i, color: '#DC2626', label: 'Rojas' },
  { match: /verd|green/i, color: '#15803D', label: 'Verdes' },
  { match: /amarill|yellow/i, color: '#EAB308', label: 'Amarillas' },
  { match: /naranj|orange/i, color: '#EA580C', label: 'Naranjas' },
  { match: /morad|violet|purpl/i, color: '#7E22CE', label: 'Moradas' },
  { match: /caf|brown|bronc/i, color: '#78350F', label: 'Cafés' },
  { match: /rosa|pink/i, color: '#DB2777', label: 'Rosas' },
];

/** Resultado de resolver la marca de salida de una tarjeta. */
export interface TeeMark {
  /** Texto a imprimir (nombre del tee tal como viene de la BD). */
  label: string;
  /** Color del chip; `null` cuando no se reconoce el tipo de salida. */
  color: string | null;
}

/**
 * Resuelve la leyenda + color de la marca de salida.
 * @param tee     Nombre del tee (`card.tee`), p. ej. "NEGRAS".
 * @param teeSal  Salida/tee alterno de la BD (`card.teeSal`) como respaldo.
 */
export const resolveTeeMark = (tee?: string, teeSal?: string): TeeMark => {
  const raw = (tee || '').trim() || (teeSal || '').trim();
  if (!raw) return { label: '', color: null };
  const hit = TEE_SWATCHES.find((s) => s.match.test(raw));
  return { label: raw.toUpperCase(), color: hit ? hit.color : null };
};
