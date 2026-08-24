/**
 * AdminStats Component
 * ---------------------------------------------------------------
 * Admin section that lets the operator override the three numbers
 * displayed in the home Stats ribbon (StatsSection.tsx):
 *   1. Participantes Registrados  (totalHistoricalPlayers)
 *   2. Años de Historia reciente  (yearsHistory)
 *   3. Categorías en un Torneo    (maxCategories)
 *
 * Each field can be:
 *   - "Auto"  → the value is computed server-side from tournament data
 *               (tournament.php aggregates club history).
 *   - Manual  → admin types a number which is persisted to
 *               site_config.stats_config (keyed by domain == torneo).
 *
 * A "Restablecer" button clears all overrides at once, returning every
 * stat to its automatically computed value.
 * ---------------------------------------------------------------
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { BarChart3, Loader2, RotateCcw, Save } from 'lucide-react';
import { useSiteConfig, useSaveSiteConfig, type StatsConfig, type StatsPageConfig } from '@/hooks/useSiteConfig';
import { useTournamentStats } from '@/hooks/useTournamentData';
import { useToast } from '@/hooks/use-toast';
import { getSuperAdminPassword } from '@/lib/superAdminAuth';

/**
 * Local editor state — each stat has a boolean `manual` flag and a string
 * value (kept as string while editing so the input behaves naturally).
 */
interface StatRow {
  manual: boolean;
  value: string;
}

/** Default empty editor state with all stats in auto mode. */
const emptyRow = (): StatRow => ({ manual: false, value: '' });

const AdminStats = () => {
  const { data: siteConfig, isLoading } = useSiteConfig();
  const { data: tournamentStats } = useTournamentStats();
  const saveSiteConfig = useSaveSiteConfig();
  const { toast } = useToast();

  /** Editor state for each of the three stats */
  const [players, setPlayers] = useState<StatRow>(emptyRow());
  const [years, setYears] = useState<StatRow>(emptyRow());
  const [maxCat, setMaxCat] = useState<StatRow>(emptyRow());
  /**
   * Slogan del footer. Se persiste dentro de
   * `stats_page_config.overrides.footerTagline` (misma llave usada por
   * Footer.tsx) pero se edita desde este tab de Estadísticas por
   * decisión de producto.
   */
  const [footerTagline, setFooterTagline] = useState<string>('');

  /**
   * Hydrate editor from server config whenever it loads/changes.
   * A field becomes "manual" when its override is a number (not null).
   */
  useEffect(() => {
    const cfg = siteConfig?.stats_config ?? null;
    const toRow = (v: number | null | undefined): StatRow =>
      v === null || v === undefined
        ? { manual: false, value: '' }
        : { manual: true, value: String(v) };
    setPlayers(toRow(cfg?.totalHistoricalPlayers));
    setYears(toRow(cfg?.yearsHistory));
    setMaxCat(toRow(cfg?.maxCategories));
  }, [siteConfig?.stats_config]);

  /** Hydrate the footer tagline whenever the stats_page_config changes. */
  useEffect(() => {
    setFooterTagline(siteConfig?.stats_page_config?.overrides?.footerTagline ?? '');
  }, [siteConfig?.stats_page_config]);

  /**
   * Build the payload sent to the server. A row in "manual" mode with a
   * valid number contributes its value; otherwise the field is set to
   * null which signals "use auto".
   */
  const buildPayload = (): StatsConfig => {
    const num = (r: StatRow): number | null => {
      if (!r.manual) return null;
      const n = Number(r.value);
      return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
    };
    return {
      totalHistoricalPlayers: num(players),
      yearsHistory: num(years),
      maxCategories: num(maxCat),
    };
  };

  /** Persist overrides — null fields mean auto. */
  const handleSave = () => {
    const payload = buildPayload();
    // Merge tagline into the existing stats_page_config so we don't lose
    // section order or the other overrides managed from Admin > Página /stats.
    const existingPage = siteConfig?.stats_page_config;
    const mergedPage: StatsPageConfig | undefined = existingPage
      ? {
          ...existingPage,
          overrides: {
            ...(existingPage.overrides ?? {}),
            footerTagline: footerTagline.trim() || null,
          },
        }
      : {
          sections: [
            { id: 'clubes', enabled: true },
            { id: 'categoria', enabled: true },
            { id: 'tees', enabled: true },
            { id: 'jugador', enabled: true },
          ],
          overrides: { footerTagline: footerTagline.trim() || null },
        };
    saveSiteConfig.mutate(
      {
        password: getSuperAdminPassword(),
        stats_config: payload,
        stats_page_config: mergedPage,
      },
      {
        onSuccess: () =>
          toast({
            title: 'Estadísticas guardadas',
            description: 'Los valores se aplicarán para todos los visitantes.',
          }),
        onError: (err) =>
          toast({
            title: 'Error al guardar',
            description: err.message,
            variant: 'destructive',
          }),
      }
    );
  };

  /** Clear ALL overrides at once → all stats return to auto. */
  const handleResetAll = () => {
    saveSiteConfig.mutate(
      { password: getSuperAdminPassword(), stats_config: null },
      {
        onSuccess: () => {
          setPlayers(emptyRow());
          setYears(emptyRow());
          setMaxCat(emptyRow());
          toast({
            title: 'Estadísticas restablecidas',
            description: 'Todos los valores volverán a calcularse automáticamente.',
          });
        },
        onError: (err) =>
          toast({
            title: 'Error al restablecer',
            description: err.message,
            variant: 'destructive',
          }),
      }
    );
  };

  /**
   * Renders a single editable stat row with auto/manual toggle.
   */
  const renderRow = (
    label: string,
    autoValue: number | string | undefined,
    row: StatRow,
    setRow: (r: StatRow) => void,
    fieldId: string
  ) => (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_180px] gap-3 items-center border-b border-border pb-4">
      <div>
        <Label htmlFor={fieldId} className="font-medium">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground mt-1">
          Valor automático:{' '}
          <span className="font-mono">{autoValue ?? '—'}</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id={`${fieldId}-manual`}
          checked={row.manual}
          onCheckedChange={(checked) => setRow({ ...row, manual: checked })}
        />
        <Label htmlFor={`${fieldId}-manual`} className="text-xs text-muted-foreground">
          {row.manual ? 'Manual' : 'Auto'}
        </Label>
      </div>
      <Input
        id={fieldId}
        type="number"
        min={0}
        disabled={!row.manual}
        value={row.value}
        onChange={(e) => setRow({ ...row, value: e.target.value })}
        placeholder={row.manual ? 'Ingresa un número' : 'Auto'}
        className="font-mono"
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Estadísticas del Home
        </CardTitle>
        <CardDescription>
          Controla los tres números que aparecen en el bloque "Años de Nuestra
          Historia" del home. Cada valor puede dejarse en <strong>Auto</strong>{' '}
          (calculado del histórico del torneo) o cambiarse a{' '}
          <strong>Manual</strong> para forzar un número específico.
          La configuración se guarda <strong>por torneo (dominio)</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando configuración...
          </div>
        ) : (
          <>
            {renderRow(
              'Participantes Registrados',
              tournamentStats?.totalHistoricalPlayers,
              players,
              setPlayers,
              'stat-players'
            )}
            {renderRow(
              'Años de Historia',
              tournamentStats?.yearsHistory,
              years,
              setYears,
              'stat-years'
            )}
            {renderRow(
              'Categorías en un Torneo',
              tournamentStats?.maxCategories,
              maxCat,
              setMaxCat,
              'stat-cats'
            )}

            {/* Slogan del footer — override del texto que aparece en el pie
                bajo el nombre del torneo. Dejar vacío para el default.
                Se guarda junto al resto de estadísticas al presionar
                "Guardar cambios". */}
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-3 pt-2 border-t border-border">
              <Label htmlFor="footer-tagline" className="mt-2 font-medium">
                Slogan del footer
              </Label>
              <Textarea
                id="footer-tagline"
                value={footerTagline}
                onChange={(e) => setFooterTagline(e.target.value)}
                placeholder='Ej. "El torneo de golf amateur más importante de la región."'
                rows={2}
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={handleSave} disabled={saveSiteConfig.isPending} className="gap-2">
                {saveSiteConfig.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar cambios
              </Button>
              <Button
                variant="outline"
                onClick={handleResetAll}
                disabled={saveSiteConfig.isPending}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Restablecer todo a Auto
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminStats;