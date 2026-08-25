/**
 * NoShowSection
 * ---------------------------------------------------------------
 * Standalone /stats section showing the "NO SHOW" summary card:
 * headline total plus itemized rows for Retiro / No Show /
 * Descalificado / No contiende.
 *
 * Rules:
 *  - Any status with a zero (or missing) count is NOT rendered.
 *  - The whole card is hidden when there are no no-show players.
 *
 * Data comes from server/api/stats_clubes.php (useStatsClubes),
 * the same endpoint used by the Clubes Asistentes table.
 * Order and visibility of this section are controlled from
 * Admin > Página de Estadísticas (/stats).
 * ---------------------------------------------------------------
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserX } from 'lucide-react';
import { useStatsClubes } from '@/hooks/useStatsData';

/** Single labeled row inside the NO SHOW card. */
const NoShowRow = ({ label, value }: { label: string; value: number }) => (
  <div className="px-6 py-3 flex items-center justify-between bg-white">
    <span className="text-sm font-medium">{label}</span>
    <Badge variant="secondary" className="font-mono tabular-nums text-base px-3">
      {value}
    </Badge>
  </div>
);

const NoShowSection = () => {
  const { data } = useStatsClubes();
  const noShow = data?.noShow;

  if (!noShow || !noShow.total) return null;

  /** Only statuses with a value greater than zero are displayed. */
  const items: { label: string; value: number }[] = [
    { label: 'Retiro',        value: noShow.retiro ?? 0 },
    { label: 'No Show',       value: noShow.noShow ?? 0 },
    { label: 'Descalificado', value: noShow.descalificado ?? 0 },
    { label: 'No contiende',  value: noShow.noContiende ?? 0 },
  ].filter((i) => i.value > 0);

  return (
    <Card className="overflow-hidden border-2 border-muted-foreground/25 bg-white">
      <CardContent className="p-0">
        <div className="bg-muted border-b border-muted-foreground/25 px-6 py-4 flex items-center gap-3">
          <UserX className="h-6 w-6 text-muted-foreground" />
          <div className="flex items-baseline gap-3 flex-wrap">
            <h3 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-wide text-muted-foreground">
              NO SHOW
            </h3>
            <span className="text-4xl md:text-5xl font-mono font-black text-muted-foreground leading-none">
              {noShow.total}
            </span>
            <span className="text-sm text-muted-foreground">
              jugadores no jugaron
            </span>
          </div>
        </div>
        <div className="divide-y divide-border">
          {items.map((i) => (
            <NoShowRow key={i.label} label={i.label} value={i.value} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NoShowSection;
