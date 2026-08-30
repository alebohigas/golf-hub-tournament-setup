/**
 * TarjetaHeaderFooterPreview
 * -----------------------------------------------------------------------------
 * Previsualización EN VIVO del ENCABEZADO (3 renglones) y del PIE (firmas) de
 * la tarjeta de juego, usando exactamente la misma maqueta, tipografías y
 * medidas en mm que la página imprimible `/admin/tarjetas-impresion`.
 *
 * Se muestra dentro de Admin → Tarjetas para validar cómo saldrán impresión y
 * PDF ANTES de exportar, sin necesidad de abrir el reporte.
 *
 * Props: el estado actual de la maquetación en Admin (orden/visibilidad de
 * campos del encabezado, alto de renglón, márgenes y sistema de juego).
 */

import type { ReactNode } from 'react';
import {
  TARJETA_HEADER_WIDTHS,
  resolveTeeMark,
  type TarjetaHeaderKey,
} from '@/lib/tarjetasHeader';

/** Datos de muestra: representan una tarjeta típica para la vista previa. */
const SAMPLE = {
  hole: 1,
  time: '11:20',
  playerNumber: '1024',
  name: 'Jugador de Muestra',
  club: 'Club de Golf Demo',
  hcp: 12,
  categoryName: 'Primera Fuerza Caballeros',
  shortName: '1A CAB',
  tee: 'AZULES',
  teeSal: '',
  folio: '0001',
};

/** Chip de color de la marca de salida (idéntico al del reporte). */
const TeeMarkChip = ({ tee, teeSal }: { tee?: string; teeSal?: string }) => {
  const mark = resolveTeeMark(tee, teeSal);
  if (!mark.label) return null;
  return (
    <span className="flex min-w-0 items-center gap-1">
      {mark.color && (
        <span
          className="inline-block h-[2.4mm] w-[2.4mm] shrink-0 rounded-sm border border-foreground/70"
          style={{ backgroundColor: mark.color }}
        />
      )}
      <span className="truncate text-[7pt] font-bold uppercase">{mark.label}</span>
    </span>
  );
};

export interface TarjetaHeaderFooterPreviewProps {
  /** Campos del encabezado en el orden configurado. */
  headerOrder: TarjetaHeaderKey[];
  /** Alto de renglón (mm) configurado en Admin. */
  rowMm: number;
  /** Margen lateral (mm) de la tarjeta. */
  marginMm: number;
  /** Tipo de juego elegido en Admin (auto usa STROKE PLAY de muestra). */
  sistema: 'auto' | 'stroke' | 'stableford';
}

/** Vista previa en vivo del encabezado + pie de la tarjeta. */
const TarjetaHeaderFooterPreview = ({
  headerOrder,
  rowMm,
  marginMm,
  sistema,
}: TarjetaHeaderFooterPreviewProps) => {
  const sistemaLabel = sistema === 'stableford' ? 'STABLEFORD' : 'STROKEPLAY';

  /** Bloques superior (renglones 1-2) e inferior (renglón 3) por campo. */
  const blocks: Record<
    TarjetaHeaderKey,
    { top: ReactNode; bottom: ReactNode; align: 'left' | 'center' | 'right' }
  > = {
    hoyohora: {
      align: 'left',
      top: (
        <span className="text-[13pt] font-bold">
          H{String(SAMPLE.hole).padStart(2, '0')} {SAMPLE.time}
        </span>
      ),
      bottom: null,
    },
    jugador: {
      align: 'left',
      top: (
        <span className="flex min-w-0 items-center gap-2">
          <span className="text-[9.5pt] font-bold">{SAMPLE.playerNumber}</span>
          <span className="truncate text-[9.5pt] font-bold uppercase">{SAMPLE.name}</span>
        </span>
      ),
      bottom: <span className="truncate uppercase text-foreground/80">{SAMPLE.club}</span>,
    },
    vtja: {
      align: 'center',
      top: <span className="text-[5.5pt] uppercase leading-none text-foreground/70">Vtja</span>,
      bottom: <span className="text-[11pt] font-bold">{SAMPLE.hcp}</span>,
    },
    categoria: {
      align: 'right',
      top: (
        <span className="truncate text-[9pt] font-bold uppercase">{SAMPLE.categoryName}</span>
      ),
      bottom: <TeeMarkChip tee={SAMPLE.tee} teeSal={SAMPLE.teeSal} />,
    },
    tee: {
      align: 'right',
      top: <span className="text-[5.5pt] uppercase leading-none text-foreground/70">Salida</span>,
      bottom: <TeeMarkChip tee={SAMPLE.tee} teeSal={SAMPLE.teeSal} />,
    },
    sistema: {
      align: 'right',
      top: <span className="text-[5.5pt] uppercase leading-none text-foreground/70">Sistema</span>,
      bottom: <span className="truncate text-[7pt] font-bold uppercase">{sistemaLabel}</span>,
    },
    folio: {
      align: 'right',
      top: <span className="text-[5.5pt] uppercase leading-none text-foreground/70">Folio</span>,
      bottom: <span className="truncate text-[7pt] font-bold">{SAMPLE.folio}</span>,
    },
  };

  const alignCls = {
    left: 'justify-start text-left',
    center: 'justify-center text-center',
    right: 'justify-end text-right',
  } as const;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Vista previa en vivo (encabezado y firmas). Refleja el orden de campos, el alto de
        renglón ({rowMm} mm) y el margen lateral ({marginMm} mm) configurados aquí; es la misma
        maqueta que se usa en impresión y PDF.
      </p>

      <div className="overflow-x-auto rounded-md border bg-white p-3">
        <div className="mx-auto w-[196mm] min-w-[196mm] border border-foreground/70 text-foreground">
          {/* ---------- Encabezado de 3 renglones ---------- */}
          <div
            className="grid border-b border-foreground/70 text-[8pt]"
            style={{
              gridTemplateColumns: headerOrder
                .map((k) => TARJETA_HEADER_WIDTHS[k])
                .join(' '),
              height: `${rowMm * 3}mm`,
            }}
          >
            {headerOrder.map((key, i) => {
              const block = blocks[key];
              return (
                <div
                  key={key}
                  className={`flex min-w-0 flex-col leading-tight ${
                    i > 0 ? 'border-l border-foreground/70' : ''
                  }`}
                >
                  <div
                    className={`flex min-w-0 flex-[2] items-center px-1 ${alignCls[block.align]}`}
                  >
                    {block.top}
                  </div>
                  <div
                    className={`flex min-w-0 flex-1 items-center px-1 ${alignCls[block.align]}`}
                  >
                    {block.bottom}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Brinco de renglón + representación compacta de la tabla de hoyos */}
          <div style={{ height: `${rowMm}mm` }} />
          <div
            className="flex items-center justify-center border-y border-dashed border-foreground/40 text-[6.5pt] uppercase text-foreground/60"
            style={{ height: `${rowMm * 4}mm` }}
          >
            Tabla de hoyos (renglones configurados)
          </div>

          {/* Margen de 3 renglones antes de las firmas */}
          <div style={{ height: `${rowMm * 3}mm` }} />

          {/* ---------- Pie: sistema, firmas y folio ---------- */}
          <div className="flex items-end justify-between gap-2 border-t border-foreground/70 px-2 pb-1 pt-2 text-[6.5pt] uppercase">
            {/* Bloque de categoría abajo a la izquierda: renglón 1 "SISTEMA",
                renglones 2 y 3 el sistema de juego en negritas. */}
            <div className="min-w-0 leading-tight">
              <div className="text-[5.5pt] uppercase text-foreground/70">Sistema</div>
              <div className="truncate text-[7.5pt] font-bold">{sistemaLabel}</div>
              <div className="truncate text-[7.5pt] font-bold">{sistemaLabel}</div>
            </div>
            <div className="flex-1 border-b border-foreground/60 text-center">Anotador</div>
            {/* En lugar de "Firma jugador" se imprime el nombre del jugador */}
            <div className="flex-1 truncate border-b border-foreground/60 text-center">
              {SAMPLE.name}
            </div>
            <div className="whitespace-nowrap font-semibold">Folio {SAMPLE.folio}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TarjetaHeaderFooterPreview;
