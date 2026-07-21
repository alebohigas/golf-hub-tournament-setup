/**
 * AdminSocioTipos
 * ---------------------------------------------------------------
 * Admin subtab (rendered inside Pre-Registro → "Relación de Socios")
 * that lets a superadmin/staff map club-specific socio labels
 * (e.g. "Honorario", "Jubilado", "Esposa") to the underlying
 * SYSTEM socio type used by the pricing engine ('TITULAR' |
 * 'EMERITO' | 'DEPENDIENTE').
 *
 * The public /registro form uses this table to populate the
 * "Tipo de socio" dropdown. When no rows exist for a tournament
 * the endpoint returns a default 3-row set so the form still works
 * even before an admin configures anything.
 */

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Save, Trash2, Users } from 'lucide-react';
import { useTorneoId } from '@/hooks/useTorneoId';
import {
  useRegistroSocioTipos,
  useSaveRegistroSocioTipos,
  type SocioTipoItem,
  type SocioSystemType,
} from '@/hooks/useRegistroSocioTipos';
import { useToast } from '@/hooks/use-toast';
import { getSuperAdminPassword } from '@/lib/superAdminAuth';

/** Options for the system-type dropdown. */
const SYSTEM_TYPE_OPTIONS: { value: SocioSystemType; label: string; hint: string }[] = [
  { value: 'TITULAR',     label: 'Titular',     hint: 'Precio de socio titular' },
  { value: 'EMERITO',     label: 'Emérito',     hint: 'Precio de socio emérito / honorario' },
  { value: 'DEPENDIENTE', label: 'Dependiente', hint: 'Precio de dependiente (esposo/a, hijo/a, etc.)' },
];

const AdminSocioTipos = () => {
  const { torneoId } = useTorneoId();
  const { data, isLoading } = useRegistroSocioTipos();
  const saveTipos = useSaveRegistroSocioTipos();
  const { toast } = useToast();

  /** Local editable copy. */
  const [rows, setRows] = useState<SocioTipoItem[]>([]);

  useEffect(() => {
    if (data?.items) {
      setRows(
        [...data.items].sort((a, b) => a.display_order - b.display_order),
      );
    }
  }, [data?.items]);

  /** Mutate one row. */
  const updateRow = (idx: number, patch: Partial<SocioTipoItem>) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  /** Add a blank row (system_type defaults to TITULAR). */
  const addRow = () => {
    const nextOrder =
      rows.reduce((max, r) => Math.max(max, r.display_order), 0) + 10;
    setRows((prev) => [
      ...prev,
      {
        club_label: '',
        system_type: 'TITULAR',
        display_order: nextOrder,
        is_enabled: 1,
      },
    ]);
  };

  /** Remove a row. */
  const removeRow = (idx: number) =>
    setRows((prev) => prev.filter((_, i) => i !== idx));

  /** Persist all rows. */
  const onSave = () => {
    if (!torneoId) {
      toast({ title: 'Configura primero el Torneo ID', variant: 'destructive' });
      return;
    }
    const invalid = rows.find((r) => !r.club_label.trim());
    if (invalid) {
      toast({
        title: 'Falta el nombre visible en algún renglón',
        description: 'Cada tipo de socio necesita un nombre para mostrar.',
        variant: 'destructive',
      });
      return;
    }
    saveTipos.mutate(
      {
        torneoid: parseInt(torneoId, 10),
        items: rows,
        password: getSuperAdminPassword(),
      },
      {
        onSuccess: () => toast({ title: 'Relación de socios guardada' }),
        onError: (err: Error) =>
          toast({ title: 'Error al guardar', description: err.message, variant: 'destructive' }),
      },
    );
  };

  const enabledCount = useMemo(
    () => rows.filter((r) => r.is_enabled).length,
    [rows],
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Relación de Socios
          </CardTitle>
          <CardDescription>
            Da de alta los nombres de tipos de socio como los usa tu club
            (ej. <em>Honorario</em>, <em>Jubilado</em>, <em>Esposa</em>) y
            mapéalos al tipo del sistema (<span className="font-mono">TITULAR</span>,
            <span className="font-mono"> EMERITO</span> o
            <span className="font-mono"> DEPENDIENTE</span>). El formulario
            público mostrará estos nombres en el dropdown "Tipo de socio",
            pero los precios se resuelven con el tipo del sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">
                  {enabledCount} de {rows.length} tipos activos
                  {data?.source === 'defaults' && ' · usando valores por defecto'}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={addRow} className="gap-2">
                    <Plus className="h-4 w-4" /> Agregar
                  </Button>
                  <Button
                    onClick={onSave}
                    disabled={saveTipos.isPending}
                    className="gap-2"
                  >
                    {saveTipos.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Guardar
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-2">Nombre visible (Club)</th>
                      <th className="text-left p-2 w-56">Tipo del sistema</th>
                      <th className="text-center p-2 w-20">Orden</th>
                      <th className="text-center p-2 w-24">Activo</th>
                      <th className="text-center p-2 w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                          No hay tipos configurados. Agrega el primero.
                        </td>
                      </tr>
                    )}
                    {rows.map((r, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">
                          <Input
                            value={r.club_label}
                            placeholder="Ej. Honorario"
                            onChange={(e) =>
                              updateRow(idx, { club_label: e.target.value })
                            }
                          />
                        </td>
                        <td className="p-2">
                          <Select
                            value={r.system_type}
                            onValueChange={(v) =>
                              updateRow(idx, { system_type: v as SocioSystemType })
                            }
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SYSTEM_TYPE_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                  <div className="flex flex-col">
                                    <span>{o.label}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {o.hint}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2 text-center">
                          <Input
                            type="number"
                            value={r.display_order}
                            onChange={(e) =>
                              updateRow(idx, {
                                display_order: parseInt(e.target.value, 10) || 0,
                              })
                            }
                            className="w-20 text-center"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <Switch
                            checked={!!r.is_enabled}
                            onCheckedChange={(v) =>
                              updateRow(idx, { is_enabled: v ? 1 : 0 })
                            }
                          />
                        </td>
                        <td className="p-2 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRow(idx)}
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSocioTipos;