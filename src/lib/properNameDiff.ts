/**
 * properNameDiff.ts
 * ---------------------------------------------------------------------------
 * Analiza QUÉ cambia al normalizar un nombre a NOMBRE PROPIO (ver
 * `properName.ts`) para poder mostrar un indicador en vivo en el formulario
 * de Pre-Registro: partículas, guiones, apóstrofes, acentos y mayúsculas.
 */
import { toProperName } from './properName';

/** Tipo de cambio detectado en un segmento del nombre. */
export type DiffKind =
  | 'igual'        // sin cambios
  | 'ortografia'   // se corrigió la ortografía/acentos (LOPEZ -> López)
  | 'particula'    // partícula interna en minúscula (DE LA -> de la)
  | 'mayusculas'   // sólo cambió el uso de mayúsculas/minúsculas
  | 'guion'        // segmento dentro de un apellido con guion
  | 'apostrofe';   // segmento después de un apóstrofe

/** Un trozo del resultado normalizado, con su origen y su clasificación. */
export interface DiffPiece {
  /** Texto tal como quedará normalizado (puede ser un separador o espacio). */
  text: string;
  /** Texto original correspondiente (vacío si es separador/espacio). */
  original: string;
  /** Clasificación del cambio. */
  kind: DiffKind;
  /** true si es separador (espacio, guion, apóstrofe) y no una palabra. */
  separator: boolean;
}

export interface ProperNameDiff {
  /** Resultado normalizado completo. */
  normalized: string;
  /** Trozos en orden para renderizar el resaltado. */
  pieces: DiffPiece[];
  /** Tipos de cambio presentes (para las etiquetas/resumen). */
  kinds: DiffKind[];
  /** true si se colapsaron espacios múltiples o se recortaron extremos. */
  spacingFixed: boolean;
  /** true si hubo cualquier cambio respecto al texto original. */
  changed: boolean;
}

/** Quita diacríticos y baja a minúsculas. */
const fold = (s: string): string =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Separadores internos de palabra (guiones y apóstrofes). */
const SEP_RE = /([-‑–'’`´])/;
const isApostrophe = (s: string): boolean => /['’`´]/.test(s);

/**
 * Clasifica el cambio de un segmento comparando original vs normalizado,
 * considerando el separador que lo precede (guion o apóstrofe).
 */
const classify = (original: string, normalized: string, prevSep: string): DiffKind => {
  if (original === normalized) return 'igual';
  if (prevSep && isApostrophe(prevSep)) return 'apostrofe';
  if (prevSep) return 'guion';
  if (fold(original) !== fold(normalized)) return 'ortografia';
  // Misma letra base: sólo cambió el case. Si quedó todo en minúscula es una
  // partícula interna ("DE LA" -> "de la"); si no, es Title Case normal.
  if (normalized === normalized.toLowerCase()) return 'particula';
  return 'mayusculas';
};

/**
 * Compara el texto capturado con su versión NOMBRE PROPIO y devuelve los
 * trozos clasificados para resaltar en la UI.
 */
export const diffProperName = (raw: string | null | undefined): ProperNameDiff => {
  const original = (raw ?? '');
  const collapsed = original.replace(/\s+/g, ' ').trim();
  const normalized = toProperName(original);
  const pieces: DiffPiece[] = [];

  const rawWords = collapsed ? collapsed.split(' ') : [];
  const normWords = normalized ? normalized.split(' ') : [];

  normWords.forEach((normWord, wordIndex) => {
    if (wordIndex > 0) pieces.push({ text: ' ', original: ' ', kind: 'igual', separator: true });
    const rawWord = rawWords[wordIndex] ?? '';
    const normParts = normWord.split(SEP_RE);
    const rawParts = rawWord.split(SEP_RE);
    normParts.forEach((part, i) => {
      if (i % 2 === 1) {
        pieces.push({ text: part, original: rawParts[i] ?? '', kind: 'igual', separator: true });
        return;
      }
      const originalPart = rawParts[i] ?? '';
      const prevSep = i > 0 ? (normParts[i - 1] ?? '') : '';
      pieces.push({
        text: part,
        original: originalPart,
        kind: classify(originalPart, part, prevSep),
        separator: false,
      });
    });
  });

  const kinds = Array.from(
    new Set(pieces.filter(p => !p.separator && p.kind !== 'igual').map(p => p.kind))
  );
  const spacingFixed = collapsed !== original.trim() || /\s{2,}|^\s|\s$/.test(original);

  return {
    normalized,
    pieces,
    kinds,
    spacingFixed,
    changed: normalized !== original,
  };
};

/** Etiquetas legibles para cada tipo de cambio. */
export const DIFF_LABELS: Record<Exclude<DiffKind, 'igual'>, string> = {
  ortografia: 'ortografía / acentos',
  particula: 'partícula en minúscula',
  mayusculas: 'mayúsculas / minúsculas',
  guion: 'apellido con guion',
  apostrofe: 'apóstrofe',
};

/** Clases de resaltado (tokens semánticos) por tipo de cambio. */
export const DIFF_CLASSES: Record<DiffKind, string> = {
  igual: '',
  ortografia: 'bg-primary/15 text-primary rounded-sm px-0.5',
  particula: 'bg-accent/40 text-accent-foreground rounded-sm px-0.5',
  mayusculas: 'bg-muted text-foreground rounded-sm px-0.5',
  guion: 'bg-secondary text-secondary-foreground rounded-sm px-0.5',
  apostrofe: 'bg-secondary text-secondary-foreground rounded-sm px-0.5',
};