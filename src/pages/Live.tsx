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
import { fetchLiveScorecardFromApi, fetchPlayerScorecardFromApi } from '@/hooks/useResultadosData';
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
  /** YYYY-MM-DD dates of player's previous closed scorecards (statlsc=1) */
  prevRoundDates?: string[];
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
  /** YYYY-MM-DD dates of player's previous closed scorecards (statlsc=1) */
  prevRoundDates?: string[];
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
  /** 1 when every eligible category player has statlsc=1 for the current round */
  categoryClosed?: number;
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
 * Check if a player has finished the tournament.
 * Authoritative source: backend `finished` flag (1 when all scheduled
 * scorecards have statlsc=1 in the `tarjetas` table).
 * Falls back to legacy "thru >= 18" only when the flag is absent.
 */
const isPlayerFinished = (player: LivePlayer): boolean => {
  if (typeof player.finished === 'number') return player.finished === 1;
  return player.thru >= 18;
};

/**
 * Format the "Thru" column display
 * Shows "F" for finished players (tournament complete), hole number otherwise, "-" if 0
 */
const formatThru = (player: LivePlayer): string => {
  if (isPlayerFinished(player)) return 'F';
  if (player.thru === 0) return '-';
  return String(player.thru);
};

/**
 * Check if the Hoy score should open a scorecard.
 * The live API can report a valid current-day score while `thru` is 0 once the card is closed,
 * so clickability must be based on the displayed Hoy value instead of only holes-in-progress.
 */
const canOpenTodayScorecard = (player: LivePlayer): boolean => (
  typeof player.todayScore === 'number' && Number.isFinite(player.todayScore)
);

/**
 * Check if a whole category is finished — every player has all scorecards closed.
 * Uses the backend `finished` flag (statlsc-based) when available.
 */
const isCategoryCompleted = (players: LivePlayer[]): boolean => {
  if (players.length === 0) return false;
  return players.every(p => isPlayerFinished(p));
};

// ============= Component =============

const Live = () => {
  /** Currently selected category entry */
  const [selected, setSelected] = useState<LiveScoringEntry | null>(null);

  /** Expanded scorecard state: playerId or null */
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);
  /**
   * Stack of scorecards for the expanded player, ordered chronologically:
   * previous closed rounds first (oldest → newest), and the live (in-progress)
   * scorecard last. Each carries its own `date` for labeling.
   */
  const [scorecardStack, setScorecardStack] = useState<RoundScorecard[]>([]);
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
      if (data) {
        map.set(entry.categoryId, typeof data.categoryClosed === 'number'
          ? data.categoryClosed === 1
          : isCategoryCompleted(data.players)
        );
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
   * Click on the "Total" column.
   * Shows ONLY the player's previously closed scorecards (statlsc=1),
   * one per date, stacked top-to-bottom. The in-progress (live) round
   * is NOT included here — it belongs to the "Hoy" column.
   */
  const handleTotalClick = async (player: LivePlayer) => {
    // Toggle off if already expanded
    if (expandedPlayerId === player.playerId) {
      setExpandedPlayerId(null);
      setScorecardStack([]);
      return;
    }

    const prevDates = player.prevRoundDates ?? [];
    // Nothing to show if no closed scorecards exist
    if (prevDates.length === 0) return;

    setExpandedPlayerId(player.playerId);
    setScorecardStack([]);
    setScorecardLoading(true);

    try {
      const tipo = selected?.tipo || (isStroke ? 'stroke' : 'stableford');
      const scoringType = selected?.gross === 1 ? 'GROSS' : 'NETO';
      const system = (selected?.tipo === 'stableford' || tipo === 'stableford')
        ? 'STABLEFORD' : 'STROKE PLAY';

      // Fetch all previous closed scorecards in parallel (by date)
      const prevPromises = prevDates.map((fecha, idx) =>
        fetchPlayerScorecardFromApi(
          player.playerId,
          selected?.categoryId || '',
          fecha,
          system,
          scoringType,
          idx + 1
        ).then(sc => ({ ...sc, date: sc.date || fecha }))
         .catch(err => {
           console.error(`Failed to fetch previous scorecard for ${fecha}:`, err);
           return null;
         })
      );

      const prevResults = await Promise.all(prevPromises);
      const stack: RoundScorecard[] = prevResults
        .filter((c): c is RoundScorecard => c !== null);
      setScorecardStack(stack);
    } catch (err) {
      console.error('Failed to fetch previous scorecards:', err);
      setScorecardStack([]);
    } finally {
      setScorecardLoading(false);
    }
  };

  /**
   * Click on the "Hoy" column.
   * Shows the in-progress live scorecard for the current round only,
   * fetched from live_tarjeta.php.
   */
  const handleTodayClick = async (player: LivePlayer) => {
    // Toggle off if already expanded as "today" (use a sentinel suffix)
    const expandKey = `${player.playerId}::today`;
    if (expandedPlayerId === expandKey) {
      setExpandedPlayerId(null);
      setScorecardStack([]);
      return;
    }

    if (!canOpenTodayScorecard(player)) return;

    setExpandedPlayerId(expandKey);
    setScorecardStack([]);
    setScorecardLoading(true);

    try {
      const tipo = selected?.tipo || (isStroke ? 'stroke' : 'stableford');
      const scoringType = selected?.gross === 1 ? 'GROSS' : 'NETO';
      const live = await fetchLiveScorecardFromApi(player.playerId, tipo, scoringType, selected?.categoryId);
      setScorecardStack([live]);
    } catch (err) {
      console.error('Failed to fetch live scorecard:', err);
      setScorecardStack([]);
    } finally {
      setScorecardLoading(false);
    }
  };

  /** Reset scorecard state when changing category */
  const handleSelectCategory = (entry: LiveScoringEntry) => {
    setExpandedPlayerId(null);
    setScorecardStack([]);
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
                onClick={() => { setSelected(null); setExpandedPlayerId(null); setScorecardStack([]); }}
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
                                      // Dimensions reduced 5% (w-14/h-9 → w-[3.325rem]/h-[2.1375rem]) for consistency with other tables
                                      className="w-[3.325rem] h-[2.1375rem] object-contain rounded inline-block mx-auto"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                  ) : null}
                                </TableCell>

                                {/* Player name */}
                                <TableCell className="font-medium player-name-cell">
                                  {player.name}
                                </TableCell>

                                {/*
                                  Total column — clickable when player has previously CLOSED scorecards.
                                  Click expands all previous closed cards (statlsc=1) stacked by date.
                                  Live/in-progress round is NOT included here (see "Hoy").
                                */}
                                <TableCell className="text-center p-0">
                                  {(player.prevRoundDates && player.prevRoundDates.length > 0) ? (
                                    <button
                                      onClick={() => handleTotalClick(player)}
                                      className={`w-full py-3 px-2 transition-colors cursor-pointer hover:bg-primary/10 hover:text-primary ${
                                        isStroke ? getStrokeScoreClass(player.score) : 'font-bold'
                                      } ${expandedPlayerId === player.playerId ? 'bg-primary/15 text-primary font-bold underline underline-offset-2' : ''}`}
                                      title="Ver tarjetas de rondas previas"
                                    >
                                      {isStroke ? formatDifPar(player.score) : player.score}
                                    </button>
                                  ) : (
                                    <span className={`py-3 px-2 inline-block ${isStroke ? getStrokeScoreClass(player.score) : 'font-bold'}`}>
                                      {isStroke ? formatDifPar(player.score) : player.score}
                                    </span>
                                  )}
                                </TableCell>

                                {/* Holes completed — shows "F" when player has all scorecards closed (statlsc=1) */}
                                <TableCell className={`text-center text-sm ${isPlayerFinished(player) ? 'font-bold text-green-700' : ''}`}>
                                  {formatThru(player)}
                                </TableCell>

                                {/*
                                  Hoy column — clickable when player has started today's round (thru > 0).
                                  Click expands ONLY the in-progress live scorecard from live_tarjeta.php.
                                */}
                                <TableCell className="text-center p-0">
                                  {canOpenTodayScorecard(player) ? (
                                    <button
                                      onClick={() => handleTodayClick(player)}
                                      className={`w-full py-3 px-2 text-sm transition-colors cursor-pointer hover:bg-primary/10 hover:text-primary ${
                                        isStroke ? getStrokeScoreClass(player.todayScore ?? 0) : ''
                                      } ${expandedPlayerId === `${player.playerId}::today` ? 'bg-primary/15 text-primary font-bold underline underline-offset-2' : ''}`}
                                      title="Ver tarjeta en vivo (ronda en curso)"
                                    >
                                      {isStroke
                                        ? formatDifPar(player.todayScore ?? 0)
                                        : (player.todayScore ?? '-')
                                      }
                                    </button>
                                  ) : (
                                    <span className={`py-3 px-2 inline-block text-sm ${isStroke ? getStrokeScoreClass(player.todayScore ?? 0) : ''}`}>
                                      {isStroke
                                        ? formatDifPar(player.todayScore ?? 0)
                                        : (player.todayScore ?? '-')
                                      }
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>

                              {/*
                                Expanded scorecards block.
                                When triggered from "Total" → renders previous closed rounds (with date labels).
                                When triggered from "Hoy"   → renders the single in-progress live card.
                              */}
                              {(expandedPlayerId === player.playerId || expandedPlayerId === `${player.playerId}::today`) && (
                                scorecardLoading ? (
                                  <TableRow className="bg-white hover:bg-white">
                                    <TableCell colSpan={totalCols} className="text-center py-6 text-muted-foreground">
                                      Cargando tarjetas...
                                    </TableCell>
                                  </TableRow>
                                ) : scorecardStack.length > 0 ? (
                                  scorecardStack.map((sc, idx) => {
                                    const isLiveExpansion = expandedPlayerId === `${player.playerId}::today`;
                                    const roundLabel = isLiveExpansion
                                      ? 'En Vivo'
                                      : `Ronda ${idx + 1}`;
                                    return (
                                      <ScorecardRow
                                        key={`${player.playerId}-sc-${idx}`}
                                        scorecard={sc}
                                        playerName={player.name}
                                        roundLabel={roundLabel}
                                        onClose={() => {
                                          setExpandedPlayerId(null);
                                          setScorecardStack([]);
                                        }}
                                        colSpan={totalCols}
                                      />
                                    );
                                  })
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
