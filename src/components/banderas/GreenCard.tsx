/**
 * GreenCard
 * ---------------------------------------------------------------
 * Single-hole pin-sheet card. Replaces the cluttered black-and-white
 * oval-with-an-L from the printed PDF with a clean, color-coded SVG
 * visualization that's readable on phones and on the screen.
 *
 * The green is drawn as an ellipse seen from above (front edge at the
 * BOTTOM, where the player approaches; back edge at the top). The pin
 * is rendered as a red flag at the exact relative position derived
 * from `pinFromFront` / `pinFromSide` / `pinSide` over the total
 * `depth`. A faint reference grid plus L-shaped distance guides
 * preserve the spatial reading of the original sheet.
 */

import { Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PinSheetHole } from '@/data/banderasData';

/** Width-to-depth ratio used to draw a stylized green. Keeps a
 *  consistent oval shape regardless of the actual depth value. */
const GREEN_ASPECT = 0.72;

/** SVG view box constants. The drawing is unitless; CSS scales it. */
const VB_W = 200;
const VB_H = 240;

/** Inner padding for the oval inside the view box (label space). */
const PAD_X = 18;
const PAD_TOP = 36; // leaves room for the slope badge above the green
const PAD_BOTTOM = 56; // leaves room for the depth label below

interface GreenCardProps {
  data: PinSheetHole;
  className?: string;
}

const GreenCard = ({ data, className }: GreenCardProps) => {
  const { hole, depth, pinFromFront, pinFromSide, pinSide, slope } = data;

  // ----- Geometry --------------------------------------------------
  // Oval bounds inside the SVG view box.
  const ovalLeft = PAD_X;
  const ovalRight = VB_W - PAD_X;
  const ovalTop = PAD_TOP;
  const ovalBottom = VB_H - PAD_BOTTOM;
  const cx = (ovalLeft + ovalRight) / 2;
  const cy = (ovalTop + ovalBottom) / 2;
  const rx = (ovalRight - ovalLeft) / 2;
  const ry = (ovalBottom - ovalTop) / 2;

  // The "playing depth" (front → back) maps to the oval's vertical axis.
  // Front is at the BOTTOM of the oval, back at the TOP.
  const frontFrac = Math.min(Math.max(pinFromFront / depth, 0), 1);
  // Convert real green WIDTH proportionally — assume green width = depth * GREEN_ASPECT.
  const greenWidthPaces = depth * GREEN_ASPECT;
  const sideFrac = Math.min(Math.max(pinFromSide / greenWidthPaces, 0), 1);

  // Pin position in SVG coords:
  //   y: front (bottom) - frontFrac * (oval height)
  //   x: depending on which side the measurement is taken from
  const pinY = ovalBottom - frontFrac * (ovalBottom - ovalTop);
  const pinX =
    pinSide === 'L'
      ? ovalLeft + sideFrac * (ovalRight - ovalLeft)
      : ovalRight - sideFrac * (ovalRight - ovalLeft);

  // ----- Offset badge styling -------------------------------------
  // The boxed +/- number on the original sheet is the pin offset
  // relative to the CENTER of the green (positive = past center toward
  // back, negative = before center toward front). Color-coded for
  // quick reading; magnitude is shown literally.
  const offsetIsPositive = slope > 0;
  const offsetIsNeutral = slope === 0;
  const badgeClass = offsetIsNeutral
    ? 'bg-muted text-foreground border-border'
    : offsetIsPositive
    ? 'bg-primary/15 text-primary border-primary/30'
    : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30';
  const offsetLabel = slope > 0 ? `+${slope}` : `${slope}`;

  return (
    <div
      className={cn(
        'relative rounded-2xl border border-border bg-card text-card-foreground',
        'shadow-card hover:shadow-elegant transition-shadow p-4 flex flex-col',
        className,
      )}
    >
      {/* ===== Card header: hole # + slope badge ===== */}
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
          title="Posición del pin respecto al centro del green (positivo = hacia el fondo, negativo = hacia el frente)"
        >
          <span className="text-[10px] uppercase tracking-wide opacity-80">vs Centro</span>
          <span className="text-base font-bold leading-none mt-0.5">{offsetLabel}</span>
        </div>
      </div>

      {/* ===== SVG green ===== */}
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Posición de bandera en el hoyo ${hole}: ${pinFromFront} pasos del frente, ${pinFromSide} pasos del borde ${pinSide === 'L' ? 'izquierdo' : 'derecho'}, profundidad total ${depth}.`}
      >
        {/* Green surface */}
        <defs>
          <radialGradient id={`green-grad-${hole}`} cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.35)" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.10)" />
          </radialGradient>
        </defs>
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill={`url(#green-grad-${hole})`}
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
        />

        {/* Reference dotted center cross (subtle) */}
        <line
          x1={cx} y1={ovalTop} x2={cx} y2={ovalBottom}
          stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="2 3"
        />
        <line
          x1={ovalLeft} y1={cy} x2={ovalRight} y2={cy}
          stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="2 3"
        />

        {/* Front edge label (where the ball lands) */}
        <text
          x={cx} y={ovalBottom + 14}
          textAnchor="middle"
          fontSize={9}
          fill="hsl(var(--muted-foreground))"
          fontWeight={600}
          letterSpacing={1}
        >
          FRENTE
        </text>
        <text
          x={cx} y={ovalTop - 6}
          textAnchor="middle"
          fontSize={8}
          fill="hsl(var(--muted-foreground))"
          letterSpacing={1}
        >
          FONDO
        </text>

        {/* Distance guides forming an L from the edges to the pin */}
        <line
          x1={pinX} y1={ovalBottom} x2={pinX} y2={pinY}
          stroke="hsl(var(--primary))"
          strokeWidth={1}
          strokeDasharray="3 2"
          opacity={0.7}
        />
        <line
          x1={pinSide === 'L' ? ovalLeft : ovalRight}
          y1={pinY}
          x2={pinX}
          y2={pinY}
          stroke="hsl(var(--primary))"
          strokeWidth={1}
          strokeDasharray="3 2"
          opacity={0.7}
        />

        {/* Distance labels */}
        <text
          x={pinX + (pinSide === 'L' ? 4 : -4)}
          y={(ovalBottom + pinY) / 2}
          textAnchor={pinSide === 'L' ? 'start' : 'end'}
          fontSize={11}
          fontWeight={700}
          fill="hsl(var(--foreground))"
        >
          {pinFromFront}
        </text>
        <text
          x={(pinX + (pinSide === 'L' ? ovalLeft : ovalRight)) / 2}
          y={pinY - 4}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill="hsl(var(--foreground))"
        >
          {pinFromSide}
        </text>

        {/* Pin: small circle (hole) + flagstick + flag */}
        <circle cx={pinX} cy={pinY} r={2.2} fill="hsl(var(--foreground))" />
        <line
          x1={pinX} y1={pinY}
          x2={pinX} y2={pinY - 26}
          stroke="hsl(var(--foreground))"
          strokeWidth={1.2}
        />
        <polygon
          points={`${pinX},${pinY - 26} ${pinX + 14},${pinY - 22} ${pinX},${pinY - 18}`}
          fill="hsl(var(--destructive))"
        />
      </svg>

      {/* ===== Card footer: numeric summary ===== */}
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