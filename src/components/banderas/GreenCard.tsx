/**
 * GreenCard
 * ---------------------------------------------------------------
 * Visualización SVG de un solo green. Reemplaza el "círculo de
 * mierda" del PDF por una vista cenital limpia con bandera roja en
 * la posición real, líneas guía a los bordes y resumen numérico.
 *
 * El componente NO conoce nada de fetching — recibe ya los datos
 * normalizados de useBanderas (`BanderaHole`).
 */

import { cn } from '@/lib/utils';
import type { BanderaHole } from '@/hooks/useBanderas';

/** Relación ancho/profundidad usada para dibujar el green. */
const GREEN_ASPECT = 0.72;

/** Constantes del SVG view box (unitless; el CSS lo escala). */
const VB_W = 200;
const VB_H = 240;
const PAD_X = 18;
const PAD_TOP = 36;
const PAD_BOTTOM = 56;

interface GreenCardProps {
  data: BanderaHole;
  className?: string;
}

const GreenCard = ({ data, className }: GreenCardProps) => {
  const {
    hole_number: hole,
    depth,
    pin_from_front: pinFromFront,
    pin_from_side: pinFromSide,
    pin_side: pinSide,
    center_offset: offset,
  } = data;

  // ----- Geometría -----------------------------------------------
  const ovalLeft = PAD_X;
  const ovalRight = VB_W - PAD_X;
  const ovalTop = PAD_TOP;
  const ovalBottom = VB_H - PAD_BOTTOM;
  const cx = (ovalLeft + ovalRight) / 2;
  const cy = (ovalTop + ovalBottom) / 2;
  const rx = (ovalRight - ovalLeft) / 2;
  const ry = (ovalBottom - ovalTop) / 2;

  const safeDepth = depth > 0 ? depth : 1;
  const frontFrac = Math.min(Math.max(pinFromFront / safeDepth, 0), 1);
  const greenWidthPaces = safeDepth * GREEN_ASPECT;
  const sideFrac = Math.min(Math.max(pinFromSide / greenWidthPaces, 0), 1);

  // Front en la base del óvalo, fondo arriba.
  const pinY = ovalBottom - frontFrac * (ovalBottom - ovalTop);
  const pinX =
    pinSide === 'L'
      ? ovalLeft + sideFrac * (ovalRight - ovalLeft)
      : ovalRight - sideFrac * (ovalRight - ovalLeft);

  // ----- Estilo del badge "vs Centro" ----------------------------
  const offsetIsPositive = offset > 0;
  const offsetIsNeutral = offset === 0;
  const badgeClass = offsetIsNeutral
    ? 'bg-muted text-foreground border-border'
    : offsetIsPositive
    ? 'bg-primary/15 text-primary border-primary/30'
    : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30';
  const offsetLabel = offset > 0 ? `+${offset}` : `${offset}`;

  return (
    <div
      className={cn(
        'relative rounded-2xl border border-border bg-card text-card-foreground',
        'shadow-card hover:shadow-elegant transition-shadow p-4 flex flex-col',
        className,
      )}
    >
      {/* Header: hoyo + badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Hoyo
          </p>
          <p className="text-3xl font-display font-bold text-foreground leading-none">
            {hole}
          </p>
        </div>
        <div
          className={cn(
            'flex flex-col items-center px-2.5 py-1.5 rounded-lg border text-xs font-mono',
            badgeClass,
          )}
          title="Posición de la bandera respecto al centro del green (positivo = hacia el fondo, negativo = hacia el frente)"
        >
          <span className="text-[10px] uppercase tracking-wide opacity-80">vs Centro</span>
          <span className="text-base font-bold leading-none mt-0.5">{offsetLabel}</span>
        </div>
      </div>

      {/* Green */}
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Hoyo ${hole}: bandera a ${pinFromFront} pasos del frente y ${pinFromSide} pasos del borde ${pinSide === 'L' ? 'izquierdo' : 'derecho'}, profundidad ${depth}.`}
      >
        <defs>
          <radialGradient id={`green-grad-${hole}`} cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.35)" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.10)" />
          </radialGradient>
        </defs>
        <ellipse
          cx={cx} cy={cy} rx={rx} ry={ry}
          fill={`url(#green-grad-${hole})`}
          stroke="hsl(var(--primary))" strokeWidth={1.5}
        />
        {/* Cruz de referencia */}
        <line x1={cx} y1={ovalTop} x2={cx} y2={ovalBottom}
              stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="2 3" />
        <line x1={ovalLeft} y1={cy} x2={ovalRight} y2={cy}
              stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="2 3" />
        {/* Etiquetas frente/fondo */}
        <text x={cx} y={ovalBottom + 14} textAnchor="middle" fontSize={9}
              fill="hsl(var(--muted-foreground))" fontWeight={600} letterSpacing={1}>
          FRENTE
        </text>
        <text x={cx} y={ovalTop - 6} textAnchor="middle" fontSize={8}
              fill="hsl(var(--muted-foreground))" letterSpacing={1}>
          FONDO
        </text>
        {/* Guías L hacia el pin */}
        <line x1={pinX} y1={ovalBottom} x2={pinX} y2={pinY}
              stroke="hsl(var(--primary))" strokeWidth={1}
              strokeDasharray="3 2" opacity={0.7} />
        <line x1={pinSide === 'L' ? ovalLeft : ovalRight} y1={pinY}
              x2={pinX} y2={pinY}
              stroke="hsl(var(--primary))" strokeWidth={1}
              strokeDasharray="3 2" opacity={0.7} />
        {/* Etiquetas numéricas */}
        <text x={pinX + (pinSide === 'L' ? 4 : -4)}
              y={(ovalBottom + pinY) / 2}
              textAnchor={pinSide === 'L' ? 'start' : 'end'}
              fontSize={11} fontWeight={700} fill="hsl(var(--foreground))">
          {pinFromFront}
        </text>
        <text x={(pinX + (pinSide === 'L' ? ovalLeft : ovalRight)) / 2}
              y={pinY - 4} textAnchor="middle"
              fontSize={11} fontWeight={700} fill="hsl(var(--foreground))">
          {pinFromSide}
        </text>
        {/* Pin: hoyo + asta + bandera */}
        <circle cx={pinX} cy={pinY} r={2.2} fill="hsl(var(--foreground))" />
        <line x1={pinX} y1={pinY} x2={pinX} y2={pinY - 26}
              stroke="hsl(var(--foreground))" strokeWidth={1.2} />
        <polygon
          points={`${pinX},${pinY - 26} ${pinX + 14},${pinY - 22} ${pinX},${pinY - 18}`}
          fill="hsl(var(--destructive))" />
      </svg>

      {/* Footer numérico */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md bg-muted/50 py-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Frente</p>
          <p className="text-sm font-bold tabular-nums">{pinFromFront}</p>
        </div>
        <div className="rounded-md bg-muted/50 py-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {pinSide === 'L' ? 'Izq' : 'Der'}
          </p>
          <p className="text-sm font-bold tabular-nums">{pinFromSide}</p>
        </div>
        <div className="rounded-md bg-muted/50 py-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Depth</p>
          <p className="text-sm font-bold tabular-nums">{depth}</p>
        </div>
      </div>
    </div>
  );
};

export default GreenCard;