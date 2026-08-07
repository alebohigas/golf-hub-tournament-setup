/**
 * LastUpdatedStamp
 * Sello de "Última actualización" usado en TODOS los reportes de /competicion
 * (Oyes, Oyes-X, Driver Precisión, Driver Distancia, Approach, Putt y
 * Torneo Final Putt / Brackets).
 *
 * Reglas de estilo (definidas por el cliente):
 * - Color fijo #900000 (rojo vino) en todos los torneos y reportes.
 * - Centrado debajo de la tabla / bracket correspondiente.
 */

interface LastUpdatedStampProps {
  /** Fecha y hora de última actualización proveniente del API (string ya formateado). */
  value?: string | null;
  /** Etiqueta previa al valor. Default: "Última actualización". */
  label?: string;
  /** Clases extra de layout (márgenes, tamaño de texto). */
  className?: string;
}

/** Hexcolor obligatorio para el sello de última actualización. */
export const LAST_UPDATED_COLOR = '#900000';

const LastUpdatedStamp = ({
  value,
  label = 'Última actualización',
  className = 'text-center text-sm mt-4',
}: LastUpdatedStampProps) => {
  if (!value) return null;

  return (
    <p className={`font-semibold ${className}`} style={{ color: LAST_UPDATED_COLOR }}>
      {label}: {value}
    </p>
  );
};

export default LastUpdatedStamp;
