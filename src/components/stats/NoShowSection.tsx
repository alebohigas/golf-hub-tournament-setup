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
 *  - Each status row is a collapsible (botón desplegable) que muestra
 *    el nombre y la categoría de cada jugador con ese estatus.
 *  - Tipografía reducida respecto al resto de secciones, siguiendo el
 *    template (text-xl/2xl en título, text-xs en filas).
 *
 * Data comes from server/api/stats_clubes.php (useStatsClubes),
 * the same endpoint used by the Clubes Asistentes table.
 * Order and visibility of this section are controlled from
 * Admin > Página de Estadísticas (/stats).
 * ---------------------------------------------------------------
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { UserX, ChevronDown } from 'lucide-react';
import { useStatsClubes, type StatsNoShowPlayer } from '@/hooks/useStatsData';

/**
 * Fila desplegable de un estatus: botón con etiqueta + conteo y, al
 * abrirse, el listado de jugadores (nombre y categoría).
 */
const NoShowRow = ({
  label,
  value,
  players,
}: {
  label: string;
  value: number;
  players: StatsNoShowPlayer[];
}) => (
  <Collapsible className="bg-white">
    <CollapsibleTrigger className="w-full px-4 py-2 flex items-center justify-between gap-3 text-left hover:bg-muted/40 transition-colors group">
      <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        {label}
      </span>
      <Badge variant="secondary" className="font-mono tabular-nums text-xs px-2">
        {value}
      </Badge>
    </CollapsibleTrigger>
    <CollapsibleContent>
      {players.length > 0 ? (
        <ul className="divide-y divide-border border-t border-border">
          {players
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }))
            .map((p, i) => (
              <li
                key={`${p.name}-${i}`}
                className="px-4 py-1.5 pl-10 flex items-center justify-between gap-3 text-xs"
              >
                <span className="truncate">{p.name}</span>
                <span className="text-muted-foreground shrink-0">{p.categoria}</span>
              </li>
            ))}
        </ul>
      ) : (
        <p className="px-4 py-1.5 pl-10 text-xs text-muted-foreground border-t border-border">
          Sin detalle disponible
        </p>
      )}
    </CollapsibleContent>
  </Collapsible>
);

const NoShowSection = () => {
  const { data } = useStatsClubes();
  const noShow = data?.noShow;

  if (!noShow || !noShow.total) return null;

  const detail = noShow.players ?? {};

  /** Only statuses with a value greater than zero are displayed. */
  const items: { label: string; value: number; players: StatsNoShowPlayer[] }[] = [
    { label: 'Retiro',        value: noShow.retiro ?? 0,        players: detail.retiro ?? [] },
    { label: 'No Show',       value: noShow.noShow ?? 0,        players: detail.noShow ?? [] },
    { label: 'Descalificado', value: noShow.descalificado ?? 0, players: detail.descalificado ?? [] },
    { label: 'No contiende',  value: noShow.noContiende ?? 0,   players: detail.noContiende ?? [] },
  ].filter((i) => i.value > 0);

  return (
    <Card className="overflow-hidden border-2 border-muted-foreground/25 bg-white">
      <CardContent className="p-0">
        <div className="bg-muted border-b border-muted-foreground/25 px-4 py-3 flex items-center gap-2">
          <UserX className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-lg md:text-xl font-display font-bold uppercase tracking-wide text-muted-foreground">
              No show
            </h3>
            <span className="text-2xl md:text-3xl font-mono font-black text-muted-foreground leading-none">
              {noShow.total}
            </span>
            <span className="text-xs text-muted-foreground">
              jugadores que no completaron
            </span>
          </div>
        </div>
        <div className="divide-y divide-border">
          {items.map((i) => (
            <NoShowRow key={i.label} label={i.label} value={i.value} players={i.players} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NoShowSection;
