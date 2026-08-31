/**
 * AdminTarjetasHoras — /admin/tarjetas-horas
 * -----------------------------------------------------------------------------
 * VISTA DE TARJETA POR HORA DE SALIDA.
 *
 * Muestra, con el MISMO DISEÑO del encabezado de la tarjeta de juego
 * (`TarjetaHeaderGrid`), quiénes juegan en cada hora de salida — sin necesidad
 * de abrir/imprimir la tarjeta completa de cada jugador.
 *
 * FILTROS (query string, los manda Admin → pestaña "Tarjetas"):
 *   ?fecha=2026-05-02[,2026-05-03]&catid=6335[,6336][&campoid=27]
 *   &sistema=auto|stroke|stableford  → tipo de juego
 *   &hcpfield=auto                   → columna de la BD del HANDICAP NETO
 *   &hfields=hoyohora,jugador,...    → campos y orden del encabezado
 *   &rowh=5.5                        → alto de renglón (mm)
 *   &fsh= / &fsc= / &fsj=            → tamaños de letra (hoyo, categoría, jugador)
 *   &margin=8                        → margen lateral (mm)
 *
 * Los grupos se ordenan igual que la impresión de tarjetas:
 *   1) hora de salida, 2) hoyo de inicio.
 * Cada bloque de hora se mantiene íntegro al imprimir (`break-inside: avoid`).
 */

import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Printer } from 'lucide-react';
import { useTarjetasReport, type TarjetaCard } from '@/hooks/useTarjetasImpresion';
import {
  TARJETA_HEADER_FONTS_DEFAULT,
  clampTarjetaFont,
  normalizeTarjetaHeader,
  type TarjetaHeaderFonts,
} from '@/lib/tarjetasHeader';
import { normalizeTarjetaHcpField } from '@/lib/tarjetasHcp';
import { startHoleStyleFor } from '@/lib/tarjetasStartHole';
import {
  TarjetaHeaderGrid,
  tarjetaHoleLabel,
  tarjetaText,
} from '@/components/tarjetas/TarjetaChrome';

/** Ancho útil de la hoja carta (215.9 mm) menos márgenes de impresión. */
const SHEET_W_MM = 215.9;

/** Lee un número de la URL acotado a un rango. */
const numParam = (v: string | null, def: number, min: number, max: number) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, n));
};

/** Un bloque de salida: una hora + un hoyo + los jugadores del grupo. */
interface HoraBlock {
  key: string;
  fecha: string;
  fechaFormato: string;
  hora: string;
  hole: number | null;
  categoryName: string;
  cards: TarjetaCard[];
}

const AdminTarjetasHoras = () => {
  const [params] = useSearchParams();

  /** Tipo de juego pedido (filtra las tarjetas por sistema). */
  const sistema = (params.get('sistema') ?? 'auto') as
    | 'auto'
    | 'stroke'
    | 'stableford';

  /** Campos y orden del encabezado (los mismos de la tarjeta). */
  const headerFields = useMemo(
    () => normalizeTarjetaHeader(params.get('hfields')),
    [params],
  );

  /** Tamaños de letra del encabezado (hoyo/hora, categoría, jugador). */
  const headerFonts: TarjetaHeaderFonts = useMemo(
    () => ({
      hoyoPt: clampTarjetaFont(params.get('fsh'), TARJETA_HEADER_FONTS_DEFAULT.hoyoPt),
      catPt: clampTarjetaFont(params.get('fsc'), TARJETA_HEADER_FONTS_DEFAULT.catPt),
      jugadorPt: clampTarjetaFont(
        params.get('fsj'),
        TARJETA_HEADER_FONTS_DEFAULT.jugadorPt,
      ),
    }),
    [params],
  );

  const rowMm = numParam(params.get('rowh'), 5.5, 3, 12);
  const marginMm = numParam(params.get('margin'), 8, 0, 25);

  const filters = useMemo(
    () => ({
      fecha: params.get('fecha') ?? '',
      catid: params.get('catid') ?? '',
      campoid: params.get('campoid') ?? undefined,
      sistema,
      hcpfield: normalizeTarjetaHcpField(params.get('hcpfield')),
    }),
    [params, sistema],
  );

  const { data, isLoading, error } = useTarjetasReport(filters);

  /** Tarjetas filtradas por tipo de juego (igual que en la impresión). */
  const cards = useMemo(() => {
    const all = data?.cards ?? [];
    if (sistema === 'stroke') return all.filter((c) => !c.system.includes('STABLE'));
    if (sistema === 'stableford') return all.filter((c) => c.system.includes('STABLE'));
    return all;
  }, [data, sistema]);

  /**
   * Agrupa por día → grupo de salida (hora + hoyo). El backend ya entrega las
   * tarjetas ordenadas por hora y hoyo, así que se conserva ese orden.
   */
  const blocks = useMemo<HoraBlock[]>(() => {
    const map = new Map<string, HoraBlock>();
    cards.forEach((c) => {
      const key = `${c.fecha}|${c.time}|${c.hole ?? '--'}|${c.groupId}`;
      const found = map.get(key);
      if (found) {
        found.cards.push(c);
        return;
      }
      map.set(key, {
        key,
        fecha: c.fecha,
        fechaFormato: c.fechaFormato,
        hora: c.time,
        hole: c.hole,
        categoryName: c.categoryName || c.shortName,
        cards: [c],
      });
    });
    return Array.from(map.values());
  }, [cards]);

  /** Bloques agrupados por día de juego, para imprimir un rango de fechas. */
  const days = useMemo(() => {
    const out: { fecha: string; fechaFormato: string; blocks: HoraBlock[] }[] = [];
    blocks.forEach((b) => {
      const last = out[out.length - 1];
      if (last && last.fecha === b.fecha) last.blocks.push(b);
      else out.push({ fecha: b.fecha, fechaFormato: b.fechaFormato, blocks: [b] });
    });
    return out;
  }, [blocks]);

  /** Total de jugadores listados (control rápido de captura). */
  const totalJugadores = cards.length;

  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* Estilos de impresión: sin barra de herramientas y bloques íntegros. */}
      <style>{`
        @page { size: letter; margin: 10mm; }
        @media print {
          .no-print { display: none !important; }
          .hora-block { break-inside: avoid; page-break-inside: avoid; }
          .dia-block { break-before: page; page-break-before: always; }
          .dia-block:first-of-type { break-before: auto; page-break-before: auto; }
        }
      `}</style>

      {/* ---------- Barra de herramientas (no se imprime) ---------- */}
      <div className="no-print sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="text-sm font-semibold">
          Tarjetas por hora de salida
          {totalJugadores ? (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {blocks.length} salidas · {totalJugadores} jugadores
            </span>
          ) : null}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando salidas…
        </div>
      ) : error ? (
        <div className="p-6 text-sm text-destructive">
          No se pudieron cargar las salidas.
        </div>
      ) : !blocks.length ? (
        <div className="p-6 text-sm text-muted-foreground">
          No hay salidas capturadas con los filtros seleccionados.
        </div>
      ) : (
        <div className="space-y-6 p-4">
          {days.map((d) => (
            <section key={d.fecha} className="dia-block space-y-3">
              {/* Encabezado del día: torneo, campo y fecha larga en español. */}
              <header className="flex flex-wrap items-baseline gap-2 border-b pb-1">
                <span className="text-[12pt] font-bold uppercase">
                  {tarjetaText(data?.tournament, 'TORNEO')}
                </span>
                <span className="text-[10pt] font-semibold uppercase text-foreground/70">
                  {tarjetaText(data?.course, '')}
                  {data?.course && d.fechaFormato ? ' · ' : ''}
                  {d.fechaFormato}
                </span>
              </header>

              {d.blocks.map((b) => (
                <div
                  key={b.key}
                  className="hora-block border border-foreground/70"
                  style={{ maxWidth: `${SHEET_W_MM - marginMm * 2}mm` }}
                >
                  {/* Franja del grupo: hora, hoyo de inicio y categoría. */}
                  <div className="flex items-center gap-3 border-b border-foreground/40 bg-muted/40 px-2 py-1 text-[8pt] uppercase">
                    <span className="font-bold tabular-nums">
                      {tarjetaText(b.hora, '--:--')}
                    </span>
                    <span
                      className="rounded-[0.5mm] px-1 font-bold"
                      style={startHoleStyleFor(b.hole, b.hole)}
                    >
                      {tarjetaHoleLabel(b.hole)}
                    </span>
                    <span className="truncate font-semibold text-foreground/80">
                      {tarjetaText(b.categoryName, 'SIN CATEGORÍA')}
                    </span>
                    <span className="ml-auto whitespace-nowrap text-foreground/60">
                      {b.cards.length} jugador{b.cards.length === 1 ? '' : 'es'}
                    </span>
                  </div>

                  {/* Un renglón por jugador con el diseño del encabezado. */}
                  {b.cards.map((c) => (
                    <TarjetaHeaderGrid
                      key={`${c.groupId}-${c.playerId}`}
                      card={c}
                      fields={headerFields}
                      rowMm={rowMm}
                      fonts={headerFonts}
                    />
                  ))}
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTarjetasHoras;
