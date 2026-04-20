/**
 * Live Page
 * Real-time scoring leaderboard for the tournament
 * Fetches categories configured in admin via live_scoring_config
 * and displays leaderboard data from live_scoring.php API
 * 
 * Stableford: shows total SA points, today's SA, holes played (thru)
 * Stroke: shows diff to par, today's diff, holes played (thru)
 * 
 * Flow: Category cards → Leaderboard table
 * Auto-refreshes every 10 seconds
 * 
 * Clickable scores: clicking a player's main score (Dif Par / Total)
 * expands their live scorecard fetched from live_tarjeta.php
 */

import { useState, useMemo, Fragment } from 'react';
import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Radio, Loader2, CheckCircle2 } from 'lucide-react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { getLiveScoringUrl, POLL_LIVE } from '@/config/api';
import { useSiteConfig, type LiveScoringEntry } from '@/hooks/useSiteConfig';
import { fetchLiveScorecardFromApi } from '@/hooks/useResultadosData';
import type { RoundScorecard } from '@/data/resultadosData';
import ScorecardRow from '@/components/resultados/ScorecardRow';
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

/** Player row from live_scoring.php — Stableford mode */
interface StablefordPlayer {
  position: number;
  playerId: string;
  number: string;
  name: string;
  clubLogo: string;
  club: string;
  /** Total accumulated SA points */
  score: number;
  /** Previous round accumulated SA */
  prevRoundScore: number;
  /** Current round SA points */
  todayScore: number;
  /** Holes completed in current round */
  thru: number;
  status: string;
  /** Number of player's scorecards with statlsc=1 (closed) — from live_scoring.php */
  cardsClosed?: number;
  /** Total scheduled rounds for the category (from caljuego) */
  cardsTotal?: number;
  /** 1 when cardsClosed >= cardsTotal — player has completed the tournament */
  finished?: number;
}

/** Player row from live_scoring.php — Stroke mode */
interface StrokePlayer {
  position: number;
  playerId: string;
  name: string;
  clubLogo: string;
  club: string;
  /** Accumulated difference to par */
  score: number;
  /** Current round difference to par */
  todayScore: number;
  /** Holes completed in current round */
  thru: number;
  handicap: string;
  status: string;
  /** Number of player's scorecards with statlsc=1 (closed) — from live_scoring.php */
  cardsClosed?: number;
  /** Total scheduled rounds for the category (from caljuego) */
  cardsTotal?: number;
  /** 1 when cardsClosed >= cardsTotal — player has completed the tournament */
  finished?: number;
}

/** Union type for player row */
type LivePlayer = StablefordPlayer | StrokePlayer;

/** API response from live_scoring.php */
interface LiveScoringResponse {
  categoryId: string;
  categoryName: string;
  shortName: string;
  system: string;
  type: 'stroke' | 'stableford';
  gross: number;
  par: number;
  course: { rating: number; slope: number; tee: string } | null;
  players: LivePlayer[];
}

// ============= Helpers =============

/**
 * Format stroke score display (difference to par)
 * E for even, +N for over, -N for under
 */
const formatDifPar = (difpar: number): string => {
  if (difpar === 0) return 'E';
  return difpar > 0 ? `+${difpar}` : `${difpar}`;
};

/**
 * Get CSS class for stroke score coloring
 * Red for under par (negative), black for over par or even
 */
const getStrokeScoreClass = (difpar: number): string => {
  if (difpar < 0) return 'text-red-600 font-bold';
  return 'text-foreground font-bold';
};

/**
 * Check if a player has finished their round (18 holes completed)
 */
const isPlayerFinished = (thru: number): boolean => thru >= 18;

/**
 * Format the "Thru" column display
 * Shows "F" for finished players (18 holes), hole number otherwise, "-" if 0
 */
const formatThru = (thru: number): string => {
  if (thru >= 18) return 'F';
  if (thru === 0) return '-';
  return String(thru);
};

/**
 * Check if all players in a category have finished (all thru >= 18)
 */
const isCategoryCompleted = (players: LivePlayer[]): boolean => {
  if (players.length === 0) return false;
  return players.every(p => p.thru >= 18);
};

// ============= Component =============

const Live = () => {
  /** Currently selected category entry */
  const [selected, setSelected] = useState<LiveScoringEntry | null>(null);

  /** Expanded scorecard state: playerId or null */
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);
  const [scorecardData, setScorecardData] = useState<RoundScorecard | null>(null);
  const [scorecardLoading, setScorecardLoading] = useState(false);

  /** Site config with live scoring entries */
  const { data: siteConfig, isLoading: loadingConfig } = useSiteConfig();

  /** Enabled entries from admin config, sorted by order (default: categoryId ASC) */
  const enabledEntries = (siteConfig?.live_scoring_config || [])
    .filter(e => e.enabled)
    .sort((a, b) => (a.order ?? Number(a.categoryId)) - (b.order ?? Number(b.categoryId)));

  /** Pre-fetch all category leaderboards to detect completion status on card view */
  const categoryQueries = useQueries({
    queries: enabledEntries.map(entry => ({
      queryKey: ['live-scoring', entry.categoryId, entry.tipo, entry.gross],
      queryFn: () => apiFetch<LiveScoringResponse>(
        getLiveScoringUrl(entry.categoryId, entry.tipo, String(entry.gross))
      ),
      refetchInterval: POLL_LIVE,
    })),
  });

  /** Map of categoryId → completion status */
  const completionMap = useMemo(() => {
    const map = new Map<string, boolean>();
    enabledEntries.forEach((entry, idx) => {
      const data = categoryQueries[idx]?.data;
      if (data && data.players.length > 0) {
        map.set(entry.categoryId, isCategoryCompleted(data.players));
      }
    });
    return map;
  }, [enabledEntries, categoryQueries]);

  /** Get leaderboard for currently selected category from pre-fetched data */
  const selectedIdx = selected
    ? enabledEntries.findIndex(e => e.categoryId === selected.categoryId)
    : -1;
  const leaderboard = selectedIdx >= 0 ? categoryQueries[selectedIdx]?.data : undefined;
  const loadingLeaderboard = selectedIdx >= 0 ? categoryQueries[selectedIdx]?.isLoading : false;

  /** Whether the selected category is completed */
  const isSelectedCompleted = selected ? (completionMap.get(selected.categoryId) ?? false) : false;

  /** Whether it's stroke play */
  const isStroke = leaderboard?.type === 'stroke' || selected?.tipo === 'stroke';

  /**
   * Handle click on a player's main score to show/hide their live scorecard
   * Fetches data from live_tarjeta.php
   */
  const handleScoreClick = async (player: LivePlayer) => {
    // Toggle off if already expanded
    if (expandedPlayerId === player.playerId) {
      setExpandedPlayerId(null);
      setScorecardData(null);
      return;
    }

    // Only show scorecard if player has started (thru > 0)
    if (player.thru <= 0) return;

    setExpandedPlayerId(player.playerId);
    setScorecardData(null);
    setScorecardLoading(true);

    try {
      const tipo = selected?.tipo || (isStroke ? 'stroke' : 'stableford');
      const scoringType = selected?.gross === 1 ? 'GROSS' : 'NETO';
      const scorecard = await fetchLiveScorecardFromApi(player.playerId, tipo, scoringType);
      setScorecardData(scorecard);
    } catch (err) {
      console.error('Failed to fetch live scorecard:', err);
      setScorecardData(null);
    } finally {
      setScorecardLoading(false);
    }
  };

  /** Reset scorecard state when changing category */
  const handleSelectCategory = (entry: LiveScoringEntry) => {
    setExpandedPlayerId(null);
    setScorecardData(null);
    setSelected(entry);
  };

  /** Total number of columns in the leaderboard table */
  const totalCols = 6;

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

          {/* Category selection cards */}
          {!loadingConfig && enabledEntries.length > 0 && !selected && (
            <>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-foreground">
                  Resultados en Vivo
                </h2>
                <p className="text-muted-foreground mt-2">Selecciona una categoría</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {enabledEntries.map((entry, idx) => {
                  const isCompleted = completionMap.get(entry.categoryId) ?? false;

                  return (
                    <Card
                      key={`${entry.categoryId}-${idx}`}
                      className={`border-border/50 transition-all ${
                        isCompleted
                          ? 'opacity-60 cursor-default border-muted'
                          : 'hover:border-primary/50 hover:shadow-lg cursor-pointer group'
                      }`}
                      onClick={() => !isCompleted && handleSelectCategory(entry)}
                    >
                      <CardContent className="p-6 text-center">
                        <div className={`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center transition-colors ${
                          isCompleted
                            ? 'bg-muted text-muted-foreground'
                            : entry.tipo === 'stroke'
                              ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                              : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
                        }`}>
                          {isCompleted
                            ? <CheckCircle2 className="h-6 w-6" />
                            : <Radio className="h-6 w-6" />
                          }
                        </div>
                        <h3 className={`font-bold text-lg mb-2 ${isCompleted ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {entry.categoryName}
                        </h3>

                        {/* Completed message */}
                        {isCompleted && (
                          <p className="text-xs text-muted-foreground mb-2">
                            Categoría terminada, visualiza en resultados
                          </p>
                        )}

                        <div className="flex justify-center gap-2">
                          <Badge
                            className={`text-xs ${
                              isCompleted
                                ? 'bg-muted text-muted-foreground'
                                : entry.tipo === 'stroke'
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-primary text-primary-foreground'
                            }`}
                          >
                            {entry.tipo === 'stroke' ? 'Stroke Play' : 'Stableford'}
                          </Badge>
                          {entry.gross === 1 && (
                            <Badge variant="outline" className="text-xs">GROSS</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          {/* Leaderboard view */}
          {selected && (
            <>
              <Button
                variant="ghost"
                onClick={() => { setSelected(null); setExpandedPlayerId(null); setScorecardData(null); }}
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
                  {isSelectedCompleted && (
                    <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Finalizado
                    </Badge>
                  )}
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
                      <Table className="tournament-table">
                        <TableHeader>
                          <TableRow className="bg-primary hover:bg-primary">
                            <TableHead className="text-primary-foreground font-bold w-[50px] text-center">Pos</TableHead>
                            <TableHead className="text-primary-foreground font-bold w-16 min-w-16 p-1 text-center">Club</TableHead>
                            <TableHead className="text-primary-foreground font-bold">Jugador</TableHead>
                            <TableHead className="text-primary-foreground font-bold text-center w-[80px]">
                              {isStroke ? 'Dif Par' : 'Total'}
                            </TableHead>
                            <TableHead className="text-primary-foreground font-bold text-center w-[60px]">Thru</TableHead>
                            <TableHead className="text-primary-foreground font-bold text-center w-[80px]">Hoy</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {leaderboard.players.map((player) => (
                            <Fragment key={player.playerId}>
                              <TableRow className="bg-white">
                                {/* Position */}
                                <TableCell className="text-center font-bold">
                                  {player.position}
                                </TableCell>

                                {/* Club logo */}
                                <TableCell className="w-16 min-w-16 p-1 text-center align-middle">
                                  {player.clubLogo ? (
                                    <img
                                      src={player.clubLogo}
                                      alt={player.club}
                                      className="w-14 h-9 object-contain rounded inline-block mx-auto"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                  ) : null}
                                </TableCell>

                                {/* Player name */}
                                <TableCell className="font-medium player-name-cell">
                                  {player.name}
                                </TableCell>

                                {/* Main score — clickable to expand live scorecard */}
                                <TableCell className="text-center p-0">
                                  {player.thru > 0 ? (
                                    <button
                                      onClick={() => handleScoreClick(player)}
                                      className={`w-full py-3 px-2 transition-colors cursor-pointer hover:bg-primary/10 hover:text-primary ${
                                        isStroke ? getStrokeScoreClass(player.score) : 'font-bold'
                                      } ${expandedPlayerId === player.playerId ? 'bg-primary/15 text-primary font-bold underline underline-offset-2' : ''}`}
                                      title="Ver tarjeta en vivo"
                                    >
                                      {isStroke ? formatDifPar(player.score) : player.score}
                                    </button>
                                  ) : (
                                    <span className={`py-3 px-2 inline-block ${isStroke ? getStrokeScoreClass(player.score) : 'font-bold'}`}>
                                      {isStroke ? formatDifPar(player.score) : player.score}
                                    </span>
                                  )}
                                </TableCell>

                                {/* Holes completed — shows "F" when finished */}
                                <TableCell className={`text-center text-sm ${isPlayerFinished(player.thru) ? 'font-bold text-green-700' : ''}`}>
                                  {formatThru(player.thru)}
                                </TableCell>

                                {/* Today's score */}
                                <TableCell className={`text-center text-sm ${isStroke ? getStrokeScoreClass(player.todayScore ?? 0) : ''}`}>
                                  {isStroke
                                    ? formatDifPar(player.todayScore ?? 0)
                                    : (player.todayScore ?? '-')
                                  }
                                </TableCell>
                              </TableRow>

                              {/* Expanded live scorecard row */}
                              {expandedPlayerId === player.playerId && (
                                scorecardLoading ? (
                                  <TableRow className="bg-white hover:bg-white">
                                    <TableCell colSpan={totalCols} className="text-center py-6 text-muted-foreground">
                                      Cargando tarjeta...
                                    </TableCell>
                                  </TableRow>
                                ) : scorecardData ? (
                                  <ScorecardRow
                                    scorecard={scorecardData}
                                    playerName={player.name}
                                    roundLabel="En Vivo"
                                    onClose={() => { setExpandedPlayerId(null); setScorecardData(null); }}
                                    colSpan={totalCols}
                                  />
                                ) : null
                              )}
                            </Fragment>
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

              {/* Auto-refresh indicator — hidden when category is completed */}
              {!isSelectedCompleted && (
                <p className="text-center text-xs text-muted-foreground mt-4">
                  Actualización automática cada 10 segundos
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Live;
