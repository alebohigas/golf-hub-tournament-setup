/**
 * AdminApproachImpresion — Impresión de "Clasificados de Approach"
 * -----------------------------------------------------------------------------
 * Ruta: /admin/approach-impresion?orden=asc|desc
 *
 * Imprime la lista final de clasificados (ya recortada al límite de lugares de
 * cada premio) en hoja tamaño carta vertical, con orden ascendente o
 * descendente por distancia. El desempate siempre es fecha/hora de registro.
 *
 * Controles (ocultos al imprimir con `print:hidden`):
 *   - Orden: Ascendente / Descendente.
 *   - Escala: 70–110 % por si la impresora recorta.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Crosshair, Loader2, Printer } from 'lucide-react';
import { useApproachClasificados, type ApproachOrden } from '@/hooks/useApproachClasificados';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { useTournamentInfo } from '@/hooks/useTournamentData';

/** Margen de impresión (mm) por lado. */
const MARGIN_MM = 10;
/** mm → px CSS a 96 dpi. */
const MM = 3.7795;
/** Ancho útil de la hoja carta vertical, en px. */
const INNER_WIDTH_PX = (215.9 - MARGIN_MM * 2) * MM;

/** Clases del encabezado oscuro de la tabla impresa. */
const TH = 'px-2 py-1 text-[9px] font-semibold uppercase tracking-wide';
/** Clases de celda de la tabla impresa. */
const TD = 'px-2 py-[3px] text-[10px]';

/**
 * Separa una fecha/hora `YYYY-MM-DD HH:MM:SS` en fecha (DD/MM/YYYY) y hora.
 * Si no tiene hora, time es null.
 */
const splitFechaHora = (
  value: string | null | undefined,
): { date: string; time: string | null } => {
  if (!value) return { date: '—', time: null };
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?/.exec(value);
  if (!m) return { date: value, time: null };
  const date = `${m[3]}/${m[2]}/${m[1]}`;
  if (!m[4]) return { date, time: null };
  return { date, time: `${m[4]}:${m[5]}:${m[6]}` };
};

const AdminApproachImpresion = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [orden, setOrden] = useState<ApproachOrden>(
    params.get('orden') === 'desc' ? 'desc' : 'asc',
  );
  const [scale, setScale] = useState(100);

  /** Mantiene la URL en sincronía para poder compartir/reimprimir. */
  useEffect(() => {
    const next = new URLSearchParams(params);
    next.set('orden', orden);
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orden]);

  const { data, isLoading } = useApproachClasificados(orden);
  const { data: siteConfig } = useSiteConfig();
  const { data: torneo } = useTournamentInfo();

  const title = siteConfig?.approach_config?.title || 'Clasificados de Approach';
  const players = data?.players ?? [];

  return (
    <div className="min-h-screen bg-muted/40 print:bg-white">
      {/* ===== @page: carta vertical ===== */}
      <style>{`
        @page { size: letter portrait; margin: ${MARGIN_MM}mm; }
        @media print {
          html, body { background: #fff !important; }
          .approach-sheet { box-shadow: none !important; border: 0 !important; }
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
              Orden por distancia
            </label>
            <Select value={orden} onValueChange={(v) => setOrden(v as ApproachOrden)}>
              <SelectTrigger className="h-9 w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascendente</SelectItem>
                <SelectItem value="desc">Descendente</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
            <Button onClick={() => window.print()} className="gap-2" disabled={players.length === 0}>
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
        ) : players.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            No hay jugadores clasificados de approach.
          </div>
        ) : (
          <div
            className="approach-sheet bg-white border border-border shadow-card p-2"
            style={{ width: `${INNER_WIDTH_PX}px` }}
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
                  <Crosshair className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wide truncate">
                      {torneo?.name || 'Torneo'}
                    </p>
                    <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                      {title} — Orden {orden === 'asc' ? 'ascendente' : 'descendente'}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] font-semibold shrink-0">
                  Jugadores: {players.length}
                </p>
              </div>

              {/* Tabla de clasificados (sin columna de premio) */}
              <table className="w-full bg-white">
                <thead className="bg-primary text-primary-foreground">
                  <tr>
                    <th className={`${TH} text-center w-8`}>Pos</th>
                    <th className={`${TH} text-left`}>Jugador</th>
                    <th className={`${TH} text-left`}>Club</th>
                    <th className={`${TH} text-center w-10`}>Cat</th>
                    <th className={`${TH} text-right w-12`}>Dist</th>
                    <th className={`${TH} text-right w-24`}>Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p) => (
                    <tr key={`${p.id}-${p.position}`} className="border-t border-border/40">
                      <td className={`${TD} text-center font-semibold`}>{p.position}</td>
                      <td className={`${TD} whitespace-nowrap`}>{p.name}</td>
                      <td className={`${TD} truncate`}>{p.club}</td>
                      <td className={`${TD} text-center`}>{p.category}</td>
                      <td className={`${TD} text-right font-semibold leading-tight`}>
                        <span className="block">{p.distance.toFixed(2)}</span>
                        <span className="block text-[7px]">mts</span>
                      </td>
                      {(() => {
                        const { date, time } = splitFechaHora(p.fecha);
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

export default AdminApproachImpresion;
