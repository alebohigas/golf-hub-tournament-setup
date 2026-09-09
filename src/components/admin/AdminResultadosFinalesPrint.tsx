/**
 * AdminResultadosFinalesPrint — Admin → ALIEN SYSTEM → "Resultados Finales"
 * -----------------------------------------------------------------------------
 * Lista las categorías del torneo con su avance de rondas y permite elegir los
 * BLOQUES a imprimir. Un bloque = categoría + formato (NETO o GROSS); si la
 * categoría premia Gross, se ofrecen los dos bloques por separado, de modo que
 * cada hoja carta del reporte agrupa dos bloques.
 *
 * El botón abre `/admin/resultados-finales?bloques=catid:gross,...`
 */

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Trophy, Loader2 } from 'lucide-react';
import { useResultadosFinalesCatalogo } from '@/hooks/useResultadosFinales';

/** Clave de un bloque seleccionable ("catid:gross"). */
const keyOf = (catid: string, gross: '0' | '1') => `${catid}:${gross}`;

/**
 * Arreglo vacío ESTABLE: mientras el catálogo carga (o falla) se reutiliza la
 * misma referencia, evitando que `blocks` cambie en cada render y que el
 * efecto de preselección caiga en un ciclo infinito de setState.
 */
const EMPTY_CATEGORIES: never[] = [];

/** Panel de impresión de resultados finales. */
const AdminResultadosFinalesPrint = () => {
  const { data, isLoading } = useResultadosFinalesCatalogo();
  const categories = data?.categories ?? EMPTY_CATEGORIES;

  /** Orden de impresión por id de categoría: ascendente o descendente. */
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  /** Sólo se ofrecen las categorías con todas sus rondas terminadas, ordenadas por id. */
  const concluded = useMemo(
    () =>
      categories
        .filter((c) => c.concluded)
        .slice()
        .sort((a, b) => {
          const diff = Number(a.categoryId) - Number(b.categoryId);
          return sortDir === 'asc' ? diff : -diff;
        }),
    [categories, sortDir]
  );

  /** Bloques disponibles en el orden en que se imprimirán. */
  const blocks = useMemo(
    () =>
      concluded.flatMap((c) => {
        const list = [{ key: keyOf(c.categoryId, '0'), label: `${c.name} · NETO` }];
        if (Number(c.gross) === 1) {
          list.push({ key: keyOf(c.categoryId, '1'), label: `${c.name} · GROSS` });
        }
        return list;
      }),
    [concluded]
  );

  const [selected, setSelected] = useState<string[]>([]);

  /** Bloques (categorías) por hoja carta: 1, 2 o 3. */
  const [perSheet, setPerSheet] = useState<'1' | '2' | '3'>('2');

  /**
   * Preselecciona todos los bloques disponibles al cargar el catálogo.
   * Sólo actualiza el estado si la lista de claves cambió, para no
   * re-renderizar en bucle cuando no hay datos.
   */
  useEffect(() => {
    const keys = blocks.map((b) => b.key);
    setSelected((prev) =>
      prev.length === keys.length && prev.every((k, i) => k === keys[i]) ? prev : keys
    );
  }, [blocks]);

  /** Alterna un bloque en la selección. */
  const toggle = (key: string) =>
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  /** Abre el reporte imprimible con los bloques elegidos (en orden). */
  const open = () => {
    const ordered = blocks.map((b) => b.key).filter((k) => selected.includes(k));
    window.open(
      `/admin/resultados-finales?bloques=${ordered.join(',')}&porhoja=${perSheet}`,
      '_blank'
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" /> Resultados Finales
        </CardTitle>
        <CardDescription>
          Reporte de premiación con logo y nombre del torneo, sistema de juego y
          formato. Se imprimen dos categorías (bloques) por hoja carta y las
          posiciones van en orden ascendente: 3, 2, 1.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando categorías…
          </div>
        ) : blocks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay categorías con todas sus rondas concluidas.
          </p>
        ) : (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              {blocks.map((b) => (
                <div key={b.key} className="flex items-center gap-2 rounded-md border border-border p-2">
                  <Checkbox
                    id={`rf-${b.key}`}
                    checked={selected.includes(b.key)}
                    onCheckedChange={() => toggle(b.key)}
                  />
                  <Label htmlFor={`rf-${b.key}`} className="cursor-pointer text-sm">
                    {b.label}
                  </Label>
                </div>
              ))}
            </div>
            {/* Orden de impresión por id de categoría. */}
            <div className="space-y-1">
              <Label className="text-sm">Orden por id de categoría</Label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { v: 'asc', label: 'Ascendente' },
                    { v: 'desc', label: 'Descendente' },
                  ] as const
                ).map((o) => (
                  <Button
                    key={o.v}
                    type="button"
                    size="sm"
                    variant={sortDir === o.v ? 'default' : 'outline'}
                    onClick={() => setSortDir(o.v)}
                  >
                    {o.label}
                  </Button>
                ))}
              </div>
            </div>
            {/* Cuántos bloques (categorías) se imprimen por hoja carta. */}
            <div className="space-y-1">
              <Label className="text-sm">Categorías por hoja carta</Label>
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
                Con 3 por hoja el reporte reduce la escala automáticamente para
                que todo encaje en la hoja carta.
              </p>
            </div>
            <Button onClick={open} disabled={selected.length === 0}>
              <Trophy className="mr-2 h-4 w-4" /> Generar reporte
            </Button>
          </>
        )}

        {/* Categorías aún en juego, para dar contexto de por qué no aparecen. */}
        {!isLoading && categories.some((c) => !c.concluded) && (
          <p className="text-xs text-muted-foreground">
            Pendientes de concluir:{' '}
            {categories
              .filter((c) => !c.concluded)
              .map((c) => `${c.shortName || c.name} (${c.roundsDone}/${c.rounds})`)
              .join(' · ')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminResultadosFinalesPrint;
