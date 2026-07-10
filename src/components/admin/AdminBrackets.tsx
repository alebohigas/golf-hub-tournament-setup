/**
 * AdminBrackets — "Brackets Putt"
 * ----------------------------------------------------------------------------
 * Configura los dos brackets Putt Finales del torneo (Caballero y Dama).
 * Para cada sexo permite:
 *   - Elegir tamaño (8/16/32/64/128).
 *   - Activar/desactivar visibilidad pública en /competicion.
 *   - Generar / regenerar el bracket desde el ranking acumulado de putt.
 *   - Capturar scores por match → ganador y avance automáticos.
 *   - Override manual del ganador (walkover / corrección).
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Trophy, Zap, RefreshCw, Crown, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  usePuttFinalesAdmin,
  useSavePuttConfig,
  useGeneratePuttBracket,
  useRecordBracketScore,
  useSetBracketWinner,
  useResetBracketMatch,
  type BracketMatch,
  type PuttBracketSide,
} from '@/hooks/useBrackets';
import { useTorneoId } from '@/hooks/useTorneoId';

/** Tamaños permitidos — alineados con el PHP. */
const BRACKET_SIZES = [8, 16, 32, 64, 128] as const;
/**
 * Password admin activa (igual que resto del panel).
 * Usamos `getSuperAdminPassword()` en lugar de la literal 'admin2025' para
 * respetar la contraseña del superadmin cambiada desde /admin y evitar
 * 401 "Unauthorized" al generar/guardar brackets.
 */
import { getSuperAdminPassword } from '@/lib/superAdminAuth';
const ADMIN_PW = () => getSuperAdminPassword();

/**
 * AdminBrackets
 * @param mode 'config'  → solo configuración (tamaño/visibilidad) + generación.
 *             'scores'  → solo captura de resultados por match.
 *             'full'    → ambos (legacy).
 */
interface AdminBracketsProps {
  mode?: 'config' | 'scores' | 'full';
}

const AdminBrackets = ({ mode = 'full' }: AdminBracketsProps) => {
  const { torneoId } = useTorneoId();
  const { data, isLoading, refetch, isRefetching } = usePuttFinalesAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Cargando brackets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Brackets Putt
              </CardTitle>
              <CardDescription>
                {mode === 'scores'
                  ? 'Captura los scores de cada match. El ganador avanza automáticamente al siguiente bracket.'
                  : 'Genera dos brackets finales (Caballero y Dama) a partir del ranking acumulado de putt de todas las competiciones del torneo. Los jugadores se siembran automáticamente según distancia.'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {mode === 'config' && (
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <a href="/admin/brackets" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" /> Capturar resultados
                  </a>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                Recargar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!torneoId && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
              Configura primero el ID del torneo en la pestaña Config.
            </p>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BracketSection sexo="M" label="Putt Finales Caballero" side={data?.M} mode={mode} />
            <BracketSection sexo="F" label="Putt Finales Dama"      side={data?.F} mode={mode} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// BracketSection — bloque por sexo
// ============================================================================

interface SectionProps {
  sexo: 'M' | 'F';
  label: string;
  side: PuttBracketSide | undefined;
  mode: 'config' | 'scores' | 'full';
}

const BracketSection = ({ sexo, label, side, mode }: SectionProps) => {
  const { torneoId } = useTorneoId();
  const { toast } = useToast();
  const saveConfig = useSavePuttConfig();
  const generate   = useGeneratePuttBracket();

  const cfg = side?.config;
  const [size, setSize]       = useState<number>(cfg?.size ?? 16);
  const [visible, setVisible] = useState<boolean>(!!side?.visible);

  const candidates = side?.candidates_count ?? 0;

  const handleSave = () => {
    if (!torneoId) return;
    saveConfig.mutate(
      { torneoid: Number(torneoId), sexo, size, visible, password: ADMIN_PW() },
      {
        onSuccess: () => toast({ title: 'Configuración guardada' }),
        onError:   (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
      },
    );
  };

  const handleGenerate = () => {
    if (!torneoId) return;
    if (!confirm(`Esto eliminará el bracket actual de ${label} y lo regenerará desde el ranking acumulado. ¿Continuar?`)) return;
    generate.mutate(
      { torneoid: Number(torneoId), sexo, password: ADMIN_PW() },
      {
        onSuccess: (r: any) => toast({
          title: 'Bracket generado',
          description: `${r.players_seeded} jugadores sembrados en ${r.rounds} rondas.`,
        }),
        onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
      },
    );
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Crown className="h-4 w-4 text-primary" />
          {label}
          {cfg && (
            <Badge variant="secondary" className="ml-auto gap-1">
              {cfg.size} · {cfg.status}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Candidatos con resultados de putt para sexo {sexo}: <strong>{candidates}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mode !== 'scores' && (
        <>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Tamaño del bracket</Label>
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
            <Label className="text-xs">Visible en /competicion</Label>
            <div className="flex items-center gap-2 h-10">
              <Switch checked={visible} onCheckedChange={setVisible} />
              <span className="text-sm text-muted-foreground">
                {visible ? 'Público' : 'Oculto'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSave} disabled={saveConfig.isPending || !torneoId} size="sm">
            {saveConfig.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Guardar
          </Button>
          <Button variant="outline" onClick={handleGenerate} disabled={generate.isPending || !torneoId || !cfg} size="sm" className="gap-1">
            {generate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Generar bracket
          </Button>
          {!cfg && (
            <span className="text-xs text-muted-foreground self-center">
              Guarda primero para poder generar.
            </span>
          )}
        </div>
        </>
        )}

        {mode !== 'config' && side && side.matches.length > 0 && (
          <MatchesEditor matches={side.matches} />
        )}
        {mode === 'config' && side && side.matches.length > 0 && (
          <p className="text-xs text-muted-foreground border-t border-border pt-3">
            Bracket generado · {cfg?.size ?? '?'} jugadores · {side.matches.length} matches. La captura de resultados
            se realiza en <a href="/admin/brackets" target="_blank" rel="noopener noreferrer" className="underline text-primary">/admin/brackets</a>.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MatchesEditor — captura de scores + override de ganador
// ============================================================================

const MatchesEditor = ({ matches }: { matches: BracketMatch[] }) => {
  const byRound: Record<number, BracketMatch[]> = {};
  for (const m of matches) {
    if (!byRound[m.round]) byRound[m.round] = [];
    byRound[m.round].push(m);
  }
  const rounds = Object.keys(byRound).map(Number).sort((a, b) => a - b);

  return (
    <div className="border-t border-border pt-4 space-y-4">
      <h4 className="text-sm font-semibold">Matches</h4>
      {rounds.map((r) => (
        <div key={r} className="space-y-2">
          <div className="text-xs uppercase text-muted-foreground font-bold tracking-wide">Ronda {r}</div>
          <div className="space-y-2">
            {byRound[r].map((m) => <MatchRow key={m.id} match={m} />)}
          </div>
        </div>
      ))}
    </div>
  );
};

const MatchRow = ({ match }: { match: BracketMatch }) => {
  const { toast } = useToast();
  const record = useRecordBracketScore();
  const setWinner = useSetBracketWinner();
  const reset = useResetBracketMatch();
  const [s1, setS1] = useState<string>(match.player1_score?.toString() ?? '');
  const [s2, setS2] = useState<string>(match.player2_score?.toString() ?? '');

  const handleSave = () => {
    record.mutate(
      {
        match_id: match.id,
        player1_score: s1 === '' ? null : Number(s1),
        player2_score: s2 === '' ? null : Number(s2),
        password: ADMIN_PW(),
      },
      {
        onSuccess: () => toast({ title: 'Score capturado' }),
        onError:   (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
      },
    );
  };

  const handleForceWinner = (winnerId: number | null) => {
    if (!winnerId) return;
    setWinner.mutate(
      { match_id: match.id, winner_id: winnerId, password: ADMIN_PW() },
      {
        onSuccess: () => toast({ title: 'Ganador asignado manualmente' }),
        onError:   (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
      },
    );
  };

  /** Resetea sólo este match (scores + ganador) y deshace su avance. */
  const handleReset = () => {
    if (!confirm('¿Resetear este match? Se borrarán scores y ganador, y se removerá el avance al siguiente bracket.')) return;
    reset.mutate(
      { match_id: match.id, password: ADMIN_PW() },
      {
        onSuccess: () => { setS1(''); setS2(''); toast({ title: 'Match reseteado' }); },
        onError:   (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
      },
    );
  };

  const isW1 = match.winner_id != null && match.winner_id === match.player1_id;
  const isW2 = match.winner_id != null && match.winner_id === match.player2_id;

  return (
    <div className="border border-border rounded-md p-2 grid grid-cols-[1fr,auto,1fr,auto,auto] gap-2 items-center text-sm">
      <PlayerSlot
        name={match.player1_name} seed={match.player1_seed}
        score={s1} setScore={setS1} winner={isW1}
        onForceWin={() => handleForceWinner(match.player1_id)}
        canForce={match.player1_id != null}
      />
      <span className="text-muted-foreground text-xs">vs</span>
      <PlayerSlot
        name={match.player2_name} seed={match.player2_seed}
        score={s2} setScore={setS2} winner={isW2}
        onForceWin={() => handleForceWinner(match.player2_id)}
        canForce={match.player2_id != null}
      />
      <Button size="sm" variant="outline" onClick={handleSave} disabled={record.isPending}>
        {record.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Guardar'}
      </Button>
      {/* Reset por match — limpia scores, ganador y deshace el avance al siguiente bracket. */}
      <Button
        size="sm"
        variant="ghost"
        title="Resetear este match"
        aria-label="Resetear este match"
        onClick={handleReset}
        disabled={reset.isPending}
        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
      >
        {reset.isPending
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : <RefreshCw className="h-4 w-4" />}
      </Button>
    </div>
  );
};

interface SlotProps {
  name: string | null;
  seed: number | null;
  score: string;
  setScore: (v: string) => void;
  winner: boolean;
  onForceWin: () => void;
  canForce: boolean;
}

const PlayerSlot = ({ name, seed, score, setScore, winner, onForceWin, canForce }: SlotProps) => (
  <div className={`flex items-center gap-2 min-w-0 ${winner ? 'bg-primary/10 rounded px-2 py-1' : 'px-2'}`}>
    {seed != null && <Badge variant="outline" className="h-5 px-1.5 text-[10px] shrink-0">{seed}</Badge>}
    <span className={`truncate flex-1 ${winner ? 'font-bold text-primary' : ''}`}>
      {name ?? <em className="text-muted-foreground">— BYE / por definir —</em>}
    </span>
    <Input
      type="number"
      inputMode="decimal"
      step="0.001"
      /* Oculta las flechitas (spin buttons) para no recortar el espacio visible del score. */
      className="h-7 w-16 text-xs [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
      value={score}
      onChange={(e) => setScore(e.target.value)} placeholder="—"
      disabled={!canForce}
    />
    {canForce && !winner && (
      <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]" onClick={onForceWin}>
        ⭐
      </Button>
    )}
  </div>
);

export default AdminBrackets;