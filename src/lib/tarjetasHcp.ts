/**
 * tarjetasHcp
 * ---------------------------------------------------------------------------
 * Origen del valor **HCP. NETO** que se imprime en el encabezado de la
 * tarjeta. Se configura en Admin → Tarjetas y viaja al reporte como
 * `hcpfield=`, de modo que la vista previa, la impresión y el PDF usen
 * exactamente la misma fuente de datos.
 *
 * Importante: nunca se usa el índice (`indexjgo`), que es HCP índice y no
 * neto. Las opciones disponibles son columnas de la vista de salidas con el
 * neto ya calculado, más la suma de golpes de ventaja por hoyo.
 */

/** Campos de la BD válidos para el HCP. NETO. */
export type TarjetaHcpField =
  | 'auto'
  | 'hcpneto'
  | 'handicapneto'
  | 'vtjajug'
  | 'ventajas';

/** Todas las opciones, en el orden en que se muestran en Admin. */
export const TARJETA_HCP_FIELDS: TarjetaHcpField[] = [
  'auto',
  'hcpneto',
  'handicapneto',
  'vtjajug',
  'ventajas',
];

/** Valor por defecto: primer campo neto disponible en la BD. */
export const TARJETA_HCP_FIELD_DEFAULT: TarjetaHcpField = 'auto';

/** Etiquetas legibles para el selector de Admin. */
export const TARJETA_HCP_FIELD_LABELS: Record<TarjetaHcpField, string> = {
  auto: 'Automático (hcpneto → handicapneto → vtjajug → ventajas)',
  hcpneto: 'Columna hcpneto',
  handicapneto: 'Columna handicapneto',
  vtjajug: 'Columna vtjajug',
  ventajas: 'Suma de ventajas por hoyo',
};

/** Normaliza un valor guardado o recibido por URL a un campo válido. */
export const normalizeTarjetaHcpField = (
  value: unknown,
): TarjetaHcpField => {
  const v = String(value ?? '').toLowerCase() as TarjetaHcpField;
  return TARJETA_HCP_FIELDS.includes(v) ? v : TARJETA_HCP_FIELD_DEFAULT;
};
