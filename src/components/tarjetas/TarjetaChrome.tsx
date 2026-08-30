/**
 * TarjetaChrome — maqueta COMPARTIDA del encabezado y pie de la tarjeta de juego
 * -----------------------------------------------------------------------------
 * Este módulo es la ÚNICA fuente de verdad del "chrome" de la tarjeta:
 *   · Encabezado de 3 renglones (campos y orden configurables en Admin).
 *   · Pie con el bloque SISTEMA, las firmas y el folio.
 *
 * Lo consumen por igual:
 *   · `/admin/tarjetas-impresion` (impresión y exportación a PDF).
 *   · `TarjetaHeaderFooterPreview` (previsualización en vivo en Admin → Tarjetas).
 * Al compartir componentes (no copias), la previsualización, la impresión y el
 * PDF quedan 1:1: mismas medidas en mm, tipografías, bordes y fallbacks.
 *
 * VALIDACIONES / FALLBACKS
 * Si la base de datos no trae algún dato (nombre, club, categoría, folio, hora,
 * hoyo, handicap o color de marcas de salida) se imprime un texto de respaldo
 * con el mismo alto y tipografía, de forma que la maqueta NUNCA se rompe ni
 * cambia de alto por celdas vacías.
 */

import type { ReactNode } from 'react';
import {
  TARJETA_HEADER_WIDTHS,
  resolveTeeMark,
  type TarjetaHeaderKey,
} from '@/lib/tarjetasHeader';

// ============= Datos mínimos que necesita el chrome =============

/**
 * Subconjunto de `TarjetaCard` que usa el encabezado/pie. Todos los campos son
 * opcionales a propósito: la maqueta debe resistir datos incompletos.
 */
export interface TarjetaChromeData {
  hole?: number | null;
  time?: string | null;
  playerNumber?: string | null;
  name?: string | null;
  club?: string | null;
  hcp?: number | string | null;
  categoryName?: string | null;
  shortName?: string | null;
  tee?: string | null;
  teeSal?: string | null;
  folio?: string | null;
  system?: string | null;
}

// ============= Fallbacks =============

/** Texto de respaldo cuando un dato de texto viene vacío/nulo. */
export const tarjetaText = (value: unknown, fallback = '—'): string => {
  const s = value == null ? '' : String(value).trim();
  return s || fallback;
};

/** Handicap/ventaja: acepta 0 como valor válido y sólo cae al respaldo si falta. */
export const tarjetaNum = (value: unknown, fallback = '—'): string => {
  if (value === 0) return '0';
  const s = value == null ? '' : String(value).trim();
  if (!s) return fallback;
  const n = Number(s);
  return Number.isFinite(n) ? String(n) : fallback;
};

/** Hoyo + hora de salida, tolerante a datos faltantes ("H-- --:--"). */
export const tarjetaHoleTime = (
  hole?: number | null,
  time?: string | null,
): string => {
  const h = hole == null || !Number.isFinite(Number(hole))
    ? '--'
    : String(Number(hole)).padStart(2, '0');
  return `H${h} ${tarjetaText(time, '--:--')}`;
};

/** Sistema de juego normalizado a la leyenda impresa. */
export const tarjetaSistemaLabel = (system?: string | null): string =>
  (system || '').toUpperCase().includes('STABLE') ? 'STABLEFORD' : 'STROKEPLAY';

// ============= Piezas visuales =============

/**
 * TeeMarkChip — leyenda del color de marcas de salida.
 * Sin dato de tee imprime "SIN MARCA" y sin color reconocido usa un cuadro
 * rayado neutro: la celda conserva su alto y alineación en todos los casos.
 */
export const TeeMarkChip = ({
  tee,
  teeSal,
  align = 'right',
}: {
  tee?: string | null;
  teeSal?: string | null;
  align?: 'left' | 'right';
}) => {
  const mark = resolveTeeMark(tee ?? undefined, teeSal ?? undefined);
  const label = mark.label || 'SIN MARCA';
  return (
    <span
      className={`flex min-w-0 items-center gap-1 ${
        align === 'right' ? 'justify-end' : 'justify-start'
      }`}
    >
      <span
        className="inline-block shrink-0 rounded-[0.5mm] border border-foreground/70"
        style={{
          width: '3mm',
          height: '3mm',
          backgroundColor: mark.color ?? 'transparent',
          /* Sin color reconocido: rayado diagonal para no dejar el hueco vacío. */
          backgroundImage: mark.color
            ? undefined
            : 'repeating-linear-gradient(45deg, hsl(var(--muted-foreground)/0.5) 0 0.5mm, transparent 0.5mm 1mm)',
        }}
        aria-hidden
      />
      <span className="truncate uppercase">{label}</span>
    </span>
  );
};

/** Clases de alineación horizontal por bloque del encabezado. */
const alignCls = {
  left: 'justify-start text-left',
  center: 'justify-center text-center',
  right: 'justify-end text-right',
} as const;

/**
 * Bloques (renglones 1-2 arriba y renglón 3 abajo) de cada campo del encabezado.
 * Se calcula a partir de los datos de la tarjeta aplicando los fallbacks.
 */
const headerBlocks = (
  card: TarjetaChromeData,
): Record<
  TarjetaHeaderKey,
  { top: ReactNode; bottom: ReactNode; align: 'left' | 'center' | 'right' }
> => {
  const sistemaLabel = tarjetaSistemaLabel(card.system);
  return {
    /* Hoyo + hora de salida con letra grande. */
    hoyohora: {
      align: 'left',
      top: (
        <span className="text-[13pt] font-bold">
          {tarjetaHoleTime(card.hole, card.time)}
        </span>
      ),
      bottom: null,
    },
    /* ID + nombre (renglones 1-2) y club (renglón 3). */
    jugador: {
      align: 'left',
      top: (
        <span className="flex min-w-0 items-center gap-2">
          <span className="text-[9.5pt] font-bold">
            {tarjetaText(card.playerNumber, '----')}
          </span>
          <span className="truncate text-[9.5pt] font-bold uppercase">
            {tarjetaText(card.name, 'JUGADOR POR ASIGNAR')}
          </span>
        </span>
      ),
      bottom: (
        <span className="truncate uppercase text-foreground/80">
          {tarjetaText(card.club, 'SIN CLUB')}
        </span>
      ),
    },
    /* "VTJA" + handicap grande. */
    vtja: {
      align: 'center',
      top: (
        <span className="text-[5.5pt] uppercase leading-none text-foreground/70">Vtja</span>
      ),
      bottom: <span className="text-[11pt] font-bold">{tarjetaNum(card.hcp)}</span>,
    },
    /* Categoría (renglones 1-2) + marcas de salida (renglón 3). */
    categoria: {
      align: 'right',
      top: (
        <span className="truncate text-[9pt] font-bold uppercase">
          {tarjetaText(card.categoryName || card.shortName, 'SIN CATEGORÍA')}
        </span>
      ),
      bottom: <TeeMarkChip tee={card.tee} teeSal={card.teeSal} />,
    },
    /* Marcas de salida como campo independiente. */
    tee: {
      align: 'right',
      top: (
        <span className="text-[5.5pt] uppercase leading-none text-foreground/70">Salida</span>
      ),
      bottom: <TeeMarkChip tee={card.tee} teeSal={card.teeSal} />,
    },
    /* Sistema de juego. */
    sistema: {
      align: 'right',
      top: (
        <span className="text-[5.5pt] uppercase leading-none text-foreground/70">Sistema</span>
      ),
      bottom: <span className="truncate text-[7pt] font-bold uppercase">{sistemaLabel}</span>,
    },
    /* Folio de la tarjeta. */
    folio: {
      align: 'right',
      top: (
        <span className="text-[5.5pt] uppercase leading-none text-foreground/70">Folio</span>
      ),
      bottom: (
        <span className="truncate text-[7pt] font-bold">{tarjetaText(card.folio)}</span>
      ),
    },
  };
};

/**
 * TarjetaHeaderGrid — encabezado de 3 renglones de la tarjeta.
 * @param fields Campos y orden configurados en Admin → Tarjetas.
 * @param rowMm  Alto de renglón en mm (el encabezado mide 3 renglones).
 */
export const TarjetaHeaderGrid = ({
  card,
  fields,
  rowMm,
}: {
  card: TarjetaChromeData;
  fields: TarjetaHeaderKey[];
  rowMm: number;
}) => {
  const blocks = headerBlocks(card);
  return (
    <div
      className="grid border-b border-foreground/70 text-[8pt]"
      style={{
        gridTemplateColumns: fields.map((k) => TARJETA_HEADER_WIDTHS[k]).join(' '),
        height: `${rowMm * 3}mm`,
      }}
    >
      {fields.map((key, i) => {
        const block = blocks[key];
        return (
          <div
            key={key}
            className={`flex min-w-0 flex-col leading-tight ${
              i > 0 ? 'border-l border-foreground/70' : ''
            }`}
          >
            {/* Bloque superior: renglones 1 y 2 */}
            <div className={`flex min-w-0 flex-[2] items-center px-1 ${alignCls[block.align]}`}>
              {block.top}
            </div>
            {/* Bloque inferior: renglón 3 */}
            <div className={`flex min-w-0 flex-1 items-center px-1 ${alignCls[block.align]}`}>
              {block.bottom}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * TarjetaFooter — pie de la tarjeta: bloque SISTEMA (3 renglones) a la
 * izquierda, firma del anotador, nombre del jugador (en lugar de "firma
 * jugador") y el folio a la derecha.
 */
export const TarjetaFooter = ({ card }: { card: TarjetaChromeData }) => {
  const sistemaLabel = tarjetaSistemaLabel(card.system);
  return (
    <div className="flex items-end justify-between gap-2 border-t border-foreground/70 px-2 pb-1 pt-2 text-[6.5pt] uppercase">
      {/* Renglón 1 "SISTEMA"; renglones 2 y 3 el sistema en negritas. */}
      <div className="min-w-0 leading-tight">
        <div className="text-[5.5pt] uppercase text-foreground/70">Sistema</div>
        <div className="truncate text-[7.5pt] font-bold">{sistemaLabel}</div>
        <div className="truncate text-[7.5pt] font-bold">{sistemaLabel}</div>
      </div>
      <div className="flex-1 border-b border-foreground/60 text-center">Anotador</div>
      {/* En lugar de "Firma jugador" se imprime el nombre del jugador. */}
      <div className="flex-1 truncate border-b border-foreground/60 text-center">
        {tarjetaText(card.name, 'JUGADOR POR ASIGNAR')}
      </div>
      <div className="whitespace-nowrap font-semibold">
        Folio {tarjetaText(card.folio)}
      </div>
    </div>
  );
};
