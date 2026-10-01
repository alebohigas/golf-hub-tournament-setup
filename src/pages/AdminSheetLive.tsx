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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTimeLineReport, type TimeLineGroup } from '@/hooks/useTimeLine';
import { resolveTimeLineStartHole } from '@/lib/timelineStartHole';
import SheetLiveCaptura from '@/components/admin/SheetLiveCaptura';

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
  const [sp, setSp] = useSearchParams();
  const fecha = sp.get('fecha') ?? '';
  const campoid = sp.get('campoid') ?? '';
  const station = Math.min(18, Math.max(1, Number(sp.get('est')) || 4));
  const capture = useMemo(() => parseCaptureHoles(sp.get('cap') ?? ''), [sp]);
  /** Escala y número de columnas persistidos en la URL del reporte. */
  const scale = Math.min(120, Math.max(60, Number(sp.get('scale')) || 100));
  const columns = sp.get('cols') === '1' ? 1 : 2;
  /** Modo de la página: hoja imprimible o app de captura (?modo=captura&grupo=ID). */
  const modo = sp.get('modo') === 'captura' ? 'captura' : 'hoja';
  const grupo = sp.get('grupo') ?? '';

  /** Actualiza una opción de presentación sin perder los filtros existentes. */
  const setLayoutOption = (key: 'scale' | 'cols' | 'modo' | 'grupo', value: string) => {
    const next = new URLSearchParams(sp);
    next.set(key, value);
    setSp(next, { replace: true });
  };

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
      {/* La misma geometría controla pantalla e impresión; cada grupo permanece íntegro. */}
      <style>{`@page { size: letter portrait; margin: 8mm; }
        .sheet-live-group { break-inside: avoid; page-break-inside: avoid; }
        @media print {
          .sheet-live-report { transform: scale(var(--sheet-live-scale)); transform-origin: top left; width: calc(100% / var(--sheet-live-scale)); }
          .sheet-live-grid { display: grid !important; grid-template-columns: repeat(var(--sheet-live-columns), minmax(0, 1fr)) !important; }
        }`}</style>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 print:hidden">
        <h1 className="text-xl font-bold">Sheet Live</h1>
        <div className="flex flex-wrap items-end gap-3">
          {/* Cambia entre la hoja imprimible y la app de captura de golpes. */}
          <div className="flex gap-1">
            <Button variant={modo === 'hoja' ? 'default' : 'outline'} onClick={() => setLayoutOption('modo', 'hoja')}>Hoja</Button>
            <Button variant={modo === 'captura' ? 'default' : 'outline'} onClick={() => setLayoutOption('modo', 'captura')}>Captura</Button>
          </div>
          {modo === 'hoja' && <>
          {/* Selector de distribución: un grupo ancho o dos grupos lado a lado. */}
          <div className="space-y-1">
            <Label className="text-xs">Columnas</Label>
            <Select value={String(columns)} onValueChange={(value) => setLayoutOption('cols', value)}>
              <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 columna</SelectItem>
                <SelectItem value="2">2 columnas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Ajuste fino de tamaño para distintas impresoras. */}
          <div className="space-y-1">
            <Label htmlFor="sheet-live-scale" className="text-xs">Escala (%)</Label>
            <Input
              id="sheet-live-scale"
              type="number"
              min={60}
              max={120}
              step={5}
              value={scale}
              onChange={(event) => setLayoutOption('scale', event.target.value)}
              className="h-9 w-24"
            />
          </div>
          <Button onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" /> Imprimir
          </Button>
          </>}
        </div>
      </div>

      {modo === 'captura' && (
        <div className="print:hidden">
          <p className="mb-3 text-center text-sm font-semibold">{data?.course} / {data?.fechaFormato || fecha} · ESTACIÓN {hLabel(station)}</p>
          {isLoading ? <Loader2 className="mx-auto h-6 w-6 animate-spin" /> : (
            <SheetLiveCaptura rows={rows} groupId={grupo} onGroupChange={(id) => setLayoutOption('grupo', id)} />
          )}
        </div>
      )}

      {modo === 'hoja' && <div
        className="sheet-live-report mx-auto max-w-[980px]"
        style={{
          '--sheet-live-scale': String(scale / 100),
          '--sheet-live-columns': String(columns),
          transform: `scale(${scale / 100})`,
          transformOrigin: 'top center',
          width: `${10000 / scale}%`,
        } as React.CSSProperties}
      >
        {/* Encabezado compacto del reporte. */}
        <header className="mb-2 border-b-2 border-foreground pb-1 text-center">
          <h2 className="text-lg font-bold uppercase leading-tight">{data?.tournament}</h2>
          <p className="text-xs font-semibold uppercase leading-tight">
            {data?.course} / {data?.fechaFormato || fecha}
          </p>
          <p className="text-sm font-bold leading-tight">
            ESTACIÓN {hLabel(station)} · Hoyos captura: {capture.map(hLabel).join(', ')}
          </p>
        </header>

        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin" />}
        {error && <p className="text-destructive">No se pudo cargar el reporte.</p>}

        {/* Rejilla compacta de grupos: una o dos columnas según la elección. */}
        <div
          className="sheet-live-grid grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {rows.map(({ g, start, at, holes }) => (
            <table key={g.id} className="sheet-live-group w-full table-fixed border-collapse text-[10px] leading-tight">
              <thead>
                <tr>
                  <th className="border border-foreground px-1 py-0.5 text-left">
                    {at ? `${at} · ` : ''}Sale {g.time} {hLabel(start)} · {g.categoryName || g.shortName}
                  </th>
                  {holes.map((h) => (
                    <th key={h} className="w-8 border border-foreground px-0 py-0.5 text-center text-[9px]">
                      {hLabel(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {g.players.map((p) => (
                  <tr key={p.id}>
                    <td className="h-6 truncate border border-foreground px-1 font-medium" title={p.name}>{p.name}</td>
                    {holes.map((h) => (
                      <td key={h} className="border border-foreground" />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
      </div>}
    </div>
  );
};

export default AdminSheetLive;
