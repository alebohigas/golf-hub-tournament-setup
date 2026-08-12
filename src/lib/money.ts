/**
 * money.ts
 * ------------------------------------------------------------
 * Utilidades compartidas de importes para la convocatoria.
 *
 * Contrato de datos: en la base de datos (JSON de
 * `convocatoria_content.content`) los importes se guardan SIEMPRE como
 * cadena DECIMAL canónica sin símbolos ni separadores de miles
 * (ej. `"13550.00"`, `"8000.00"`), equivalente a un DECIMAL(12,2).
 * El formato de moneda (`$13,550.00`) se aplica solo al presentar.
 *
 * Se acepta lectura tolerante de valores legados que ya venían
 * formateados (`"$13,550.00"`) para no romper convocatorias existentes.
 */

/**
 * MONEY_INPUT_RE
 * Formatos aceptados al capturar: dígitos con separadores de miles
 * opcionales, hasta 2 decimales y símbolo `$` opcional.
 * Ej: `13550`, `13,550`, `$13,550.00`, `8000.5`
 */
export const MONEY_INPUT_RE =
  /^\$?\s*\d{1,3}(,\d{3})*(\.\d{1,2})?$|^\$?\s*\d+(\.\d{1,2})?$/;

/**
 * parseMoney
 * Convierte un texto de importe (capturado o leído de BD) a número.
 * Devuelve `null` si el valor está vacío o no es un importe válido.
 */
export function parseMoney(raw: unknown): number | null {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  const s = String(raw ?? '').trim();
  if (!s) return null;
  if (!MONEY_INPUT_RE.test(s)) return null;
  const n = Number(s.replace(/[$,\s]/g, ''));
  return Number.isFinite(n) ? n : null;
}

/**
 * toDecimalString
 * Normaliza un importe al formato DECIMAL que se persiste en la BD
 * (`13550` → `"13550.00"`). Devuelve `''` si el valor no es válido.
 */
export function toDecimalString(raw: unknown): string {
  const n = parseMoney(raw);
  return n === null ? '' : n.toFixed(2);
}

/**
 * formatMoney
 * Presenta un importe como moneda con separador de miles y 2 decimales
 * (`"13550.00"` → `$13,550.00`). Si el valor no es un importe válido
 * devuelve el texto original tal cual (para notas libres en la tabla).
 */
export function formatMoney(raw: unknown): string {
  const n = parseMoney(raw);
  if (n === null) return String(raw ?? '');
  return `$${n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
