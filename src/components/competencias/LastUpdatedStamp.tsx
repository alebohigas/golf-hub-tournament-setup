/**
 * LastUpdatedStamp
 * Sello de "Última actualización" usado en TODOS los reportes de /competicion
 * (Oyes, Oyes-X, Driver Precisión, Driver Distancia, Approach, Putt y
 * Torneo Final Putt / Brackets).
 *
 * Reglas de estilo:
 * - Color configurable desde /admin > Paleta de Colores
 *   (site_config.theme_config.lastUpdatedColor). Default histórico:
 *   #900000 (rojo vino).
 * - Centrado debajo de la tabla / bracket correspondiente.
 */

import { useSiteConfig } from '@/hooks/useSiteConfig';

interface LastUpdatedStampProps {
  /** Fecha y hora de última actualización proveniente del API (string ya formateado). */
  value?: string | null;
  /** Etiqueta previa al valor. Default: "Última actualización". */
  label?: string;
  /** Clases extra de layout (márgenes, tamaño de texto). */
  className?: string;
  /** Sobrescribe el color configurado (uso puntual/preview). */
  color?: string;
}

/** Color por defecto del sello cuando el admin no configuró uno. */
export const LAST_UPDATED_COLOR = '#900000';

const LastUpdatedStamp = ({
  value,
  label = 'Última actualización',
  className = 'text-center text-sm mt-4',
  color,
}: LastUpdatedStampProps) => {
  /** Color configurado por dominio (Admin > Paleta de Colores). */
  const { data: siteConfig } = useSiteConfig();
  const resolvedColor = color || siteConfig?.theme_config?.lastUpdatedColor || LAST_UPDATED_COLOR;

  if (!value) return null;

  return (
    <p className={`font-semibold ${className}`} style={{ color: resolvedColor }}>
      {label}: {value}
    </p>
  );
};

export default LastUpdatedStamp;
