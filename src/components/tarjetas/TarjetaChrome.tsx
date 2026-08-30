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
  TARJETA_HEADER_FONTS_DEFAULT,
  resolveTeeMark,
  type TarjetaHeaderFonts,
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

/** Etiqueta del hoyo de salida, tolerante a datos faltantes ("H--"). */
export const tarjetaHoleLabel = (hole?: number | null): string => {
  const h = hole == null || !Number.isFinite(Number(hole))
    ? '--'
    : String(Number(hole)).padStart(2, '0');
  return `H${h}`;
};

/** Hoyo + hora de salida en una sola línea, tolerante a datos faltantes. */
export const tarjetaHoleTime = (
  hole?: number | null,
  time?: string | null,
): string => `${tarjetaHoleLabel(hole)} ${tarjetaText(time, '--:--')}`;


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
 * Bloques del encabezado de cada campo.
 *   · `top`      → contenido del bloque superior.
 *   · `bottom`   → contenido del bloque inferior.
 *   · `topRows`  → cuántos de los 3 renglones ocupa el bloque superior
 *                  (2 por omisión; el inferior toma los restantes).
 * Se calcula a partir de los datos de la tarjeta aplicando los fallbacks.
 */
const headerBlocks = (
  card: TarjetaChromeData,
  /** Tamaños de letra configurables en Admin → Tarjetas (hoyo/hora y categoría). */
  fonts: TarjetaHeaderFonts = TARJETA_HEADER_FONTS_DEFAULT,
): Record<
  TarjetaHeaderKey,
  {
    top: ReactNode;
    bottom: ReactNode;
    align: 'left' | 'center' | 'right';
    topRows?: number;
  }
> => {
  const sistemaLabel = tarjetaSistemaLabel(card.system);
  return {
    /*
      Hoyo + hora de salida:
        · Renglón 1        → número de hoyo (H01).
        · Renglones 2 y 3  → merge con la hora de salida en letra grande.
    */
    hoyohora: {
      align: 'left',
      topRows: 1,
      top: (
        <span
          className="font-bold leading-none"
          style={{ fontSize: `${fonts.hoyoPt}pt` }}
        >
          {tarjetaHoleLabel(card.hole)}
        </span>
      ),
      bottom: (
        <span
          className="font-bold leading-none"
          style={{ fontSize: `${fonts.hoyoPt}pt` }}
        >
          {tarjetaText(card.time, '--:--')}
        </span>
      ),
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
    /*
      "HCP. NETO" + handicap de juego (neto) en grande.
      · La etiqueta va con `whitespace-nowrap` y SIN `truncate` para que nunca
        se corte; la columna mide 20 mm fijos (ver TARJETA_HEADER_WIDTHS).
      · El valor usa `tabular-nums` para que 1, 2 o 3 dígitos queden siempre
        centrados igual en cualquier tamaño de hoja.
    */
    vtja: {
      align: 'center',
      top: (
        <span className="block w-full whitespace-nowrap text-center text-[5.5pt] uppercase leading-none tracking-tight text-foreground/70">
          HCP. NETO
        </span>
      ),
      bottom: (
        <span className="block w-full whitespace-nowrap text-center text-[11pt] font-bold tabular-nums">
          {tarjetaNum(card.hcp)}
        </span>
      ),
    },
    /* Categoría (renglones 1-2) + marcas de salida (renglón 3). */
    categoria: {
      align: 'right',
      top: (
        <span
          className="truncate font-bold uppercase"
          style={{ fontSize: `${fonts.catPt}pt` }}
        >
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
  fonts = TARJETA_HEADER_FONTS_DEFAULT,
}: {
  card: TarjetaChromeData;
  fields: TarjetaHeaderKey[];
  rowMm: number;
  /** Tamaños de letra (pt) de hoyo/hora y categoría, configurables en Admin. */
  fonts?: TarjetaHeaderFonts;
}) => {
  const blocks = headerBlocks(card, fonts);
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
        /* Cuántos renglones toma cada bloque (por omisión 2 arriba y 1 abajo). */
        const topRows = block.topRows ?? 2;
        const bottomRows = Math.max(1, 3 - topRows);
        return (
          <div
            key={key}
            className={`flex min-w-0 flex-col leading-tight ${
              i > 0 ? 'border-l border-foreground/70' : ''
            }`}
          >
            {/* Bloque superior */}
            <div
              className={`flex min-w-0 items-center px-1 ${alignCls[block.align]}`}
              style={{ flex: `${topRows} 1 0%` }}
            >
              {block.top}
            </div>
            {/* Bloque inferior (merge de los renglones restantes) */}
            <div
              className={`flex min-w-0 items-center px-1 ${alignCls[block.align]}`}
              style={{ flex: `${bottomRows} 1 0%` }}
            >
              {block.bottom}
            </div>
          </div>
        );
      })}

    </div>
  );
};

/**
 * TarjetaAnotadorRow — bloque "SCORE ANOTADOR" en 2 renglones que va al
 * final de la tarjeta, después de un brinco de renglón bajo el pie (firmas).
 *
 * Renglón 1: igual que el renglón HOYO — 18 celdas con el número de hoyo y
 * las columnas acumuladas V1 / V2 / TOTAL, con la etiqueta "SCORE ANOTADOR"
 * a la izquierda. Renglón 2: celdas vacías para que el anotador escriba ahí
 * sus golpes. El padding-bottom final es CONFIGURABLE desde Admin → Tarjetas
 * (`padMm`, 3 mm por omisión) y viaja en la URL del reporte como `pad=`.
 *
 * Usa los mismos anchos de columna (%) que la tabla principal para que las
 * celdas queden perfectamente alineadas con los renglones de arriba.
 *
 * @param rowMm Alto del renglón (el mismo configurable de Admin → Tarjetas).
 * @param padMm Padding-bottom en mm al final de la tarjeta (default 3).
 */
export const TarjetaAnotadorRow = ({
  rowMm,
  padMm = 3,
}: {
  rowMm: number;
  padMm?: number;
}) => {

  /** Ancho de la etiqueta y de las columnas de totales (idénticos a la tabla). */
  const COL_LABEL_PCT = 10.6;
  const COL_TOTAL_PCT = 5.6;
  const COL_HOLE_PCT = (100 - COL_LABEL_PCT - COL_TOTAL_PCT * 3) / 18;

  /** Celda del renglón con borde fino, igual que las de la tabla principal. */
  const ACell = ({
    children,
    className = '',
  }: {
    children?: ReactNode;
    className?: string;
  }) => (
    <td className={`border border-foreground/60 px-0 text-center align-middle ${className}`}>
      {children}
    </td>
  );

  return (
    <div style={{ paddingBottom: `${padMm}mm` }}>

      <table className="w-full table-fixed border-collapse text-[7pt] leading-none">
        <colgroup>
          <col style={{ width: `${COL_LABEL_PCT}%` }} />
          {Array.from({ length: 9 }, (_, i) => (
            <col key={`ao-${i}`} style={{ width: `${COL_HOLE_PCT}%` }} />
          ))}
          <col style={{ width: `${COL_TOTAL_PCT}%` }} />
          {Array.from({ length: 9 }, (_, i) => (
            <col key={`ai-${i}`} style={{ width: `${COL_HOLE_PCT}%` }} />
          ))}
          <col style={{ width: `${COL_TOTAL_PCT}%` }} />
          <col style={{ width: `${COL_TOTAL_PCT}%` }} />
        </colgroup>
        <tbody>
          {/* Renglón 1: números de hoyo, igual que el renglón HOYO */}
          <tr style={{ height: `${rowMm}mm` }}>
            {/* Etiqueta a la izquierda (puede partirse en 2 líneas) */}
            <ACell className="px-1 text-left text-[6pt] font-semibold uppercase leading-tight">
              Score Anotador
            </ACell>
            {/* Hoyos 1-9 */}
            {Array.from({ length: 9 }, (_, i) => (
              <ACell key={`an-o-${i}`}>{i + 1}</ACell>
            ))}
            <ACell className="bg-muted/60 font-bold">V1</ACell>
            {/* Hoyos 10-18 */}
            {Array.from({ length: 9 }, (_, i) => (
              <ACell key={`an-i-${i}`}>{i + 10}</ACell>
            ))}
            <ACell className="bg-muted/60 font-bold">V2</ACell>
            <ACell className="bg-muted/60 font-bold">TOTAL</ACell>
          </tr>
          {/* Renglón 2: celdas vacías para escribir los golpes del anotador */}
          <tr style={{ height: `${rowMm}mm` }}>
            {Array.from({ length: 22 }, (_, i) => (
              <ACell key={`an-w-${i}`} />
            ))}
          </tr>
        </tbody>
      </table>
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
    <div className="flex items-end justify-between gap-2 px-2 pb-1 pt-2 text-[6.5pt] uppercase">
      {/* Renglón 1 "SISTEMA"; renglón 2 el sistema en negritas (una sola vez). */}
      <div className="min-w-0 leading-tight">
        <div className="text-[5.5pt] uppercase text-foreground/70">Sistema</div>
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
