/**
 * AdminBanderas
 * ---------------------------------------------------------------
 * Pestaña admin para editar el pin sheet (tabla `banderas`) del torneo
 * activo, organizado **por fecha** (cada fecha = pin sheet de ese día).
 *
 *  - Selector de fecha arriba: permite editar la fecha del día, una pasada
 *    o una futura (pre-cargar todas las posiciones del torneo).
 *  - Botones rápidos para cargar cualquier fecha ya guardada.
 *  - Permite "duplicar" la configuración de otra fecha como punto de partida.
 *  - Replace-all SCOPED a la (torneo, fecha) seleccionada.
 *
 * Si el torneo no tiene datos guardados para una fecha <= hoy, la página
 * pública /banderas mostrará un mensaje de disculpa. El admin puede
 * además ocultarla completamente desde la pestaña "Página".
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, Flag, Plus, Trash2, RotateCcw, Calendar, Copy } from 'lucide-react';
import { useTorneoId } from '@/hooks/useTorneoId';
import { useBanderas, useSaveBanderas } from '@/hooks/useBanderasData';
import type { PinSheetHole, PinSide } from '@/data/banderasData';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/** Fila vacía para un hoyo nuevo. */
const blankHole = (hole: number): PinSheetHole => ({
  hole,
  depth: 0,
  pinFromFront: 0,
  pinFromSide: 0,
  pinSide: 'L',
  slope: 0,
  title: '',
});

/** 18 filas vacías 1..18 (para inicializar un torneo nuevo). */
const seed18 = (): PinSheetHole[] =>
  Array.from({ length: 18 }, (_, i) => blankHole(i + 1));

/** Hoy en YYYY-MM-DD usando timezone local del navegador. */
const todayLocal = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/** Render legible de una fecha YYYY-MM-DD (timezone-safe). */
const fmtFecha = (s: string): string => {
  const [y, m, d] = s.split('-').map(n => parseInt(n, 10));
  if (!y || !m || !d) return s;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('es-MX', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });
};

const AdminBanderas = () => {
  const { torneoId } = useTorneoId();
  const save = useSaveBanderas();
  const { toast } = useToast();

  /** Fecha que se está editando. Default = hoy. */
  const [fecha, setFecha] = useState<string>(todayLocal());

  /** Trae los holes de la fecha seleccionada + lista de TODAS las fechas (admin). */
  const { data, isLoading } = useBanderas({ fecha, admin: true });

  /** Copia editable local. */
  const [rows, setRows] = useState<PinSheetHole[]>([]);

  /** Hidrata cada vez que cambia la fecha o llegan datos. Si la fecha aún
   *  no tiene datos, deja la tabla vacía (admin elige seedear). */
  useEffect(() => {
    const holes = data?.holes ?? [];
    setRows([...holes].sort((a, b) => a.hole - b.hole));
    // se hidrata por (fecha, data) — el queryKey ya cambia con `fecha`.
  }, [data, fecha]);

  /** Fechas conocidas para este torneo (incluye futuras porque admin=true). */
  const knownDates: string[] = data?.availableDates ?? [];
  const today = data?.today ?? todayLocal();

  /** Patch in-place de una fila. */
  const update = (idx: number, patch: Partial<PinSheetHole>) => {
    setRows(prev => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  /** Convierte input a número (acepta negativos para `slope`). */
  const numOrZero = (v: string): number => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
  };

  /** Agrega un hoyo al final (siguiente número disponible). */
  const addHole = () => {
    const next = rows.length === 0
      ? 1
      : Math.max(...rows.map(r => r.hole)) + 1;
    setRows(prev => [...prev, blankHole(next)]);
  };

  /** Quita la fila idx. */
  const removeHole = (idx: number) => {
    setRows(prev => prev.filter((_, i) => i !== idx));
  };

  /** Llena la tabla con 18 filas 1..18 sin tocar las ya existentes. */
  const fill18 = () => {
    if (rows.length > 0) {
      const ok = window.confirm(
        '¿Reemplazar la tabla actual con 18 hoyos en blanco (1..18)?',
      );
      if (!ok) return;
    }
    setRows(seed18());
  };

  /** Limpia toda la tabla (no guarda hasta presionar Guardar). */
  const clearAll = () => {
    if (!window.confirm('¿Vaciar la tabla en pantalla? (No se guardará hasta presionar "Guardar".)')) return;
    setRows([]);
  };

  /** Duplica los holes de otra fecha conocida al editor actual.
   *  Usa el endpoint admin para no depender del estado actual. */
  const duplicateFrom = async (srcFecha: string) => {
    if (!srcFecha || srcFecha === fecha) return;
    if (rows.length > 0 && !window.confirm(
      `Reemplazar el editor con los datos de ${fmtFecha(srcFecha)}? (No se guarda hasta presionar "Guardar".)`,
    )) return;
    try {
      const url = `/api/banderas.php?torneoid=${torneoId}&fecha=${srcFecha}&admin=1&password=admin2025`;
      const res = await fetch(url);
      const json = await res.json();
      const holes: PinSheetHole[] = (json.holes ?? []).map((h: PinSheetHole) => ({ ...h }));
      setRows(holes.sort((a, b) => a.hole - b.hole));
      toast({ title: 'Duplicado', description: `Cargué ${holes.length} hoyos desde ${fmtFecha(srcFecha)}. No olvides guardar.` });
    } catch (e) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    }
  };

  const onSave = () => {
    if (!torneoId) {
      toast({ title: 'Sin torneo activo', description: 'Configura el torneo en la pestaña Config.', variant: 'destructive' });
      return;
    }
    if (!fecha) {
      toast({ title: 'Fecha requerida', description: 'Selecciona la fecha que vas a guardar.', variant: 'destructive' });
      return;
    }
    // Validación mínima: hoyo único y > 0.
    const seen = new Set<number>();
    for (const r of rows) {
      if (!r.hole || r.hole <= 0) {
        toast({ title: 'Hoyo inválido', description: 'Todos los hoyos deben ser número > 0.', variant: 'destructive' });
        return;
      }
      if (seen.has(r.hole)) {
        toast({ title: 'Hoyo duplicado', description: `El hoyo ${r.hole} aparece más de una vez.`, variant: 'destructive' });
        return;
      }
      seen.add(r.hole);
    }
    save.mutate(
      { torneoid: parseInt(String(torneoId), 10), fecha, holes: rows, password: 'admin2025' },
      {
        onSuccess: (json) => {
          toast({ title: 'Guardado', description: `${json.count} hoyos guardados para ${fmtFecha(fecha)}.` });
        },
        onError: (err) => {
          toast({ title: 'Error al guardar', description: (err as Error).message, variant: 'destructive' });
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="h-5 w-5 text-primary" />
          Banderas (Pin Sheet)
        </CardTitle>
        <CardDescription>
          Edita la posición de cada bandera <strong>por fecha</strong>. Puedes
          precargar el pin sheet de los días siguientes del torneo: los
          jugadores sólo verán fechas <code>≤ hoy</code> en la página pública.
          Si una fecha no tiene datos, <code>/banderas</code> mostrará un
          mensaje de disculpa. Para ocultar la página entera, usa "Página".
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ===== Selector de fecha ===== */}
        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Fecha del pin sheet
              </label>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="h-9 w-[180px]"
              />
            </div>
            <div className="text-xs text-muted-foreground pb-2">
              Hoy: <strong>{fmtFecha(today)}</strong>
              {fecha > today && (
                <span className="ml-2 inline-flex items-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2 py-0.5 font-semibold">
                  Fecha futura — invisible al público
                </span>
              )}
              {fecha < today && (
                <span className="ml-2 inline-flex items-center rounded-full bg-muted px-2 py-0.5 font-medium">
                  Fecha pasada
                </span>
              )}
              {fecha === today && (
                <span className="ml-2 inline-flex items-center rounded-full bg-primary/15 text-primary px-2 py-0.5 font-semibold">
                  Día activo
                </span>
              )}
            </div>
          </div>

          {/* Chips: fechas ya guardadas para este torneo */}
          {knownDates.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Fechas guardadas:</span>
              {knownDates.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFecha(d)}
                  className={cn(
                    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
                    d === fecha
                      ? 'border-primary bg-primary text-primary-foreground'
                      : d > today
                        ? 'border-amber-400/60 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
                        : 'border-border bg-card hover:bg-muted',
                  )}
                  title={d > today ? 'Fecha futura (invisible al público)' : 'Fecha guardada'}
                >
                  {fmtFecha(d)}
                </button>
              ))}
            </div>
          )}

          {/* Duplicar desde otra fecha */}
          {knownDates.filter((d) => d !== fecha).length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                <Copy className="h-3.5 w-3.5" />
                Duplicar pin sheet desde:
              </span>
              <Select onValueChange={(v) => duplicateFrom(v)}>
                <SelectTrigger className="h-8 w-[220px]">
                  <SelectValue placeholder="Elegir fecha origen…" />
                </SelectTrigger>
                <SelectContent>
                  {knownDates
                    .filter((d) => d !== fecha)
                    .map((d) => (
                      <SelectItem key={d} value={d}>{fmtFecha(d)}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={fill18} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Llenar 1..18 en blanco
          </Button>
          <Button variant="outline" size="sm" onClick={addHole} className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar hoyo
          </Button>
          <Button variant="outline" size="sm" onClick={clearAll} className="gap-2 text-destructive">
            <Trash2 className="h-4 w-4" />
            Vaciar tabla
          </Button>
          <div className="ml-auto">
            <Button onClick={onSave} disabled={save.isPending} className="gap-2">
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar fecha
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No hay datos para este torneo. Usa "Llenar 1..18 en blanco" o "Agregar hoyo" para empezar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2 w-16">Hoyo</th>
                  <th className="px-2 py-2 w-20">Depth</th>
                  <th className="px-2 py-2 w-24">Frente</th>
                  <th className="px-2 py-2 w-24">Lateral</th>
                  <th className="px-2 py-2 w-24">Lado</th>
                  <th className="px-2 py-2 w-28">vs Centro</th>
                  <th className="px-2 py-2">Título / Notas</th>
                  <th className="px-2 py-2 w-12" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx} className="border-b border-border/60">
                    <td className="px-2 py-1.5">
                      <Input
                        type="number"
                        value={r.hole}
                        onChange={(e) => update(idx, { hole: numOrZero(e.target.value) })}
                        className="h-8"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        type="number"
                        value={r.depth}
                        onChange={(e) => update(idx, { depth: numOrZero(e.target.value) })}
                        className="h-8"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        type="number"
                        value={r.pinFromFront}
                        onChange={(e) => update(idx, { pinFromFront: numOrZero(e.target.value) })}
                        className="h-8"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        type="number"
                        value={r.pinFromSide}
                        onChange={(e) => update(idx, { pinFromSide: numOrZero(e.target.value) })}
                        className="h-8"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Select
                        value={r.pinSide}
                        onValueChange={(v) => update(idx, { pinSide: v as PinSide })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">Izquierdo (L)</SelectItem>
                          <SelectItem value="R">Derecho (R)</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        type="number"
                        value={r.slope}
                        onChange={(e) => update(idx, { slope: numOrZero(e.target.value) })}
                        className="h-8"
                        placeholder="±"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        type="text"
                        value={r.title ?? ''}
                        onChange={(e) => update(idx, { title: e.target.value })}
                        className="h-8"
                        placeholder="Opcional"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeHole(idx)}
                        title="Quitar hoyo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          <strong>Depth</strong>: profundidad total del green ·
          <strong> Frente</strong>: del frente del green a la bandera ·
          <strong> Lateral</strong>: del borde indicado a la bandera ·
          <strong> vs Centro</strong>: posición respecto al centro (positivo = hacia el fondo).
        </p>
      </CardContent>
    </Card>
  );
};

export default AdminBanderas;
