/**
 * AdminResultadosFinalesCompeticionPrint
 * -----------------------------------------------------------------------------
 * Admin → ALIEN SYSTEM → "Resultados Finales Competición".
 *
 * Lista los bloques disponibles de competición (O'Yes X, O'Yes, Driver, Driver
 * Precisión, Approach, Putt finalistas de brackets y Mejor Score del Día) y
 * permite elegir cuáles imprimir y cuántos caben por hoja carta.
 *
 * El botón abre `/admin/resultados-finales-competicion?bloques=...&porhoja=N`.
 */

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Target, Loader2 } from 'lucide-react';
import { useResultadosFinalesCompeticion } from '@/hooks/useResultadosFinalesCompeticion';

/** Panel de impresión de resultados finales de competición. */
const AdminResultadosFinalesCompeticionPrint = () => {
  const { blocks, isLoading } = useResultadosFinalesCompeticion();

  const [selected, setSelected] = useState<string[]>([]);

  /** Bloques (competencias) por hoja carta: 1, 2 o 3. */
  const [perSheet, setPerSheet] = useState<'1' | '2' | '3'>('2');

  /** Preselecciona todos los bloques disponibles al cargar. */
  useEffect(() => {
    setSelected(blocks.map((b) => b.key));
  }, [blocks]);

  /** Alterna un bloque en la selección. */
  const toggle = (key: string) =>
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  /** Agrupa los bloques por competencia para presentarlos ordenados. */
  const grouped = useMemo(() => {
    const map = new Map<string, typeof blocks>();
    blocks.forEach((b) => {
      const list = map.get(b.competencia) ?? [];
      list.push(b);
      map.set(b.competencia, list);
    });
    return Array.from(map.entries());
  }, [blocks]);

  /** Abre el reporte imprimible con los bloques elegidos (en orden). */
  const open = () => {
    const ordered = blocks.map((b) => b.key).filter((k) => selected.includes(k));
    window.open(
      `/admin/resultados-finales-competicion?bloques=${ordered.join(',')}&porhoja=${perSheet}`,
      '_blank',
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" /> Resultados Finales Competición
        </CardTitle>
        <CardDescription>
          Reporte de premiación de las competiciones laterales: O'Yes X, O'Yes,
          Driver, Driver Precisión, Approach, Putt (finalistas de los brackets) y
          Mejor Score del Día. Las posiciones se imprimen en orden ascendente
          (3, 2, 1) con logo del club, nombre y resultado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando competencias…
          </div>
        ) : blocks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay resultados de competición publicados en este torneo.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSelected(blocks.map((b) => b.key))}
              >
                Seleccionar todos
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSelected([])}
              >
                Deseleccionar todos
              </Button>
            </div>

            {grouped.map(([competencia, list]) => (
              <div key={competencia} className="space-y-2">
                <Label className="text-sm font-semibold uppercase">{competencia}</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {list.map((b) => (
                    <div
                      key={b.key}
                      className="flex items-center gap-2 rounded-md border border-border p-2"
                    >
                      <Checkbox
                        id={`rfc-${b.key}`}
                        checked={selected.includes(b.key)}
                        onCheckedChange={() => toggle(b.key)}
                      />
                      <Label htmlFor={`rfc-${b.key}`} className="cursor-pointer text-sm">
                        {b.groupName}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Cuántos bloques se imprimen por hoja carta. */}
            <div className="space-y-1">
              <Label className="text-sm">Competencias por hoja carta</Label>
              <div className="flex flex-wrap gap-2">
                {(['1', '2', '3'] as const).map((n) => (
                  <Button
                    key={n}
                    type="button"
                    size="sm"
                    variant={perSheet === n ? 'default' : 'outline'}
                    onClick={() => setPerSheet(n)}
                  >
                    {n}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Con 3 por hoja el reporte reduce paddings y tipografía para que
                todo encaje en la hoja carta.
              </p>
            </div>

            <Button onClick={open} disabled={selected.length === 0}>
              <Target className="mr-2 h-4 w-4" /> Generar reporte
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminResultadosFinalesCompeticionPrint;
