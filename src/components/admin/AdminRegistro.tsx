/**
 * AdminRegistro
 * Admin tab for the Pre-Registro feature.
 * Lets the admin toggle which form fields are enabled/required and reorder
 * them. Persisted server-side via /api/registro_fields.php.
 */

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, ListChecks, ExternalLink, AlertTriangle } from 'lucide-react';
import { useTorneoId } from '@/hooks/useTorneoId';
import { useRegistroFields, useSaveRegistroFields, type RegistroField } from '@/hooks/useRegistroFields';
import { useToast } from '@/hooks/use-toast';

/**
 * AdminRegistro tab component.
 * Shows a single editable table of fields keyed by `field_name`.
 */
/**
 * Section options shown in the per-field <Select>. Keep in sync with the
 * progressive-reveal sections in src/pages/Registro.tsx.
 */
const SECTION_OPTIONS: { value: string; label: string }[] = [
  { value: 'basica',      label: 'Información básica' },
  { value: 'socios',      label: 'Socios y procedencia' },
  { value: 'adicionales', label: 'Adicionales' },
  { value: 'revision',    label: 'Solo revisión admin' },
];

const AdminRegistro = () => {
  const { torneoId } = useTorneoId();
  const { data, isLoading } = useRegistroFields();
  const saveFields = useSaveRegistroFields();
  const { toast } = useToast();

  /** Local editable copy of the field list. */
  const [rows, setRows] = useState<RegistroField[]>([]);

  /** Hydrate local state when the server returns config. */
  useEffect(() => {
    if (data?.fields) {
      setRows([...data.fields].sort((a, b) => a.display_order - b.display_order));
    }
  }, [data?.fields]);

  /** Update a single row in the editable list. */
  const updateRow = (idx: number, patch: Partial<RegistroField>) => {
    setRows(prev => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  /** Push current rows back to the server. */
  const onSave = () => {
    if (!torneoId) {
      toast({ title: 'Configura primero el Torneo ID', variant: 'destructive' });
      return;
    }
    saveFields.mutate(
      { torneoid: parseInt(torneoId, 10), fields: rows, password: 'admin2025' },
      {
        onSuccess: () => toast({ title: 'Configuración de Pre-Registro guardada' }),
        onError: (err: any) =>
          toast({ title: 'Error al guardar', description: err.message, variant: 'destructive' }),
      }
    );
  };

  /** Convenience metric for the header. */
  const enabledCount = useMemo(() => rows.filter(r => !!r.is_enabled).length, [rows]);

  /**
   * Validación crítica: el formulario SIEMPRE debe permitir capturar la edad
   * (sea como fecha de nacimiento o como campo edad directo, o ambos).
   * Si el admin desactiva los dos, se rompe el filtro de categorías y la
   * resolución de precios. Mostramos una alerta destacada.
   */
  const ageFieldsMissing = useMemo(() => {
    const fechanac = rows.find(r => r.field_name === 'reg_fechanac');
    const edad     = rows.find(r => r.field_name === 'reg_edad');
    const fechanacEnabled = !!(fechanac && fechanac.is_enabled);
    const edadEnabled     = !!(edad && edad.is_enabled);
    return !fechanacEnabled && !edadEnabled;
  }, [rows]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            Pre-Registro · Configuración de campos
          </CardTitle>
          <CardDescription>
            Activa o desactiva campos del formulario público y marca cuáles
            son obligatorios. Puedes editar la etiqueta y el orden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
            </div>
          ) : (
            <>
              {/* Alerta crítica: al menos uno entre reg_fechanac y reg_edad
                  debe estar activo para poder filtrar categorías y precios. */}
              {ageFieldsMissing && (
                <div className="mb-3 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <strong>Falta capturar edad:</strong> tienes desactivados los campos
                    <em> Fecha de nacimiento</em> y <em>Edad</em>. El formulario no podrá
                    filtrar categorías por edad ni resolver precios dependientes de edad.
                    Activa al menos uno de los dos.
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">
                  {enabledCount} de {rows.length} campos activos
                  {data?.source === 'defaults' && ' · usando valores por defecto'}
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <a href="/registro" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" /> Ver formulario
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <a href="/admin/registros" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" /> Ver registros
                    </a>
                  </Button>
                  <Button onClick={onSave} disabled={saveFields.isPending} className="gap-2">
                    {saveFields.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Guardar
                  </Button>
                </div>
              </div>

              {/* Editable table — one row per configurable field */}
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-2 w-32">Campo</th>
                      <th className="text-left p-2">Etiqueta</th>
                      <th className="text-left p-2 w-44">Sección</th>
                      <th className="text-center p-2 w-20">Orden</th>
                      <th className="text-center p-2 w-24">Activo</th>
                      <th className="text-center p-2 w-28">Obligatorio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, idx) => (
                      <tr key={r.field_name} className="border-t">
                        <td className="p-2 font-mono text-xs text-muted-foreground">{r.field_name}</td>
                        <td className="p-2">
                          <Input
                            value={r.field_label}
                            onChange={e => updateRow(idx, { field_label: e.target.value })}
                          />
                        </td>
                        <td className="p-2">
                          {/* Section selector — drives which group the field
                              renders inside on the public form. */}
                          <Select
                            value={r.section || 'basica'}
                            onValueChange={v => updateRow(idx, { section: v })}
                          >
                            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {SECTION_OPTIONS.map(o => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2 text-center">
                          <Input
                            type="number"
                            value={r.display_order}
                            onChange={e => updateRow(idx, { display_order: parseInt(e.target.value, 10) || 0 })}
                            className="w-20 text-center"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <Switch
                            checked={!!r.is_enabled}
                            onCheckedChange={v => updateRow(idx, { is_enabled: v ? 1 : 0 })}
                          />
                        </td>
                        <td className="p-2 text-center">
                          <Switch
                            checked={!!r.is_required}
                            onCheckedChange={v => updateRow(idx, { is_required: v ? 1 : 0 })}
                            disabled={!r.is_enabled}
                          />
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

export default AdminRegistro;