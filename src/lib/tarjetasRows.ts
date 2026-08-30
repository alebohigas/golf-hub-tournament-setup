/**
 * tarjetasRows — catálogo de renglones de la tarjeta de juego
 * -----------------------------------------------------------------------------
 * Define las claves, etiquetas y orden por defecto de los renglones de la tabla
 * de hoyos de las tarjetas imprimibles. Lo comparten:
 *   · Admin → Tarjetas (`AdminTarjetasPrint`) para configurar el orden.
 *   · /admin/tarjetas-impresion (`AdminTarjetasImpresion`) para maquetar.
 * Así la vista previa, la impresión y el PDF usan SIEMPRE la misma maqueta.
 */

/** Claves válidas de renglón de la tarjeta. */
export type TarjetaRowKey =
  | 'hoyo'
  | 'par'
  | 'yardas'
  | 'partime'
  | 'ventaja'
  | 'gross'
  | 'handicap'
  | 'neto'
  | 'puntos';

/** Etiqueta impresa de cada renglón. */
export const TARJETA_ROW_LABELS: Record<TarjetaRowKey, string> = {
  hoyo: 'Hoyo',
  par: 'Par',
  yardas: 'Yardas',
  partime: 'Par Time',
  ventaja: 'Ventaja',
  gross: 'Score Gross',
  handicap: 'Handicap',
  neto: 'Score Neto',
  puntos: 'Puntos',
};

/** Orden por defecto solicitado por el club. */
export const TARJETA_ROWS_DEFAULT: TarjetaRowKey[] = [
  'hoyo',
  'yardas',
  'partime',
  'ventaja',
  'gross',
  'handicap',
  'neto',
  'puntos',
];

/** Todas las claves disponibles (para los selectores de Admin). */
export const TARJETA_ROWS_ALL = Object.keys(TARJETA_ROW_LABELS) as TarjetaRowKey[];

/**
 * Normaliza un orden de renglones: descarta claves inválidas y duplicadas y
 * regresa el orden por defecto si no queda ninguna.
 */
export const normalizeTarjetaRows = (
  input: readonly string[] | string | null | undefined,
): TarjetaRowKey[] => {
  const list = typeof input === 'string' ? input.split(',') : (input ?? []);
  const seen = new Set<string>();
  const out: TarjetaRowKey[] = [];
  for (const raw of list) {
    const key = String(raw).trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    if (!(key in TARJETA_ROW_LABELS)) continue;
    seen.add(key);
    out.push(key as TarjetaRowKey);
  }
  return out.length ? out : [...TARJETA_ROWS_DEFAULT];
};
