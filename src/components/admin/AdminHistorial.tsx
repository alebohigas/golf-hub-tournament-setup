/**
 * AdminHistorial
 * ------------------------------------------------------------------
 * Admin tab that configures the public /historial page: a table with up
 * to 5 previous editions. Each row holds a YEAR (selector button label)
 * and the TORNEO_ID whose results should be queried for that year.
 *
 * Storage: `site_config.historial_config = { editions: [{ year, torneoId, label }] }`
 * Limit  : MAX_EDITIONS (5) — "máximo de 5 años anteriores".
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { useSiteConfig, useSaveSiteConfig, type HistorialConfig, type HistorialEdition } from '@/hooks/useSiteConfig';
import { useToast } from '@/hooks/use-toast';
import { getSuperAdminPassword } from '@/lib/superAdminAuth';

/** Hard limit of past editions the admin may register. */
export const MAX_EDITIONS = 5;

const AdminHistorial = () => {
  const { data: siteConfig, isLoading } = useSiteConfig();
  const saveSiteConfig = useSaveSiteConfig();
  const { toast } = useToast();

  /** Local editable copy of the editions table. */
  const [rows, setRows] = useState<HistorialEdition[]>([]);

  /** Hydrate from the server config whenever it changes. */
  useEffect(() => {
    const cfg = siteConfig?.historial_config;
    setRows(Array.isArray(cfg?.editions) ? cfg!.editions : []);
  }, [siteConfig?.historial_config]);

  /** Append an empty row (previous year by default), respecting the limit. */
  const addRow = () => {
    if (rows.length >= MAX_EDITIONS) return;
    const currentYear = new Date().getFullYear();
    const usedYears = rows.map(r => Number(r.year));
    let year = currentYear - 1;
    while (usedYears.includes(year)) year -= 1;
    setRows([...rows, { year, torneoId: '', label: '' }]);
  };

  /** Update one field of a row. */
  const updateRow = (idx: number, patch: Partial<HistorialEdition>) => {
    setRows(rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  /** Remove a row from the table. */
  const removeRow = (idx: number) => setRows(rows.filter((_, i) => i !== idx));

  /**
   * Persist to site_config. Rows without a torneo_id are dropped, years are
   * normalized to numbers and the list is sorted most-recent-first (that's
   * the order the public year selector renders).
   */
  const handleSave = () => {
    const cleaned: HistorialEdition[] = rows
      .map(r => ({
        year: Number(r.year) || 0,
        torneoId: String(r.torneoId || '').trim(),
        label: (r.label || '').trim() || undefined,
      }))
      .filter(r => r.year > 0 && r.torneoId !== '')
      .sort((a, b) => b.year - a.year)
      .slice(0, MAX_EDITIONS);

    const payload: HistorialConfig = { editions: cleaned };
    saveSiteConfig.mutate(
      { password: getSuperAdminPassword(), historial_config: payload },
      {
        onSuccess: () => {
          setRows(cleaned);
          toast({ title: 'Historial guardado', description: `${cleaned.length} edición(es) configuradas.` });
        },
        onError: (err) =>
          toast({ title: 'Error al guardar', description: err.message, variant: 'destructive' }),
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Historial de Resultados
        </CardTitle>
        <CardDescription>
          Registra hasta {MAX_EDITIONS} años anteriores con su torneo_id. En la página
          /historial el usuario elige el año y ve los resultados de ese torneo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="rounded-md border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">Año</TableHead>
                    <TableHead className="w-36">torneo_id</TableHead>
                    <TableHead>Etiqueta (opcional)</TableHead>
                    <TableHead className="w-16 text-right">—</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                        Sin años configurados. Agrega el primero.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Input
                            type="number"
                            inputMode="numeric"
                            value={row.year || ''}
                            onChange={(e) => updateRow(idx, { year: Number(e.target.value) })}
                            placeholder="2025"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={row.torneoId || ''}
                            onChange={(e) => updateRow(idx, { torneoId: e.target.value.replace(/\D/g, '') })}
                            placeholder="354"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={row.label || ''}
                            onChange={(e) => updateRow(idx, { label: e.target.value })}
                            placeholder="LV Torneo Anual 2025"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => removeRow(idx)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={addRow}
                disabled={rows.length >= MAX_EDITIONS}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar año
              </Button>
              <Button onClick={handleSave} disabled={saveSiteConfig.isPending} className="gap-2">
                {saveSiteConfig.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Recuerda activar la página <strong>HISTORIAL</strong> en Admin &gt; Config para que
              aparezca en el menú público.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminHistorial;