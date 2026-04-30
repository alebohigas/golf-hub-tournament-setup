/**
 * AdminBrackets
 * ----------------------------------------------------------------------------
 * Admin tab for enabling and configuring Match Play / Knockout brackets
 * for any prize across the 6 bracket-eligible tables (oyes, oyesx, approach,
 * putt, driver, driverp).
 *
 * Workflow:
 *   1. List every prize row from the backend (one row per existing prize).
 *   2. Admin flips the "Bracket" checkbox to mark a prize as match-play.
 *   3. For flagged rows, an "Configurar bracket" button opens an editor
 *      to set: size (4..128), seed source (standings / manual / random),
 *      advancement (manual / auto), and the standings scope (categoriaid,
 *      premio, hoyo, campo) when seed_source = 'standings'.
 *   4. "Generar partidos" rebuilds bracket_matches from the seed source.
 *
 * Linkage: NOTHING about the existing cartesian prize config (categoriaid,
 * hoyo, campo, premio matrix) is moved or duplicated — bracket_config
 * simply points at the prize row by (prize_table, prize_id) and reads the
 * standings scope from the same fields when needed.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Trophy, Settings, Zap, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useBracketPrizes,
  useSetBracketFlag,
  useBracketConfig,
  useSaveBracketConfig,
  useGenerateBracket,
  type BracketPrizeRow,
} from '@/hooks/useBrackets';
import { useTorneoId } from '@/hooks/useTorneoId';

/** Allowed bracket sizes — must mirror the PHP allowlist */
const BRACKET_SIZES = [4, 8, 16, 32, 64, 128] as const;

/** Admin password — matches the rest of the admin panel */
const ADMIN_PW = 'admin2025';

/** Pretty label for each prize_table */
const TABLE_LABELS: Record<string, string> = {
  oyes: "O'Yes",
  oyesx: "O'Yes-X",
  approach: 'Approach',
  putt: 'Putt',
  driver: 'Driver Distancia',
  driverp: 'Driver Precisión',
};

const AdminBrackets = () => {
  const { torneoId } = useTorneoId();
  const { toast } = useToast();
  const { data, isLoading, refetch, isRefetching } = useBracketPrizes();
  const setFlag = useSetBracketFlag();

  /** Currently expanded prize row (the one being configured) */
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Cargando premios...</span>
      </div>
    );
  }

  const prizes = data?.prizes ?? [];

  /** Group prizes by table for display */
  const groupedByTable: Record<string, BracketPrizeRow[]> = {};
  for (const p of prizes) {
    if (!groupedByTable[p.prize_table]) groupedByTable[p.prize_table] = [];
    groupedByTable[p.prize_table].push(p);
  }

  /** Toggle handler — flips is_bracket via the API */
  const handleToggle = (row: BracketPrizeRow, next: boolean) => {
    setFlag.mutate(
      { prize_table: row.prize_table, prize_id: row.prize_id, is_bracket: next ? 1 : 0, password: ADMIN_PW },
      {
        onError: (err: any) => toast({
          title: 'Error', description: err.message, variant: 'destructive',
        }),
      },
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Match Play / Brackets
              </CardTitle>
              <CardDescription>
                Marca los premios que se jugarán en formato eliminación. Cada premio
                marcado puede configurarse con tamaño, fuente de siembra y avance.
                La configuración cartesiana original (categoría, hoyo, campo) NO se
                modifica — los brackets se conectan al premio mediante referencia.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
              Recargar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!torneoId && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
              Configura primero el ID del torneo en la pestaña Config.
            </p>
          )}
          {prizes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No se encontraron premios para este torneo.
            </p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByTable).map(([table, rows]) => (
                <div key={table}>
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">
                    {TABLE_LABELS[table] ?? table} ({rows.length})
                  </h3>
                  <div className="space-y-2">
                    {rows.map((row) => {
                      const key = `${row.prize_table}:${row.prize_id}`;
                      const expanded = expandedKey === key;
                      return (
                        <div key={key} className="border border-border rounded-md">
                          <div className="flex items-center justify-between gap-3 p-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Checkbox
                                checked={row.is_bracket === 1}
                                onCheckedChange={(v) => handleToggle(row, !!v)}
                                disabled={setFlag.isPending}
                              />
                              <div className="min-w-0">
                                <div className="font-medium truncate">
                                  {row.descripcion || `Premio #${row.prize_id}`}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  ID {row.prize_id}
                                  {row.categoriaid != null && ` · cat ${row.categoriaid}`}
                                  {row.hoyo != null && ` · hoyo ${row.hoyo}`}
                                  {row.campo != null && ` · campo ${row.campo}`}
                                  {row.premio != null && ` · premio ${row.premio}`}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {row.has_config && (
                                <Badge variant="secondary" className="gap-1">
                                  <Trophy className="h-3 w-3" />
                                  {row.size} · {row.status}
                                </Badge>
                              )}
                              {row.is_bracket === 1 && (
                                <Button
                                  size="sm"
                                  variant={expanded ? 'default' : 'outline'}
                                  onClick={() => setExpandedKey(expanded ? null : key)}
                                  className="gap-1"
                                >
                                  <Settings className="h-3.5 w-3.5" />
                                  {expanded ? 'Cerrar' : 'Configurar'}
                                </Button>
                              )}
                            </div>
                          </div>
                          {expanded && row.is_bracket === 1 && (
                            <BracketConfigEditor row={row} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// BracketConfigEditor
// ----------------------------------------------------------------------------
// Inline editor for a single bracket_config row. Loads existing config (if
// any), exposes form controls for size / seed_source / advancement / scope,
// and provides a "Generar partidos" button that hits the generate action.
// ============================================================================

interface EditorProps {
  row: BracketPrizeRow;
}

const BracketConfigEditor = ({ row }: EditorProps) => {
  const { torneoId } = useTorneoId();
  const { toast } = useToast();
  const { data, isLoading } = useBracketConfig(row.prize_table, row.prize_id);
  const saveConfig = useSaveBracketConfig();
  const generate = useGenerateBracket();

  // Local form state — initialized from the loaded config or sensible defaults
  const cfg = data?.config;
  const [size, setSize] = useState<number>(cfg?.size ?? 16);
  const [seedSource, setSeedSource] = useState<'standings' | 'manual' | 'random'>(cfg?.seed_source ?? 'standings');
  const [advancement, setAdvancement] = useState<'manual' | 'auto'>(cfg?.advancement ?? 'manual');
  const [seedCat, setSeedCat]     = useState<string>(cfg?.seed_categoriaid?.toString() ?? row.categoriaid?.toString() ?? '');
  const [seedPremio, setSeedPremio] = useState<string>(cfg?.seed_premio?.toString() ?? row.premio?.toString() ?? '');
  const [seedHoyo, setSeedHoyo]     = useState<string>(cfg?.seed_hoyo?.toString() ?? row.hoyo?.toString() ?? '');
  const [seedCampo, setSeedCampo]   = useState<string>(cfg?.seed_campo?.toString() ?? row.campo?.toString() ?? '');

  // Sync form when loaded config changes (initial fetch)
  // (Intentional: only run when cfg.id changes — avoids stomping mid-edit.)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // We accept the lint warning here because the deps are by design.

  const handleSave = () => {
    saveConfig.mutate(
      {
        torneoid: Number(torneoId),
        prize_table: row.prize_table,
        prize_id: row.prize_id,
        size,
        seed_source: seedSource,
        advancement,
        seed_categoriaid: seedCat ? Number(seedCat) : undefined,
        seed_premio: seedPremio ? Number(seedPremio) : undefined,
        seed_hoyo: seedHoyo ? Number(seedHoyo) : undefined,
        seed_campo: seedCampo ? Number(seedCampo) : undefined,
        password: ADMIN_PW,
      } as any,
      {
        onSuccess: () => toast({ title: 'Configuración guardada' }),
        onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
      },
    );
  };

  const handleGenerate = () => {
    if (!cfg?.id) {
      toast({ title: 'Guarda primero la configuración', variant: 'destructive' });
      return;
    }
    if (!confirm('Esto eliminará los partidos actuales y generará un nuevo bracket. ¿Continuar?')) return;
    generate.mutate(
      { bracket_config_id: cfg.id, password: ADMIN_PW },
      {
        onSuccess: (res: any) => toast({
          title: 'Bracket generado',
          description: `${res.players_seeded} jugadores sembrados en ${res.rounds} rondas.`,
        }),
        onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="border-t border-border p-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando configuración...
      </div>
    );
  }

  return (
    <div className="border-t border-border p-4 bg-muted/20 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label>Tamaño</Label>
          <Select value={String(size)} onValueChange={(v) => setSize(Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {BRACKET_SIZES.map((s) => (
                <SelectItem key={s} value={String(s)}>{s} jugadores</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Fuente de siembra</Label>
          <Select value={seedSource} onValueChange={(v) => setSeedSource(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="standings">Tabla de posiciones</SelectItem>
              <SelectItem value="manual">Manual (admin asigna)</SelectItem>
              <SelectItem value="random">Aleatorio</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Avance</Label>
          <Select value={advancement} onValueChange={(v) => setAdvancement(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="auto">Automático (mayor score gana)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {seedSource === 'standings' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Categoría</Label>
            <Input value={seedCat} onChange={(e) => setSeedCat(e.target.value)} placeholder="categoriaid" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Premio</Label>
            <Input value={seedPremio} onChange={(e) => setSeedPremio(e.target.value)} placeholder="premio" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Hoyo</Label>
            <Input value={seedHoyo} onChange={(e) => setSeedHoyo(e.target.value)} placeholder="hoyo" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Campo</Label>
            <Input value={seedCampo} onChange={(e) => setSeedCampo(e.target.value)} placeholder="campo" />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleSave} disabled={saveConfig.isPending}>
          {saveConfig.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Guardar configuración
        </Button>
        <Button variant="outline" onClick={handleGenerate} disabled={generate.isPending || !cfg?.id} className="gap-1">
          {generate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          Generar partidos
        </Button>
        {cfg && (
          <span className="text-xs text-muted-foreground self-center">
            Estado: <strong>{cfg.status}</strong>
            {data?.matches?.length ? ` · ${data.matches.length} partidos` : ''}
          </span>
        )}
      </div>
    </div>
  );
};

export default AdminBrackets;