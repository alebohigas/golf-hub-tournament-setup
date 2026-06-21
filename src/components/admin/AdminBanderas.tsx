/**
 * AdminBanderas
 * Pestaña admin para editar el pin sheet (tabla `banderas`) del torneo
 * activo. Tabla con 18 filas (1..18) por defecto; se puede agregar /
 * eliminar hoyos. Replace-all al guardar.
 *
 * Si el torneo no tiene datos guardados, /banderas mostrará un mensaje
 * de disculpa al jugador. El admin puede ocultar la página completamente
 * desde la pestaña "Página".
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, Flag, Plus, Trash2, RotateCcw } from 'lucide-react';
import { useTorneoId } from '@/hooks/useTorneoId';
import { useBanderas, useSaveBanderas } from '@/hooks/useBanderasData';
import type { PinSheetHole, PinSide } from '@/data/banderasData';
import { useToast } from '@/hooks/use-toast';

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

const AdminBanderas = () => {
  const { torneoId } = useTorneoId();
  const { data, isLoading } = useBanderas();
  const save = useSaveBanderas();
  const { toast } = useToast();

  /** Copia editable local. */
  const [rows, setRows] = useState<PinSheetHole[]>([]);

  /** Hidrata al cargar. Si no hay datos, deja la tabla vacía
   *  (el admin elige si seedea 1..18 con el botón). */
  useEffect(() => {
    if (data?.holes) {
      setRows([...data.holes].sort((a, b) => a.hole - b.hole));
    }
  }, [data?.holes]);

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

  const onSave = () => {
    if (!torneoId) {
      toast({ title: 'Sin torneo activo', description: 'Configura el torneo en la pestaña Config.', variant: 'destructive' });
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
      { torneoid: torneoId, holes: rows, password: 'admin2025' },
      {
        onSuccess: (json) => {
          toast({ title: 'Guardado', description: `${json.count} hoyos guardados.` });
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
          Edita la posición de cada bandera para el torneo activo. Si esta tabla
          está vacía, la página <code>/banderas</code> mostrará un mensaje de disculpa.
          Para ocultar completamente la página, usa la pestaña "Página".
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
              Guardar
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
