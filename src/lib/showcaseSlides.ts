/**
 * showcaseSlides.ts
 * ----------------------------------------------------------------------------
 * Tipos compartidos + helpers (encode/decode + ids estables) para el sistema
 * de rotación de pantallas (Showcase 300 + Brackets + Mejor Score Diario).
 *
 * Diseño:
 *  - Cada "slide" tiene un id estable que describe completamente qué
 *    renderizar. El renderer no necesita configuración extra; consulta
 *    los endpoints normales y filtra según el id.
 *  - La configuración (qué slides rotar + segundos por slide) se serializa
 *    como JSON y se codifica en base64 dentro del hash de la URL, de modo
 *    que un mismo link es autosuficiente y no requiere persistencia en DB
 *    (decisión del usuario: "Solo sesión local").
 */

// ============= Tipos de slide =============

/** Tipos soportados de slide. */
export type ShowcaseSlideKind =
  | 's300'      // Reporte 300 (driver/approach/putt/oyes/oyesx), un premio.
  | 'mejor'     // Mejor Score Diario, un día.
  | 'bracket'   // Bracket putt (M/F), full / group / semis / final.
  | 'qual';     // Clasificados Putt Finales por sexo (M/F).

/** Descriptor de un slide rotable, tal como vive en la config persistida. */
export interface ShowcaseSlide {
  /** Id estable. Ver helpers buildXxxSlideId() abajo. */
  id: string;
  /** Segundos a mostrar este slide. Si se omite usa defaultSeconds. */
  seconds?: number;
}

/** Configuración completa de rotación. */
export interface ShowcaseConfig {
  /** Segundos por defecto cuando un slide no define los suyos. */
  defaultSeconds: number;
  /** Lista ordenada de slides a rotar. */
  slides: ShowcaseSlide[];
}

/** Slide enriquecido con metadata para el admin (label, fuente). */
export interface ShowcaseSlideMeta extends ShowcaseSlide {
  /** Etiqueta humana para mostrar en el panel de admin. */
  label: string;
  /** Agrupación (Driver / Approach / Brackets M / etc.) para el listado. */
  group: string;
}

// ============= Ids de slides =============

/** Build slide id para reportes 300. `tipo` ∈ driver|approach|putt|oyes|oyesx. */
export const buildS300SlideId = (tipo: string, prizeIdx: number): string =>
  `s300:${tipo}:${prizeIdx}`;

/** Build slide id para "Mejor Score Diario" por fecha (YYYY-MM-DD). */
export const buildMejorSlideId = (fecha: string): string => `mejor:${fecha}`;

/**
 * Build slide id para brackets. `kind` puede ser:
 *  - 'full'    → bracket completo (sólo cuando size = 16).
 *  - 'groupN'  → grupo N (0-indexed) cuando size > 16.
 *  - 'semis'   → semifinales (sólo size > 16).
 *  - 'final'   → final + campeón (sólo size > 16).
 */
export const buildBracketSlideId = (sexo: 'M' | 'F', kind: string): string =>
  `bracket:${sexo}:${kind}`;

/**
 * Build slide id para "Clasificados Putt Finales" (lista de seeds
 * que ya entraron al ranking acumulado). `sexo` = 'M' o 'F'.
 */
export const buildQualSlideId = (sexo: 'M' | 'F'): string => `qual:${sexo}`;

/** Decompone un slide id en su tupla (kind + partes). */
export const parseSlideId = (id: string): { kind: ShowcaseSlideKind; parts: string[] } => {
  const [kind, ...parts] = id.split(':');
  return { kind: kind as ShowcaseSlideKind, parts };
};

// ============= Encode / decode =============

/** Serializa una config a base64 URL-safe (para meter en el #hash). */
export const encodeShowcaseConfig = (cfg: ShowcaseConfig): string => {
  const json = JSON.stringify(cfg);
  // btoa exige latin1; convertimos a UTF-8 → binario primero.
  const bin = unescape(encodeURIComponent(json));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/** Decodifica una config desde el #hash (devuelve null si está mal formada). */
export const decodeShowcaseConfig = (encoded: string): ShowcaseConfig | null => {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 0 ? b64 : b64 + '='.repeat(4 - (b64.length % 4));
    const bin = atob(pad);
    const json = decodeURIComponent(escape(bin));
    const obj = JSON.parse(json) as ShowcaseConfig;
    if (!obj || !Array.isArray(obj.slides)) return null;
    return {
      defaultSeconds: Number(obj.defaultSeconds) > 0 ? Number(obj.defaultSeconds) : 30,
      slides: obj.slides.filter((s) => s && typeof s.id === 'string'),
    };
  } catch {
    return null;
  }
};

/** Construye la URL completa (relativa) para abrir el rotador con una config. */
export const buildRotatorUrl = (cfg: ShowcaseConfig): string =>
  `/showcase/rotacion#${encodeShowcaseConfig(cfg)}`;