/**
 * AdminBanderasImpresion — Impresión del PIN SHEET (Banderas)
 * -----------------------------------------------------------------------------
 * Ruta: /admin/banderas-impresion?fecha=YYYY-MM-DD&orient=vertical|horizontal
 *
 * Objetivo: las 18 tarjetas de posición de bandera SIEMPRE caben en UNA hoja
 * tamaño carta, tanto en vertical (portrait, 3 columnas × 6 renglones) como en
 * horizontal (landscape, 6 columnas × 3 renglones).
 *
 * Controles (se ocultan al imprimir con `print:hidden`):
 *   - Fecha: cualquier fecha guardada del pin sheet (incluye futuras, modo admin).
 *   - Orientación: Vertical / Horizontal — cambia @page y la rejilla.
 *   - Escala: ajuste fino 70–110 % por si la impresora recorta.
 *
 * La geometría de la hoja se define en mm y el bloque se escala con
 * `transform: scale()`, de modo que la vista previa en pantalla es idéntica
 * a lo que sale por la impresora.
 */

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Printer, Loader2, Flag } from 'lucide-react';
import GreenCard from '@/components/banderas/GreenCard';
import { useBanderas } from '@/hooks/useBanderasData';
import { useTournamentInfo } from '@/hooks/useTournamentData';

/** Orientación de la hoja carta. */
type Orient = 'vertical' | 'horizontal';

/** Geometría de la hoja carta (mm) y rejilla de tarjetas por orientación. */
const SHEET: Record<Orient, {
  label: string;
  page: string;      // valor de @page size
  widthMm: number;
  heightMm: number;
  cols: number;      // columnas de la rejilla
}> = {
  vertical:   { label: 'Vertical (Carta)',   page: 'letter portrait',  widthMm: 215.9, heightMm: 279.4, cols: 3 },
  horizontal: { label: 'Horizontal (Carta)', page: 'letter landscape', widthMm: 279.4, heightMm: 215.9, cols: 6 },
};

/** Margen de impresión (mm) por lado. */
const MARGIN_MM = 8;
/** mm → px CSS a 96 dpi. */
const MM = 3.7795;

/** Formatea YYYY-MM-DD a texto legible (timezone-safe). */
const fmtFecha = (s: string): string => {
  const [y, m, d] = s.split('-').map((n) => parseInt(n, 10));
  if (!y || !m || !d) return s;
  return new Date(y, m - 1, d).toLocaleDateString('es-MX', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
};

const AdminBanderasImpresion = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  // ============= Estado de impresión (sincronizado con la URL) =============
  const [fecha, setFecha] = useState<string>(params.get('fecha') ?? '');
  const [orient, setOrient] = useState<Orient>(
    params.get('orient') === 'horizontal' ? 'horizontal' : 'vertical',
  );
  const [scale, setScale] = useState<number>(100);

  /** Datos del pin sheet (modo admin: incluye fechas futuras). */
  const { data, isLoading } = useBanderas({ fecha: fecha || undefined, admin: true });
  const holes = data?.holes ?? [];
  const dates: string[] = data?.availableDates ?? [];
  const activeDate = fecha || data?.activeDate || '';

  const { data: torneo } = useTournamentInfo();

  /** Precarga la fecha activa devuelta por el backend. */
  useEffect(() => {
    if (!fecha && data?.activeDate) setFecha(data.activeDate);
  }, [fecha, data?.activeDate]);

  /** Mantiene la URL en sincronía para poder compartir/reimprimir. */
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (activeDate) next.set('fecha', activeDate);
    next.set('orient', orient);
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDate, orient]);

  const sheet = SHEET[orient];

  /** Ancho útil de la hoja en px (para dimensionar la rejilla en pantalla). */
  const innerWidthPx = useMemo(
    () => (sheet.widthMm - MARGIN_MM * 2) * MM,
    [sheet.widthMm],
  );
  const innerHeightPx = useMemo(
    () => (sheet.heightMm - MARGIN_MM * 2) * MM,
    [sheet.heightMm],
  );

  /**
   * Auto-ajuste vertical: garantiza que las 18 tarjetas SIEMPRE quepan en
   * UNA hoja. Calcula la altura intrínseca de la rejilla (SVG 200:240 +
   * encabezado/pie compactos) y, si excede el alto útil, reduce la escala
   * efectiva por debajo del ajuste manual del usuario.
   */
  const GAP_PX = 6;        // gap-1.5 de la rejilla
  const HEADER_PX = 38;    // encabezado del reporte (título + fecha + margen)
  const CARD_CHROME_PX = 78; // header + footer + padding + borde de la tarjeta compacta
  const VB_ASPECT = 240 / 200; // viewBox de GreenCard: alto/ancho

  const effectiveScale = useMemo(() => {
    const rows = Math.ceil(holes.length / sheet.cols) || 1;
    const cardW = (innerWidthPx - GAP_PX * (sheet.cols - 1)) / sheet.cols;
    const cardH = cardW * VB_ASPECT + CARD_CHROME_PX;
    const gridH = cardH * rows + GAP_PX * (rows - 1) + HEADER_PX;
    const fit = gridH > innerHeightPx ? innerHeightPx / gridH : 1;
    return Math.min(scale / 100, fit);
  }, [holes.length, sheet.cols, innerWidthPx, innerHeightPx, scale]);

  return (
    <div className="min-h-screen bg-muted/40 print:bg-white">
      {/* ===== @page: fuerza carta con la orientación elegida ===== */}
      <style>{`
        @page { size: ${sheet.page}; margin: ${MARGIN_MM}mm; }
        @media print {
          html, body { background: #fff !important; }
          .pin-sheet { box-shadow: none !important; border: 0 !important; margin: 0 !important; }
        }
      `}</style>

      {/* ===== Barra de controles (no se imprime) ===== */}
      <div className="print:hidden sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-end gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>

          {/* Fecha del pin sheet */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Fecha
            </label>
            <Select value={activeDate} onValueChange={setFecha}>
              <SelectTrigger className="h-9 w-[240px]">
                <SelectValue placeholder="Elegir fecha…" />
              </SelectTrigger>
              <SelectContent>
                {dates.map((d) => (
                  <SelectItem key={d} value={d}>{fmtFecha(d)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Orientación de la hoja */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Orientación
            </label>
            <Select value={orient} onValueChange={(v) => setOrient(v as Orient)}>
              <SelectTrigger className="h-9 w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vertical">{SHEET.vertical.label}</SelectItem>
                <SelectItem value="horizontal">{SHEET.horizontal.label}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Escala fina */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Escala: {scale}%
            </label>
            <input
              type="range"
              min={70}
              max={110}
              step={1}
              value={scale}
              onChange={(e) => setScale(parseInt(e.target.value, 10))}
              className="w-[160px] h-9"
            />
          </div>

          <div className="ml-auto">
            <Button onClick={() => window.print()} className="gap-2" disabled={holes.length === 0}>
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      {/* ===== Hoja ===== */}
      <div className="py-6 print:py-0 flex justify-center">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-16">
            <Loader2 className="h-5 w-5 animate-spin" /> Cargando pin sheet…
          </div>
        ) : holes.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            No hay posiciones de bandera guardadas para esta fecha.
          </div>
        ) : (
          <div
            className="pin-sheet bg-card border border-border shadow-card"
            style={{
              width: `${innerWidthPx}px`,
              minHeight: `${innerHeightPx}px`,
            }}
          >
            <div
              style={{
                transform: `scale(${scale / 100})`,
                transformOrigin: 'top left',
                width: `${100 / (scale / 100)}%`,
              }}
            >
              {/* Encabezado del reporte */}
              <div className="flex items-center justify-between gap-3 mb-2 px-1">
                <div className="flex items-center gap-2 min-w-0">
                  <Flag className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-foreground truncate">
                      {torneo?.name || 'Posición de Banderas'}
                    </p>
                    <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                      Posición de banderas — Pin Sheet
                    </p>
                  </div>
                </div>
                <p className="text-[10px] font-semibold capitalize text-foreground shrink-0">
                  {activeDate ? fmtFecha(activeDate) : ''}
                </p>
              </div>

              {/* Rejilla de tarjetas: 3 × 6 (vertical) o 6 × 3 (horizontal) */}
              <div
                className="grid gap-1.5"
                style={{ gridTemplateColumns: `repeat(${sheet.cols}, minmax(0, 1fr))` }}
              >
                {holes.map((h) => (
                  <GreenCard key={h.hole} data={h} compact />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBanderasImpresion;
