/**
 * AdminCategoriasReglas
 * Pestaña admin para configurar la ELEGIBILIDAD de categorías del torneo.
 *
 * Una regla = (categoría, género?, edad_min?, edad_max?, hcp_min?, hcp_max?).
 * Determina si una categoría aparece en el dropdown del Pre-Registro para
 * un jugador concreto. NO maneja precios — eso está en la pestaña
 * "Precios de inscripción" (tabla `registro_precios`).
 *
 * Persistencia: replace-all por torneo vía POST /api/categorias_reglas.php.
 */

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, ListChecks, Plus, Trash2, ExternalLink } from 'lucide-react';
import { useTorneoId } from '@/hooks/useTorneoId';
import { useCategories } from '@/hooks/usePlayersData';
import {
  useCategoriasReglas,
  useSaveCategoriasReglas,
  type CategoriaRegla,
} from '@/hooks/useCategoriasReglas';
import { useToast } from '@/hooks/use-toast';

/** Opciones del <Select> de género. */
const GENERO_OPTIONS = [
  { value: 'ANY', label: 'Cualquiera' },
  { value: 'M',   label: 'Hombre (M)' },
  { value: 'F',   label: 'Mujer (F)' },
];

/** Fila vacía para "Agregar regla". */
const blankRule = (order: number): Partial<CategoriaRegla> => ({
  id: 0,
  categoria: '',
  genero: null,
  edad_min: null,
  edad_max: null,
  hcp_min: null,
  hcp_max: null,
  display_order: order,
  is_active: 1,
});

const AdminCategoriasReglas = () => {
  const { torneoId } = useTorneoId();
  const { data, isLoading } = useCategoriasReglas();
  const { data: categories = [] } = useCategories();
  const save = useSaveCategoriasReglas();
  const { toast } = useToast();

  /** Copia editable local. */
  const [rows, setRows] = useState<Partial<CategoriaRegla>[]>([]);

  /** Hidrata al cargar / refrescar. */
  useEffect(() => {
    if (data?.rules) {
      setRows([...data.rules].sort((a, b) => a.display_order - b.display_order));
    }
  }, [data?.rules]);

  /** Actualiza un campo por índice. */
  const update = (idx: number, patch: Partial<CategoriaRegla>) => {
    setRows(prev => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const addRule = () => {
    setRows(prev => [...prev, blankRule((prev.length + 1) * 10)]);
  };

  const removeRule = (idx: number) => {
    setRows(prev => prev.filter((_, i) => i !== idx));
  };

  const onSave = () => {
    if (!torneoId) {
      toast({ title: 'Configura primero el Torneo ID', variant: 'destructive' });
      return;
    }
    save.mutate(
      { torneoid: parseInt(torneoId, 10), rules: rows, password: 'admin2025' },
      {
        onSuccess: () => toast({ title: 'Reglas guardadas', description: `${rows.length} regla(s).` }),
        onError: (err: any) =>
          toast({ title: 'Error al guardar', description: err.message, variant: 'destructive' }),
      }
    );
  };

  const activeCount = useMemo(() => rows.filter(r => !!r.is_active).length, [rows]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            Pre-Registro · Categorías elegibles
          </CardTitle>
          <CardDescription>
            Define <strong>quién puede inscribirse en cada categoría</strong> según
            edad, género y hándicap. Las categorías sin reglas aquí se asumen
            abiertas (sólo se filtran por el rango de hándicap del propio
            campo en BD). El precio se configura por separado en{' '}
            <strong>Precios de inscripción</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <p className="text-sm text-muted-foreground">
                  {activeCount} de {rows.length} regla(s) activas
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <a href="/registro" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" /> Ver formulario
                    </a>
                  </Button>
                  <Button onClick={addRule} variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Agregar regla
                  </Button>
                  <Button onClick={onSave} disabled={save.isPending} className="gap-2">
                    {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Guardar
                  </Button>
                </div>
              </div>

              {rows.length === 0 ? (
                <div className="border border-dashed rounded-md p-8 text-center text-muted-foreground">
                  Sin reglas de elegibilidad. Pulsa <strong>Agregar regla</strong>.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-2 min-w-[200px]">Categoría</th>
                        <th className="text-left p-2 min-w-[140px]">Género</th>
                        <th className="text-center p-2 w-20">Edad mín</th>
                        <th className="text-center p-2 w-20">Edad máx</th>
                        <th className="text-center p-2 w-20">Hcp mín</th>
                        <th className="text-center p-2 w-20">Hcp máx</th>
                        <th className="text-center p-2 w-20">Activa</th>
                        <th className="text-center p-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, idx) => (
                        <tr key={idx} className="border-t align-top">
                          <td className="p-2">
                            <Select
                              value={r.categoria || ''}
                              onValueChange={v => update(idx, { categoria: v })}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecciona categoría" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[280px]">
                                {categories.map(c => (
                                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <Select
                              value={r.genero ?? 'ANY'}
                              onValueChange={v => update(idx, { genero: v === 'ANY' ? null : v })}
                            >
                              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {GENERO_OPTIONS.map(o => (
                                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              inputMode="numeric"
                              value={r.edad_min ?? ''}
                              onChange={e => update(idx, { edad_min: e.target.value === '' ? null : parseInt(e.target.value, 10) })}
                              className="w-20 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              inputMode="numeric"
                              value={r.edad_max ?? ''}
                              onChange={e => update(idx, { edad_max: e.target.value === '' ? null : parseInt(e.target.value, 10) })}
                              className="w-20 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              inputMode="decimal"
                              step="0.1"
                              value={r.hcp_min ?? ''}
                              onChange={e => update(idx, { hcp_min: e.target.value === '' ? null : parseFloat(e.target.value) })}
                              className="w-20 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder="-6"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              inputMode="decimal"
                              step="0.1"
                              value={r.hcp_max ?? ''}
                              onChange={e => update(idx, { hcp_max: e.target.value === '' ? null : parseFloat(e.target.value) })}
                              className="w-20 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder="54"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <Switch
                              checked={!!r.is_active}
                              onCheckedChange={v => update(idx, { is_active: v ? 1 : 0 })}
                            />
                          </td>
                          <td className="p-2 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeRule(idx)}
                              aria-label="Eliminar regla"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                <strong>Tip:</strong> deja los campos en blanco para "sin
                restricción". Para limitar a senior 55-64 caballeros: género{' '}
                <em>Hombre</em>, edad mín <em>55</em>, edad máx <em>64</em>.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCategoriasReglas;