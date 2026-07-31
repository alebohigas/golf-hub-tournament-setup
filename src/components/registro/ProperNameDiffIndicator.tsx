/**
 * ProperNameDiffIndicator
 * ---------------------------------------------------------------------------
 * Indicador en vivo que muestra QUÉ partes cambian al normalizar un
 * nombre/apellido a NOMBRE PROPIO: resalta cada segmento modificado y lista
 * los tipos de cambio (partículas, guiones, apóstrofes, acentos, mayúsculas).
 */
import { diffProperName, DIFF_LABELS, DIFF_CLASSES, type DiffKind } from '@/lib/properNameDiff';

interface ProperNameDiffIndicatorProps {
  /** Texto capturado por el usuario (sin normalizar). */
  value: string;
}

export const ProperNameDiffIndicator = ({ value }: ProperNameDiffIndicatorProps) => {
  const diff = diffProperName(value);
  if (!diff.normalized.trim()) return null;

  const kinds = diff.kinds as Exclude<DiffKind, 'igual'>[];
  const hasChanges = kinds.length > 0 || diff.spacingFixed;

  return (
    <div className="space-y-1 text-xs">
      {/* Vista con resaltado de los segmentos modificados */}
      <p className="text-muted-foreground">
        <span className="mr-1">Normalización:</span>
        <span className="font-medium text-foreground">
          {diff.pieces.map((piece, i) => (
            <span
              key={i}
              className={piece.separator ? '' : DIFF_CLASSES[piece.kind]}
              title={
                piece.separator || piece.kind === 'igual'
                  ? undefined
                  : `${piece.original} → ${piece.text} (${DIFF_LABELS[piece.kind as Exclude<DiffKind, 'igual'>]})`
              }
            >
              {piece.text === ' ' ? '\u00A0' : piece.text}
            </span>
          ))}
        </span>
      </p>

      {/* Resumen de los tipos de cambio aplicados */}
      {hasChanges ? (
        <div className="flex flex-wrap gap-1">
          {kinds.map(kind => (
            <span
              key={kind}
              className={`inline-flex items-center rounded-full px-2 py-0.5 ${DIFF_CLASSES[kind]}`}
            >
              {DIFF_LABELS[kind]}
            </span>
          ))}
          {diff.spacingFixed && (
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-foreground">
              espacios ajustados
            </span>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground">Sin cambios: ya está en NOMBRE PROPIO.</p>
      )}
    </div>
  );
};