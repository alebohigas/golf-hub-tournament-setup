/**
 * Live Page
 * Real-time scoring leaderboard for the tournament
 * Fetches categories configured in admin via live_scoring_config
 * and displays leaderboard data from live_scoring.php API
 * 
 * Flow: Category cards → Leaderboard table
 * Auto-refreshes every 10 seconds
 */

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Radio, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { getLiveScoringUrl, POLL_LIVE } from '@/config/api';
import { useSiteConfig, type LiveScoringEntry } from '@/hooks/useSiteConfig';
import liveHero from '@/assets/live-hero.jpg';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ============= Types =============

/** Player row from live_scoring.php API */
interface LivePlayer {
  position: number;
  playerId: string;
  number: string;
  name: string;
  clubLogo: string;
  club: string;
  score: number;
  scoreSO: number;
  scoreSTB: number;
  scoreSTBGross: number;
  currentHole: number | null;
  thru: number | null;
  holes: (number | null)[];
  out: number;
  in: number;
  total: number;
  toPar: number;
  cardId: string;
  groupId: string | null;
}

/** API response from live_scoring.php */
interface LiveScoringResponse {
  categoryId: string;
  categoryName: string;
  shortName: string;
  system: string;
  type: string;
  gross: number;
  par: number;
  course: { rating: number; slope: number; tee: string } | null;
  players: LivePlayer[];
}

// ============= Helpers =============

/**
 * Format score display for stroke play (relative to par)
 * @param toPar - Score relative to par
 * @param total - Total strokes
 */
const formatStrokeScore = (toPar: number, total: number): string => {
  if (total === 0) return '-';
  if (toPar === 0) return 'E';
  return toPar > 0 ? `+${toPar}` : `${toPar}`;
};

/**
 * Get CSS class for score coloring
 * @param toPar - Score relative to par
 * @param isStroke - Whether stroke play
 */
const getScoreClass = (toPar: number, isStroke: boolean): string => {
  if (isStroke) {
    if (toPar < 0) return 'text-green-600 font-bold';
    if (toPar > 0) return 'text-red-600 font-bold';
    return 'font-bold';
  }
  return 'font-bold';
};

// ============= Component =============

const Live = () => {
  /** Currently selected category entry */
  const [selected, setSelected] = useState<LiveScoringEntry | null>(null);

  /** Site config with live scoring entries */
  const { data: siteConfig, isLoading: loadingConfig } = useSiteConfig();

  /** Enabled entries from admin config */
  const enabledEntries = (siteConfig?.live_scoring_config || []).filter(e => e.enabled);

  /** Fetch leaderboard data when a category is selected */
  const { data: leaderboard, isLoading: loadingLeaderboard } = useQuery<LiveScoringResponse>({
    queryKey: ['live-scoring', selected?.categoryId, selected?.tipo, selected?.gross],
    queryFn: () => apiFetch<LiveScoringResponse>(
      getLiveScoringUrl(selected!.categoryId, selected!.tipo, String(selected!.gross))
    ),
    enabled: !!selected,
    refetchInterval: POLL_LIVE,
  });

  /** Whether it's stroke play */
  const isStroke = selected?.tipo === 'stroke';

  return (
    <Layout>
      <PageHero
        title="Live"
        subtitle="Resultados en tiempo real del torneo"
        backgroundImage={liveHero}
      />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Loading state */}
          {loadingConfig && (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cargando configuración...
            </div>
          )}

          {/* No categories configured */}
          {!loadingConfig && enabledEntries.length === 0 && (
            <Card className="max-w-2xl mx-auto border-border/50">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                  <Radio className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Próximamente
                </h2>
                <p className="text-muted-foreground">
                  El live scoring estará disponible durante las fechas del torneo.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Category selection */}
          {!loadingConfig && enabledEntries.length > 0 && !selected && (
            <>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-foreground">
                  Resultados en Vivo
                </h2>
                <p className="text-muted-foreground mt-2">Selecciona una categoría</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {enabledEntries.map((entry, idx) => (
                  <Card
                    key={`${entry.categoryId}-${idx}`}
                    className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer group"
                    onClick={() => setSelected(entry)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Radio className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-foreground text-lg mb-2">
                        {entry.categoryName}
                      </h3>
                      <div className="flex justify-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {entry.tipo === 'stroke' ? 'Stroke Play' : 'Stableford'}
                        </Badge>
                        {entry.gross === 1 && (
                          <Badge variant="outline" className="text-xs">GROSS</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Leaderboard view */}
          {selected && (
            <>
              <Button
                variant="ghost"
                onClick={() => setSelected(null)}
                className="mb-6 gap-2 bg-primary/10 hover:bg-primary/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a categorías
              </Button>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {selected.categoryName}
                </h2>
                <div className="flex justify-center gap-2">
                  <Badge>{selected.tipo === 'stroke' ? 'Stroke Play' : 'Stableford'}</Badge>
                  {selected.gross === 1 && <Badge variant="outline">GROSS</Badge>}
                  {leaderboard && <Badge variant="secondary">Par {leaderboard.par}</Badge>}
                </div>
              </div>

              {/* Loading leaderboard */}
              {loadingLeaderboard && !leaderboard && (
                <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Cargando leaderboard...
                </div>
              )}

              {/* Leaderboard table */}
              {leaderboard && leaderboard.players.length > 0 && (
                <Card className="border-border/50 max-w-5xl mx-auto overflow-hidden">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-primary/5">
                            <TableHead className="w-[60px] text-center">Pos</TableHead>
                            <TableHead>Jugador</TableHead>
                            <TableHead className="text-center">Club</TableHead>
                            <TableHead className="text-center w-[80px]">
                              {isStroke ? 'Score' : 'Pts'}
                            </TableHead>
                            <TableHead className="text-center w-[60px]">Thru</TableHead>
                            <TableHead className="text-center w-[60px]">Out</TableHead>
                            <TableHead className="text-center w-[60px]">In</TableHead>
                            <TableHead className="text-center w-[60px]">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {leaderboard.players.map((player) => (
                            <TableRow key={player.playerId} className="bg-white hover:bg-muted/30">
                              <TableCell className="text-center font-bold">
                                {player.position}
                              </TableCell>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {player.clubLogo && (
                                    <img
                                      src={player.clubLogo}
                                      alt={player.club}
                                      className="w-6 h-6 object-contain"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                  )}
                                  {player.name}
                                </div>
                              </TableCell>
                              <TableCell className="text-center text-sm text-muted-foreground">
                                {player.club}
                              </TableCell>
                              <TableCell className={`text-center ${getScoreClass(player.toPar, isStroke)}`}>
                                {isStroke
                                  ? formatStrokeScore(player.toPar, player.total)
                                  : player.score
                                }
                              </TableCell>
                              <TableCell className="text-center text-sm">
                                {player.thru ?? player.currentHole ?? '-'}
                              </TableCell>
                              <TableCell className="text-center text-sm">
                                {player.out || '-'}
                              </TableCell>
                              <TableCell className="text-center text-sm">
                                {player.in || '-'}
                              </TableCell>
                              <TableCell className="text-center font-semibold">
                                {player.total || '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Empty leaderboard */}
              {leaderboard && leaderboard.players.length === 0 && (
                <Card className="max-w-2xl mx-auto border-border/50">
                  <CardContent className="p-12 text-center">
                    <Radio className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No hay datos de scoring disponibles para esta categoría en este momento.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Auto-refresh indicator */}
              <p className="text-center text-xs text-muted-foreground mt-4">
                Actualización automática cada 10 segundos
              </p>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Live;
