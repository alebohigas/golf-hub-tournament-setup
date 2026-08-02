/**
 * dbDateTime.ts
 * -----------------------------------------------------------------------------
 * Helpers para mostrar fechas/horas que vienen directamente de MySQL
 * (columnas DATETIME como `tarjetas.fec_ult_act` y `tarjetas.fecha_cap`).
 *
 * REGLA CLAVE (zona horaria):
 * Estos valores son "wall clock" del servidor del club: NO traen zona horaria
 * y NO deben pasar por `new Date(...)`. Si se parsean, iOS/Safari y Android
 * los interpretan de forma distinta (Safari incluso devuelve `Invalid Date`
 * con el formato "YYYY-MM-DD HH:MM:SS") y el usuario ve la hora corrida
 * ±N horas. Por eso el formateo es puramente textual: se muestra tal cual
 * quedó registrado en la base de datos, en cualquier dispositivo.
 */

/**
 * Normaliza un DATETIME de MySQL a texto legible "YYYY-MM-DD HH:MM"
 * sin conversión de zona horaria (idéntico en iPhone/Safari, Android y desktop).
 *
 * Acepta: "2026-07-25 17:00:00", "2026-07-25T17:00:00",
 *         "2026-07-25T17:00:00Z", "2026-07-25T17:00:00-06:00".
 * Devuelve cadena vacía si el valor no es utilizable ("0000-00-00", null, etc.).
 */
export function formatDbDateTime(value?: string | null): string {
  if (!value) return '';
  // Unifica el separador ISO y descarta cualquier sufijo de zona horaria
  // (Z / ±HH:MM) que algún endpoint pudiera añadir: la hora ya es local del club.
  const raw = String(value)
    .trim()
    .replace('T', ' ')
    .replace(/(?:Z|[+-]\d{2}:?\d{2})$/i, '')
    .trim();

  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})[ ]?(\d{2}):(\d{2})?/);
  if (!match) return '';

  const [, y, m, d, hh, mm] = match;
  if (y === '0000' || m === '00' || d === '00') return '';
  return `${y}-${m}-${d} ${hh}:${mm ?? '00'}`;
}
