/**
 * SheetLiveCaptura — App de captura de golpes (SO) para SHEET LIVE
 * -----------------------------------------------------------------------------
 * Un grupo a la vez: el capturista elige el grupo (en el orden de llegada a la
 * estación) y escribe los golpes de cada jugador sólo en los hoyos de captura
 * que ese grupo ya jugó. Cada casilla se guarda al salir de ella (o con Enter)
 * en `tarjetas.h{n}` vía `/api/sheet_live_captura.php`. Se puede corregir
 * cualquier golpe ya capturado; vaciar la casilla lo borra.
 */
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API_BASE_URL } from '@/config/api';
import { getTorneoId } from '@/hooks/useTorneoId';
import type { TimeLineGroup } from '@/hooks/useTimeLine';

/** Fila de grupo preparada por la página Sheet Live. */
export interface SheetLiveRow {
  g: TimeLineGroup;
  start: number;
  at: string;
  holes: number[];
}

/** Jugador con los golpes actuales de su tarjeta. */
interface CapturaPlayer {
  id: string;
  name: string;
  tarjetaid: string;
  holes: Record<string, number | null>;
}

/** Estado visual por casilla. */
type CellState = 'saving' | 'saved' | 'error';

const ENDPOINT = `${API_BASE_URL}/sheet_live_captura.php`;
/** Formatea un hoyo como "H01". */
const hLabel = (n: number) => `H${String(n).padStart(2, '0')}`;

interface Props {
  rows: SheetLiveRow[];
  groupId: string;
  onGroupChange: (id: string) => void;
}

/** Panel de captura de un grupo. */
const SheetLiveCaptura = ({ rows, groupId, onGroupChange }: Props) => {
  const qc = useQueryClient();
  const torneoid = getTorneoId() ?? '';
  const idx = Math.max(0, rows.findIndex((r) => r.g.id === groupId));
  const row = rows[idx];

  /** Golpes actuales del grupo (password lo reemplaza el interceptor de admin). */
  const { data, isLoading, error } = useQuery({
    queryKey: ['sheet-live-captura', torneoid, row?.g.id],
    enabled: !!row && !!torneoid,
    queryFn: async () => {
      const qs = new URLSearchParams({ torneoid: String(torneoid), grupo: row!.g.id, password: 'admin2025' });
      const r = await fetch(`${ENDPOINT}?${qs}`, { cache: 'no-store' });
      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.error || `Error ${r.status}`);
      return j.players as CapturaPlayer[];
    },
  });

  /** Borradores locales por casilla "tarjetaid-hoyo" y su estado de guardado. */
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [cells, setCells] = useState<Record<string, CellState>>({});
  useEffect(() => { setDrafts({}); setCells({}); }, [row?.g.id]);

  /** Guarda una casilla si cambió respecto al valor en la tarjeta. */
  const save = async (p: CapturaPlayer, hole: number) => {
    const key = `${p.tarjetaid}-${hole}`;
    if (!(key in drafts)) return;
    const raw = drafts[key].trim();
    const current = p.holes[String(hole)];
    const next = raw === '' ? null : Number(raw);
    if (next !== null && (!Number.isInteger(next) || next < 1 || next > 20)) {
      setCells((c) => ({ ...c, [key]: 'error' }));
      return;
    }
    if (next === current) return;
    setCells((c) => ({ ...c, [key]: 'saving' }));
    try {
      const r = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ torneoid, grupo: row!.g.id, tarjetaid: p.tarjetaid, hoyo: hole, golpes: next, password: 'admin2025' }),
      });
      if (!r.ok) throw new Error();
      /** Refleja el valor guardado en caché para no recargar todo el grupo. */
      qc.setQueryData<CapturaPlayer[]>(['sheet-live-captura', torneoid, row!.g.id], (old) =>
        old?.map((x) => x.tarjetaid === p.tarjetaid ? { ...x, holes: { ...x.holes, [String(hole)]: next } } : x));
      setCells((c) => ({ ...c, [key]: 'saved' }));
    } catch {
      setCells((c) => ({ ...c, [key]: 'error' }));
    }
  };

  if (!rows.length) return <p className="text-sm text-muted-foreground">No hay grupos para esta fecha.</p>;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      {/* Selector de grupo con navegación anterior / siguiente. */}
      <div className="space-y-1">
        <Label className="text-xs">Grupo (orden de llegada a la estación)</Label>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" disabled={idx === 0} onClick={() => onGroupChange(rows[idx - 1].g.id)} aria-label="Grupo anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Select value={row.g.id} onValueChange={onGroupChange}>
            <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {rows.map((r, i) => (
                <SelectItem key={r.g.id} value={r.g.id}>
                  {i + 1}. {r.at ? `${r.at} · ` : ''}Sale {r.g.time} {hLabel(r.start)} · {r.g.categoryName || r.g.shortName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" disabled={idx >= rows.length - 1} onClick={() => onGroupChange(rows[idx + 1].g.id)} aria-label="Grupo siguiente">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin" />}
      {error && <p className="text-sm text-destructive">No se pudo cargar el grupo: {(error as Error).message}</p>}

      {/* Tabla de captura: jugador × hoyos que el grupo ya jugó. */}
      {data && (
        <div className="overflow-x-auto rounded-md border bg-card">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="px-2 py-2 text-left">Jugador</th>
                {row.holes.map((h) => <th key={h} className="px-1 py-2 text-center text-xs">{hLabel(h)}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.tarjetaid} className="border-t">
                  <td className="max-w-[140px] truncate px-2 py-1 font-medium" title={p.name}>{p.name}</td>
                  {row.holes.map((h) => {
                    const key = `${p.tarjetaid}-${h}`;
                    const val = drafts[key] ?? (p.holes[String(h)] ?? '').toString();
                    const st = cells[key];
                    return (
                      <td key={h} className="relative px-0.5 py-1">
                        <Input
                          inputMode="numeric"
                          maxLength={2}
                          value={val}
                          aria-label={`${p.name} ${hLabel(h)}`}
                          onChange={(e) => setDrafts((d) => ({ ...d, [key]: e.target.value.replace(/[^0-9]/g, '') }))}
                          onBlur={() => save(p, h)}
                          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                          className={`h-10 w-11 px-0 text-center text-base ${st === 'error' ? 'border-destructive' : st === 'saved' ? 'border-primary' : ''}`}
                        />
                        {st === 'saving' && <Loader2 className="absolute right-0 top-0 h-3 w-3 animate-spin" />}
                        {st === 'saved' && <Check className="absolute right-0 top-0 h-3 w-3 text-primary" />}
                        {st === 'error' && <AlertCircle className="absolute right-0 top-0 h-3 w-3 text-destructive" />}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-muted-foreground">Se guarda sólo el golpe de cada hoyo al salir de la casilla. Deja la casilla vacía para borrar un golpe.</p>
    </div>
  );
};

export default SheetLiveCaptura;
