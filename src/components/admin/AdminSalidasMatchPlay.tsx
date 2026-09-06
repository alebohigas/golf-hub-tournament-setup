/**
 * AdminSalidasMatchPlay Component
 * ---------------------------------------------------------------
 * Admin → ALIEN SYSTEM → Match Play
 *
 * Permite armar a mano los enfrentamientos (matches) de las salidas de
 * MATCH PLAY, sin depender de ningún archivo/reporte externo:
 *
 *  1. Se elige el día y la categoría (caljuego).
 *  2. Por cada grupo de salida se ordenan los jugadores con ↑ / ↓.
 *     El orden se lee de 2 en 2: 1º VS 2º, 3º VS 4º, …
 *  3. Al activar "Mostrar VS" y guardar, la página pública de Salidas
 *     agrupa por match, inserta el renglón "VS" y separa cada match.
 *
 * Persistencia: `site_config.salidas_matchplay_config` mediante
 * useSaveSiteConfig (misma autenticación que el resto del panel).
 * ---------------------------------------------------------------
 */

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDown, ArrowUp, Loader2, RotateCcw, Save, Swords } from 'lucide-react';
import { useSalidasMaster, useSalidasDetail } from '@/hooks/useSalidasData';
import { useSiteConfig, useSaveSiteConfig } from '@/hooks/useSiteConfig';
import {
  applyMatchPlayOrder,
  getMatchPlayEntry,
  type SalidasMatchPlayConfig,
  type SalidasMatchPlayEntry,
} from '@/lib/salidasMatchPlay';
import { useToast } from '@/hooks/use-toast';
import { getSuperAdminPassword } from '@/lib/superAdminAuth';

// ============= Component =============

const AdminSalidasMatchPlay = () => {
  const { data: master, isLoading: loadingMaster } = useSalidasMaster();
  const { data: siteConfig } = useSiteConfig();
  const saveSiteConfig = useSaveSiteConfig();
  const { toast } = useToast();

  /** Día seleccionado (índice dentro de master.days). */
  const [dayIdx, setDayIdx] = useState<string>('');
  /** Categoría seleccionada (caljgoid). */
  const [caljgoid, setCaljgoid] = useState<string>('');
  /** Estado local editable de la categoría seleccionada. */
  const [enabled, setEnabled] = useState(false);
  const [orders, setOrders] = useState<Record<string, string[]>>({});

  const days = master?.days ?? [];
  const day = dayIdx !== '' ? days[Number(dayIdx)] : undefined;
  const categories = day?.categories ?? [];
  const category = categories.find((c) => String(c.caljgoid) === caljgoid);
  const formato = category?.format?.toLowerCase().includes('pareja') ? 'parejas' : 'individual';

  const { data: detail, isLoading: loadingDetail } = useSalidasDetail(
    caljgoid || null,
    formato,
    !!caljgoid
  );

  /** Configuración guardada en la base. */
  const config: SalidasMatchPlayConfig = useMemo(
    () => (siteConfig?.salidas_matchplay_config ?? {}) as SalidasMatchPlayConfig,
    [siteConfig?.salidas_matchplay_config]
  );

  /** Hidrata el editor al cambiar de categoría o al llegar la configuración. */
  useEffect(() => {
    const entry = getMatchPlayEntry(config, caljgoid);
    setEnabled(!!entry?.enabled);
    setOrders(entry?.groups ?? {});
  }, [caljgoid, config]);

  /**
   * Orden efectivo de un grupo: el configurado (completado con los jugadores
   * que falten) o, si no hay configuración, el orden que entrega el API.
   */
  const groupOrder = (groupId: string, players: { name: string }[]): string[] => {
    const saved = orders[groupId];
    const names = players.map((p) => p.name);
    if (!saved?.length) return names;
    const known = new Set(saved);
    return [...saved.filter((n) => names.includes(n)), ...names.filter((n) => !known.has(n))];
  };

  /** Mueve un jugador dentro del grupo (dir = -1 arriba, +1 abajo). */
  const move = (groupId: string, current: string[], idx: number, dir: -1 | 1) => {
    const next = [...current];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setOrders((prev) => ({ ...prev, [groupId]: next }));
  };

  /** Restaura el orden original del API para un grupo. */
  const resetGroup = (groupId: string) => {
    setOrders((prev) => {
      const next = { ...prev };
      delete next[groupId];
      return next;
    });
  };

  /** Guarda la configuración de la categoría seleccionada. */
  const handleSave = async () => {
    if (!caljgoid) return;
    const entry: SalidasMatchPlayEntry = { enabled, groups: orders };
    const next: SalidasMatchPlayConfig = {
      byCaljgoid: { ...(config.byCaljgoid ?? {}), [caljgoid]: entry },
    };
    try {
      await saveSiteConfig.mutateAsync({
        password: getSuperAdminPassword(),
        salidas_matchplay_config: next,
      });
      toast({ title: 'Match Play guardado', description: 'Las salidas públicas ya muestran los enfrentamientos.' });
    } catch (e: any) {
      toast({ title: 'No se pudo guardar', description: e?.message ?? 'Error desconocido', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Swords className="h-5 w-5" /> Match Play — enfrentamientos de salidas
        </CardTitle>
        <CardDescription>
          Ordena los jugadores de cada grupo de salida. Se emparejan de 2 en 2 (1º VS 2º, 3º VS 4º)
          y la página de Salidas muestra el "VS" con separador por match.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ---------- Selección de día y categoría ---------- */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Día</Label>
            <Select
              value={dayIdx}
              onValueChange={(v) => { setDayIdx(v); setCaljgoid(''); }}
              disabled={loadingMaster}
            >
              <SelectTrigger><SelectValue placeholder={loadingMaster ? 'Cargando…' : 'Selecciona el día'} /></SelectTrigger>
              <SelectContent>
                {days.map((d, i) => (
                  <SelectItem key={`${d.date}-${i}`} value={String(i)}>
                    {d.dateFormatted} — {d.course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select value={caljgoid} onValueChange={setCaljgoid} disabled={!day}>
              <SelectTrigger><SelectValue placeholder="Selecciona la categoría" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.caljgoid} value={String(c.caljgoid)}>
                    {c.categoryName} · {c.system}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ---------- Editor de grupos ---------- */}
        {caljgoid && (
          <>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Mostrar VS y separadores por match</p>
                <p className="text-sm text-muted-foreground">
                  Activa el formato Match Play en la página pública de Salidas para esta categoría.
                </p>
              </div>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>

            {loadingDetail ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Cargando salidas…
              </div>
            ) : (detail?.groups ?? []).length === 0 ? (
              <p className="text-muted-foreground">No hay grupos de salida generados para esta categoría.</p>
            ) : (
              <div className="space-y-4">
                {(detail?.groups ?? []).map((group) => {
                  const players = group.players ?? [];
                  const order = groupOrder(String(group.id), players);
                  /** Vista previa con matchNo/matchSide para etiquetar cada match. */
                  const preview = applyMatchPlayOrder(
                    order.map((n) => players.find((p) => p.name === n) ?? { name: n }),
                    order
                  );

                  return (
                    <div key={group.id} className="rounded-lg border">
                      <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2">
                        <p className="font-semibold">
                          Hoyo {group.tee} · {group.time}
                        </p>
                        <Button variant="ghost" size="sm" onClick={() => resetGroup(String(group.id))} className="gap-1">
                          <RotateCcw className="h-4 w-4" /> Orden original
                        </Button>
                      </div>

                      <ul className="divide-y">
                        {preview.map((p, idx) => (
                          <li key={`${group.id}-${p.name}-${idx}`} className="flex items-center gap-3 px-4 py-2">
                            <span className="w-20 shrink-0 text-xs font-bold text-primary">
                              Match {p.matchNo} · {p.matchSide === 1 ? 'A' : 'B'}
                            </span>
                            <span className="flex-1 text-sm">{p.name}</span>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                disabled={idx === 0}
                                onClick={() => move(String(group.id), order, idx, -1)}
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                disabled={idx === preview.length - 1}
                                onClick={() => move(String(group.id), order, idx, 1)}
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}

            <Button onClick={handleSave} disabled={saveSiteConfig.isPending} className="gap-2">
              {saveSiteConfig.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar enfrentamientos
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminSalidasMatchPlay;
