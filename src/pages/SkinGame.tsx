/**
 * SkinGame Page (/skingame)
 * ------------------------------------------------------------
 * Replicates the legacy `skin_game_enca.php` + `skin_game_gross.php` /
 * `skin_game_neto.php` flow.
 *
 * MASTER view: per skin-game date, render a card per Skin_grupo_id with
 * Gross / Neto buttons. Each button is hidden when the group has no
 * winners computed for that variant (backend `hasGross` / `hasNeto`).
 *
 * DETAIL view: for the picked (group, date, tipo), show only the holes
 * with a unique winner — one row per winning player with
 * Club | Jugador | Cat. | Hoyo | Score.
 *
 * Reuses the same design tokens, PageHero, and secondary/primary color
 * pattern used across /skinscorecards for consistency.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Trophy } from 'lucide-react';
import skinHero from '@/assets/skin-hero.jpg';
import {
  getSkinGameMasterUrl,
  getSkinGameDetailUrl,
  POLL_ACTIVE,
} from '@/config/api';

// ============= Types (mirror /api/skin_game.php JSON) =============

/** One group inside a skin day, with per-variant availability. */
interface SkinGroup {
  groupId: number;
  hasGross: boolean;
  hasNeto: boolean;
}

/** One skin-game date with its groups. */
interface SkinDay {
  date: string;
  dateFormatted: string;
  groups: SkinGroup[];
}

/** Skin winner for a single hole (null when no unique minimum). */
interface SkinWinner {
  name: string;
  club: string;
  clubLogo: string;
  category: string;
  score: number;
}
interface SkinRow {
  hole: number;
  winner: SkinWinner | null;
}
interface SkinGameDetail {
  groupId: number;
  date: string;
  dateFormatted: string;
  type: 'gross' | 'neto';
  skins: SkinRow[];
}

/** Active detail request (null = master view). */
interface DetailKey {
  groupId: number;
  date: string;
  dateFormatted: string;
  tipo: 'gross' | 'neto';
}

// ============= Data hooks =============

/** Fetch the master list of skin dates + groups (with availability). */
const useSkinGameMaster = () =>
  useQuery<{ days: SkinDay[] }>({
    queryKey: ['skin-game', 'master'],
    queryFn: async () => {
      const res = await fetch(getSkinGameMasterUrl());
      if (!res.ok) throw new Error('Failed to load skin game master');
      return res.json();
    },
    refetchInterval: POLL_ACTIVE,
  });

/** Fetch per-hole winners for the selected group / tipo. */
const useSkinGameDetail = (key: DetailKey | null) =>
  useQuery<SkinGameDetail>({
    queryKey: ['skin-game', 'detail', key?.groupId, key?.date, key?.tipo],
    enabled: !!key,
    queryFn: async () => {
      const res = await fetch(
        getSkinGameDetailUrl(key!.groupId, key!.date, key!.tipo)
      );
      if (!res.ok) throw new Error('Failed to load skin game detail');
      return res.json();
    },
    refetchInterval: POLL_ACTIVE,
  });

// ============= Component =============

const SkinGame = () => {
  /** null → master (dates+groups grid); set → winners detail. */
  const [detail, setDetail] = useState<DetailKey | null>(null);

  const { data: master, isLoading: loadingMaster } = useSkinGameMaster();
  const { data: gameDetail, isLoading: loadingDetail } = useSkinGameDetail(detail);

  const handleBack = () => setDetail(null);

  /** Only holes that actually produced a winner. */
  const winnerRows = (gameDetail?.skins ?? []).filter((s) => s.winner);

  return (
    <Layout>
      <PageHero
        title="Skin Game"
        subtitle="Ganadores de skins por hoyo, grupo y fecha"
        backgroundImage={skinHero}
      />

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* ============= MASTER: dates + groups ============= */}
          {!detail && (
            <>
              {loadingMaster ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !master?.days.length ? (
                <div className="text-center text-muted-foreground py-12">
                  <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Aún no hay resultados de Skin Game publicados.
                </div>
              ) : (
                <div className="space-y-8 max-w-4xl mx-auto">
                  {master.days.map((day) => (
                    <div key={day.date}>
                      <h3 className="text-lg font-bold text-foreground mb-3 capitalize">
                        SKIN{' '}
                        <span className="text-muted-foreground font-medium">
                          {day.dateFormatted}
                        </span>
                      </h3>
                      <Card className="border-border/50">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {day.groups.map((g) => (
                              <div
                                key={`${day.date}-${g.groupId}`}
                                className="border rounded-md p-3 bg-card text-center space-y-2"
                              >
                                <div className="font-bold text-foreground">
                                  Gpo {g.groupId}
                                </div>
                                <div className="flex flex-col gap-2">
                                  {g.hasGross && (
                                    <Button
                                      size="sm"
                                      className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                                      onClick={() =>
                                        setDetail({
                                          groupId: g.groupId,
                                          date: day.date,
                                          dateFormatted: day.dateFormatted,
                                          tipo: 'gross',
                                        })
                                      }
                                    >
                                      Gross
                                    </Button>
                                  )}
                                  {g.hasNeto && (
                                    <Button
                                      size="sm"
                                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                                      onClick={() =>
                                        setDetail({
                                          groupId: g.groupId,
                                          date: day.date,
                                          dateFormatted: day.dateFormatted,
                                          tipo: 'neto',
                                        })
                                      }
                                    >
                                      Neto
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ============= DETAIL: winners per hole ============= */}
          {detail && (
            <>
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mb-6 gap-2 bg-primary/10 hover:bg-primary/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a fechas
              </Button>

              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-foreground">
                  GRUPO {detail.groupId}
                  <span className="text-muted-foreground font-medium">
                    {' '}/ {detail.dateFormatted}
                  </span>
                </h2>
                <p
                  className={
                    'text-lg font-bold mt-1 ' +
                    (detail.tipo === 'gross' ? 'text-secondary' : 'text-primary')
                  }
                >
                  – {detail.tipo === 'gross' ? 'GROSS' : 'NETO'}
                </p>
              </div>

              {loadingDetail || !gameDetail ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : winnerRows.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Ningún jugador ganó un skin en este grupo.
                </div>
              ) : (
                <div className="overflow-x-auto bg-white">
                  <table className="w-max mx-auto text-sm border-collapse tournament-table table-auto">
                    <thead>
                      <tr className="bg-primary text-primary-foreground">
                        <th className="px-2 py-2 w-12">Club</th>
                        <th className="px-3 py-2 text-left whitespace-nowrap">
                          Jugador
                        </th>
                        <th className="px-2 py-2 text-center">Cat.</th>
                        <th className="px-2 py-2 text-center">Hoyo</th>
                        <th className="px-2 py-2 text-center">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {winnerRows.map((row) => {
                        const w = row.winner!;
                        return (
                          <tr
                            key={`${row.hole}-${w.name}`}
                            className="bg-white even:bg-muted/30 border-b"
                          >
                            <td className="px-2 py-1 text-center">
                              {w.clubLogo && (
                                <img
                                  src={w.clubLogo}
                                  alt={w.club}
                                  className="inline-block object-contain"
                                  style={{ width: 38, height: 22 }}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display =
                                      'none';
                                  }}
                                />
                              )}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {w.name}
                            </td>
                            <td className="px-2 py-2 text-center">
                              {w.category}
                            </td>
                            <td className="px-2 py-2 text-center font-bold">
                              {row.hole}
                            </td>
                            <td
                              className={
                                'px-2 py-2 text-center font-bold ' +
                                (detail.tipo === 'gross'
                                  ? 'text-secondary'
                                  : 'text-primary')
                              }
                            >
                              {w.score}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center mt-3">
                Solo se muestran los hoyos con un único ganador (skin ganado).
              </p>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default SkinGame;