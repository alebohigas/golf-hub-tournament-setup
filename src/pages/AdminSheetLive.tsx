/**
 * AdminSheetLive — ALIEN SYSTEM → SHEET LIVE (página imprimible)
 * -----------------------------------------------------------------------------
 * Formato de captura en papel para una ESTACIÓN (p. ej. Hoyo 4). Lista los
 * grupos en el orden en que llegan a la estación (hora estimada del Time Line)
 * y, por cada jugador, casillas vacías para anotar los hoyos de captura.
 *
 * Sólo se muestran los hoyos de captura que el grupo YA jugó al llegar a la
 * estación: si salió por H01 y la estación es H04 → h01..h04; si salió por H10
 * → h17, h18, h01..h04.
 *
 * URL: /admin/sheet-live?fecha=YYYY-MM-DD&campoid=N&est=4&cap=17,18,1,2,3,4
 * Los datos provienen de `/api/timeline.php` (mismo dataset del Time Line).
 */
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTimeLineReport, type TimeLineGroup } from '@/hooks/useTimeLine';
import { resolveTimeLineStartHole } from '@/lib/timelineStartHole';

/** Formatea un hoyo como "H01". */
const hLabel = (n: number) => `H${String(n).padStart(2, '0')}`;

/** Posición (0–17) del hoyo `hole` en el orden de juego de quien sale por `start`. */
const playIndex = (start: number, hole: number) => (hole - start + 18) % 18;

/** Parsea la lista de hoyos de captura ("h17,h18,1,2") a números 1–18 únicos. */
export const parseCaptureHoles = (raw: string): number[] => {
  const out: number[] = [];
  raw.split(/[,\s]+/).forEach((t) => {
    const n = Number(t.replace(/[^0-9]/g, ''));
    if (n >= 1 && n <= 18 && !out.includes(n)) out.push(n);
  });
  return out;
};

/**
 * Hoyos de captura que un grupo ya jugó al llegar a la estación, en orden
 * de juego del grupo.
 */
export const holesForGroup = (start: number, station: number, capture: number[]) =>
  capture
    .filter((h) => playIndex(start, h) <= playIndex(start, station))
    .sort((a, b) => playIndex(start, a) - playIndex(start, b));

/** Página imprimible SHEET LIVE. */
const AdminSheetLive = () => {
  const [sp] = useSearchParams();
  const fecha = sp.get('fecha') ?? '';
  const campoid = sp.get('campoid') ?? '';
  const station = Math.min(18, Math.max(1, Number(sp.get('est')) || 4));
  const capture = useMemo(() => parseCaptureHoles(sp.get('cap') ?? ''), [sp]);

  /** Todos los grupos del día (todos los hoyos de salida y horas). */
  const filters = useMemo(
    () => (fecha ? { fecha, campoid, hi: '1', hf: '18', hri: '00:00', hrf: '23:59' } : null),
    [fecha, campoid]
  );
  const { data, isLoading, error } = useTimeLineReport(filters, !!filters);

  /** Grupos ordenados por hora estimada en la estación, con sus hoyos a capturar. */
  const rows = useMemo(() => {
    if (!data) return [];
    return data.groups
      .map((g: TimeLineGroup) => {
        const start = resolveTimeLineStartHole(g, data.holes) ?? 1;
        return {
          g,
          start,
          at: g.times?.[String(station)] ?? '',
          holes: holesForGroup(start, station, capture),
        };
      })
      .filter((r) => r.g.players.length > 0)
      .sort((a, b) => (a.at || '99:99').localeCompare(b.at || '99:99'));
  }, [data, station, capture]);

  if (!fecha) return <p className="p-8">Faltan parámetros (fecha).</p>;

  return (
    <div className="sheet-live min-h-screen bg-background p-6 text-foreground print:p-0">
      {/* Reglas de impresión: carta vertical, grupos sin cortarse. */}
      <style>{`@page { size: letter portrait; margin: 10mm; }
        .sheet-live-group { break-inside: avoid; }`}</style>

      <div className="mb-4 flex items-center justify-between print:hidden">
        <h1 className="text-xl font-bold">Sheet Live</h1>
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="h-4 w-4" /> Imprimir
        </Button>
      </div>

      {/* Encabezado del reporte. */}
      <header className="mb-3 border-b-2 border-foreground pb-2 text-center">
        <h2 className="text-2xl font-bold uppercase">{data?.tournament}</h2>
        <p className="font-semibold uppercase">
          {data?.course} / {data?.fechaFormato || fecha}
        </p>
        <p className="text-lg font-bold">
          ESTACIÓN {hLabel(station)} · Hoyos captura: {capture.map(hLabel).join(', ')}
        </p>
      </header>

      {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin" />}
      {error && <p className="text-destructive">No se pudo cargar el reporte.</p>}

      <div className="space-y-2">
        {rows.map(({ g, start, at, holes }) => (
          <table key={g.id} className="sheet-live-group w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-foreground px-2 py-1 text-left">
                  {at ? `${at} · ` : ''}Sale {g.time} {hLabel(start)} · {g.categoryName || g.shortName}
                </th>
                {holes.map((h) => (
                  <th key={h} className="w-14 border border-foreground py-1 text-center">
                    {hLabel(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {g.players.map((p) => (
                <tr key={p.id}>
                  <td className="h-8 border border-foreground px-2 font-medium">{p.name}</td>
                  {holes.map((h) => (
                    <td key={h} className="border border-foreground" />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    </div>
  );
};

export default AdminSheetLive;
