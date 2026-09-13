/**
 * AdminPuttClasificadosImpresion — Impresión de "Clasificados — Putt Finales"
 * -----------------------------------------------------------------------------
 * Ruta: /admin/putt-clasificados-impresion?sexo=M|F|A&orient=vertical|horizontal
 *
 * Imprime la lista de jugadores clasificados al bracket Putt Finales en hoja
 * tamaño carta (vertical u horizontal), mostrando la HORA de registro debajo
 * de la fecha (igual que el reporte impreso de Clasificados de Approach).
 *
 * La tabla se auto-ajusta con `transform: scale()` para que NUNCA se rompa
 * en dos hojas: si el contenido medido excede el alto útil del papel, la
 * escala efectiva baja automáticamente por debajo del ajuste manual.
 *
 * Controles (ocultos al imprimir con `print:hidden`):
 *   - Rama: Caballeros / Damas / Único (según cómo esté configurada la competencia).
 *   - Orientación: Vertical / Horizontal (cambia @page y el ancho/alto útil).
 *   - Escala: 40–110 % manual; el ajuste automático puede reducirla aún más.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Printer, Trophy } from 'lucide-react';
import { usePuttFinales } from '@/hooks/useBrackets';
import { useTournamentInfo } from '@/hooks/useTournamentData';

/** Rama del bracket: caballeros, damas o competencia unificada. */
type Sexo = 'M' | 'F' | 'A';
/** Orientación de la hoja carta. */
type Orient = 'vertical' | 'horizontal';

/** Geometría de la hoja carta por orientación (mm) y etiqueta de @page. */
const SHEET: Record<Orient, { label: string; page: string; widthMm: number; heightMm: number }> = {
  vertical:   { label: 'Vertical (Carta)',   page: 'letter portrait',  widthMm: 215.9, heightMm: 279.4 },
  horizontal: { label: 'Horizontal (Carta)', page: 'letter landscape', widthMm: 279.4, heightMm: 215.9 },
};

/** Margen de impresión (mm) por lado. */
const MARGIN_MM = 10;
/** mm → px CSS a 96 dpi. */
const MM = 3.7795;

/** Etiquetas de las ramas disponibles. */
const SEXO_LABEL: Record<Sexo, string> = {
  M: 'Caballeros',
  F: 'Damas',
  A: 'Único (unificado)',
};

/** Clases del encabezado oscuro de la tabla impresa. */
const TH = 'px-2 py-1 text-[9px] font-semibold uppercase tracking-wide';
/** Clases de celda de la tabla impresa. */
const TD = 'px-2 py-[3px] text-[10px]';

/**
 * Separa una fecha/hora en fecha (DD/MM/YYYY) y hora. Acepta
 * `YYYY-MM-DD HH:MM` y `YYYY-MM-DD HH:MM:SS` (los segundos son opcionales,
 * igual que en la impresión de Approach). Si no hay hora, time es null.
 */
const splitFechaHora = (
  value: string | null | undefined,
): { date: string; time: string | null } => {
  if (!value) return { date: '—', time: null };
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(value);
  if (!m) return { date: value, time: null };
  const date = `${m[3]}/${m[2]}/${m[1]}`;
  if (!m[4]) return { date, time: null };
  return { date, time: m[6] ? `${m[4]}:${m[5]}:${m[6]}` : `${m[4]}:${m[5]}` };
};

const AdminPuttClasificadosImpresion = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [sexo, setSexo] = useState<Sexo>((params.get('sexo') as Sexo) || 'M');
  const [orient, setOrient] = useState<Orient>(
    params.get('orient') === 'horizontal' ? 'horizontal' : 'vertical',
  );
  const [scale, setScale] = useState(100);

  /** Mantiene la URL en sincronía para poder compartir/reimprimir. */
  useEffect(() => {
    const next = new URLSearchParams(params);
    next.set('sexo', sexo);
    next.set('orient', orient);
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sexo, orient]);

  const { data, isLoading } = usePuttFinales();
  const { data: torneo } = useTournamentInfo();
  const side = data?.[sexo];
  const qualifiers = side?.qualifiers ?? [];

  const sheet = SHEET[orient];
  /** Ancho útil de la hoja en px. */
  const innerWidthPx = useMemo(
    () => (sheet.widthMm - MARGIN_MM * 2) * MM,
    [sheet.widthMm],
  );
  /** Alto útil de la hoja en px. */
  const innerHeightPx = useMemo(
    () => (sheet.heightMm - MARGIN_MM * 2) * MM,
    [sheet.heightMm],
  );

  /**
   * Auto-ajuste a UNA hoja: se mide la altura real del contenido (encabezado
   * + tabla con nombres de hasta 4 renglones) y, si excede el alto útil del
   * papel, la escala efectiva se reduce por debajo del ajuste manual. Así la
   * tabla nunca se rompe en dos hojas.
   */
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    /** Mide la altura natural del contenido sin escala. */
    const measure = () => setContentHeight(el.scrollHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [qualifiers.length, innerWidthPx]);

  const effectiveScale = useMemo(() => {
    const fit = contentHeight > innerHeightPx ? innerHeightPx / contentHeight : 1;
    return Math.min(scale / 100, fit);
  }, [contentHeight, innerHeightPx, scale]);

  return (
    <div className="min-h-screen bg-muted/40 print:bg-white">
      {/* ===== @page + reglas de impresión ===== */}
      <style>{`
        @page { size: ${sheet.page}; margin: ${MARGIN_MM}mm; }
        @media print {
          html, body { background: #fff !important; }
          .putt-clasificados-sheet { box-shadow: none !important; border: 0 !important; }
          thead { display: table-header-group; }
          tr { break-inside: avoid; }
        }
      `}</style>

      {/* ===== Barra de controles (no se imprime) ===== */}
      <div className="print:hidden sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-end gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Rama
            </label>
            <Select value={sexo} onValueChange={(v) => setSexo(v as Sexo)}>
              <SelectTrigger className="h-9 w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="M">{SEXO_LABEL.M}</SelectItem>
                <SelectItem value="F">{SEXO_LABEL.F}</SelectItem>
                <SelectItem value="A">{SEXO_LABEL.A}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Orientación
            </label>
            <Select value={orient} onValueChange={(v) => setOrient(v as Orient)}>
              <SelectTrigger className="h-9 w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vertical">{SHEET.vertical.label}</SelectItem>
                <SelectItem value="horizontal">{SHEET.horizontal.label}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Escala: {scale}%
              {effectiveScale * 100 < scale
                ? ` → ajuste auto ${Math.round(effectiveScale * 100)}%`
                : ''}
            </label>
            <input
              type="range"
              min={40}
              max={110}
              step={1}
              value={scale}
              onChange={(e) => setScale(parseInt(e.target.value, 10))}
              className="w-[160px] h-9"
            />
          </div>

          <div className="ml-auto">
            <Button onClick={() => window.print()} className="gap-2" disabled={qualifiers.length === 0}>
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
            <Loader2 className="h-5 w-5 animate-spin" /> Cargando clasificados…
          </div>
        ) : !side?.config ? (
          <div className="py-16 text-center text-muted-foreground">
            El bracket Putt Finales {SEXO_LABEL[sexo].toLowerCase()} aún no se ha configurado.
          </div>
        ) : qualifiers.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            Aún no hay jugadores clasificados.
          </div>
        ) : (
          <div
            className="putt-clasificados-sheet bg-white border border-border shadow-card p-2"
            style={{ width: `${innerWidthPx}px` }}
          >
            <div
              ref={contentRef}
              style={{
                transform: `scale(${effectiveScale})`,
                transformOrigin: 'top left',
                width: `${100 / effectiveScale}%`,
              }}
            >
              {/* Encabezado del reporte */}
              <div className="flex items-center justify-between gap-3 mb-2 px-1">
                <div className="flex items-center gap-2 min-w-0">
                  <Trophy className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wide truncate">
                      {torneo?.name || 'Torneo'}
                    </p>
                    <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                      Clasificados — Putt Finales · {SEXO_LABEL[sexo]}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] font-semibold shrink-0">
                  Jugadores: {qualifiers.length}
                  {side.bracket_size ? ` de ${side.bracket_size}` : ''}
                </p>
              </div>

              {/* Tabla de clasificados con fecha y hora de registro */}
              <table className="w-full bg-white">
                <thead className="bg-primary text-primary-foreground">
                  <tr>
                    <th className={`${TH} text-center w-8`}>#</th>
                    <th className={`${TH} text-left`}>Jugador</th>
                    <th className={`${TH} text-center w-10`}>Cat</th>
                    <th className={`${TH} text-right w-12`}>Dist</th>
                    <th className={`${TH} text-right w-24`}>Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {qualifiers.map((q) => (
                    <tr key={`${q.rank}-${q.name}`} className="border-t border-border/40">
                      <td className={`${TD} text-center font-semibold`}>{q.rank}</td>
                      <td className={`${TD}`}>{q.name}</td>
                      <td className={`${TD} text-center`}>{q.categoria ?? '—'}</td>
                      <td className={`${TD} text-right font-semibold leading-tight`}>
                        {q.distance != null ? (
                          <>
                            <span className="block">{q.distance.toFixed(2)}</span>
                            <span className="block text-[7px]">mts</span>
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      {(() => {
                        const { date, time } = splitFechaHora(q.fecha_full ?? q.fecha);
                        return (
                          <td className={`${TD} text-right whitespace-nowrap leading-tight`}>
                            <span className="block">{date}</span>
                            {time && <span className="block text-[7px]">{time}</span>}
                          </td>
                        );
                      })()}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPuttClasificadosImpresion;
