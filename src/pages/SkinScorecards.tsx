/**
 * SkinScorecards Page (/skinscorecards)
 * ------------------------------------------------------------
 * Replicates the legacy `enca_score_skin.php` + `skin_score_card_gross.php`
 * / `skin_score_card_neto.php` flow:
 *
 *  1. MASTER view: for every skin-game date, render a row of chips per
 *     `Skin_grupo_id` group, each with GROSS / NETO buttons.
 *  2. DETAIL view: when a group + tipo is chosen, fetch the full
 *     scorecard (par row + h1..h18 per player) and highlight the
 *     winning-hole cells in yellow.
 *
 * Reuses `PageHero`, semantic tokens, and the same responsive table
 * pattern used across Resultados / Live.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Trophy } from 'lucide-react';
import jugadoresHero from '@/assets/jugadores-hero.jpg';
import {
  getSkinScorecardMasterUrl,
  getSkinScorecardDetailUrl,
} from '@/config/api';
import { POLL_ACTIVE } from '@/config/api';

// ============= Types (mirror /api/skin_scorecard.php JSON) =============

/** One group inside a skin day (with campoid for the scorecard fetch) */
interface SkinGroup {
  groupId: number;
  campoId: number;
}

/** One skin-game date with its publishable groups */
interface SkinDay {
  date: string;
  dateFormatted: string;
  groups: SkinGroup[];
}

/** Player row in the scorecard detail */
interface SkinPlayer {
  id: number;
  name: string;
  club: string;
  clubLogo: string;
  category: string;
  scores: (number | null)[];
  highlight: boolean[];
  total: number | null;
}

interface SkinScorecardDetail {
  groupId: number;
  campoId: number;
  date: string;
  dateFormatted: string;
  type: 'gross' | 'neto';
  pars: number[];
  parTotal: number;
  players: SkinPlayer[];
}

/** Currently active detail request (null = master view) */
interface DetailKey {
  groupId: number;
  campoId: number;
  date: string;
  dateFormatted: string;
  tipo: 'gross' | 'neto';
}

// ============= Data hooks =============

/** Fetch the master list of skin dates + groups */
const useSkinMaster = () =>
  useQuery<{ days: SkinDay[] }>({
    queryKey: ['skin-scorecard', 'master'],
    queryFn: async () => {
      const res = await fetch(getSkinScorecardMasterUrl());
      if (!res.ok) throw new Error('Failed to load skin master');
      return res.json();
    },
    refetchInterval: POLL_ACTIVE,
  });

/** Fetch a single scorecard for the selected group / tipo */
const useSkinDetail = (key: DetailKey | null) =>
  useQuery<SkinScorecardDetail>({
    queryKey: [
      'skin-scorecard',
      'detail',
      key?.groupId,
      key?.campoId,
      key?.date,
      key?.tipo,
    ],
    enabled: !!key,
    queryFn: async () => {
      const res = await fetch(
        getSkinScorecardDetailUrl(key!.groupId, key!.date, key!.campoId, key!.tipo)
      );
      if (!res.ok) throw new Error('Failed to load skin scorecard');
      return res.json();
    },
    refetchInterval: POLL_ACTIVE,
  });

// ============= Component =============

const SkinScorecards = () => {
  /** null → master (dates+groups grid); set → scorecard detail */
  const [detail, setDetail] = useState<DetailKey | null>(null);

  const { data: master, isLoading: loadingMaster } = useSkinMaster();
  const { data: scorecard, isLoading: loadingDetail } = useSkinDetail(detail);

  const handleBack = () => setDetail(null);

  return (
    <Layout>
      <PageHero
        title="Skin Scorecards"
        subtitle="Tarjetas de Skin Game por grupo y fecha"
        backgroundImage={jugadoresHero}
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
                  Aún no hay tarjetas de Skin Game publicadas.
                </div>
              ) : (
                <div className="space-y-8 max-w-4xl mx-auto">
                  {master.days.map((day) => (
                    <div key={day.date}>
                      <h3 className="text-lg font-bold text-foreground mb-3 capitalize">
                        SCORE <span className="text-muted-foreground font-medium">{day.dateFormatted}</span>
                      </h3>
                      <Card className="border-border/50">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {day.groups.map((g) => (
                              <div
                                key={`${day.date}-${g.groupId}-${g.campoId}`}
                                className="border rounded-md p-3 bg-card text-center space-y-2"
                              >
                                <div className="font-bold text-foreground">
                                  Gpo {g.groupId}
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                                    onClick={() =>
                                      setDetail({
                                        groupId: g.groupId,
                                        campoId: g.campoId,
                                        date: day.date,
                                        dateFormatted: day.dateFormatted,
                                        tipo: 'gross',
                                      })
                                    }
                                  >
                                    Gross
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                                    onClick={() =>
                                      setDetail({
                                        groupId: g.groupId,
                                        campoId: g.campoId,
                                        date: day.date,
                                        dateFormatted: day.dateFormatted,
                                        tipo: 'neto',
                                      })
                                    }
                                  >
                                    Neto
                                  </Button>
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

          {/* ============= DETAIL: scorecard table ============= */}
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
                  <span className="text-muted-foreground font-medium"> / {detail.dateFormatted}</span>
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

              {loadingDetail || !scorecard ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Card className="border-border/50 bg-white">
                  <div className="overflow-x-auto bg-white">
                    <table className="w-max text-sm border-collapse tournament-table table-auto">
                      <thead>
                        {/* Par row */}
                        <tr className="bg-primary text-primary-foreground">
                          <th className="p-2 text-left w-12"></th>
                          <th className="px-2 py-2 text-left whitespace-nowrap w-[1%]">Par Campo</th>
                          {scorecard.pars.map((p, i) => (
                            <th key={`par-${i}`} className="px-1 py-2 text-center w-10">
                              {p}
                            </th>
                          ))}
                          <th className="px-2 py-2 text-center w-12">{scorecard.parTotal}</th>
                          <th className="p-2"></th>
                        </tr>
                        {/* Column headers */}
                        <tr className="bg-primary text-primary-foreground">
                          <th className="px-2 py-2 w-12">Club</th>
                          <th className="px-2 py-2 text-left whitespace-nowrap w-[1%]">Nombre</th>
                          {Array.from({ length: 18 }).map((_, i) => (
                            <th key={`h-${i}`} className="px-1 py-2 text-center">
                              {i + 1}
                            </th>
                          ))}
                          <th className="px-2 py-2 text-center">Tot.</th>
                          <th className="px-2 py-2 text-center">Cat.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scorecard.players.length === 0 ? (
                          <tr>
                            <td
                              colSpan={22}
                              className="text-center text-muted-foreground py-8"
                            >
                              No hay jugadores en este grupo.
                            </td>
                          </tr>
                        ) : (
                          scorecard.players.map((pl) => (
                            <tr key={pl.id} className="bg-white border-b">
                              <td className="px-2 py-1 text-center">
                                {pl.clubLogo && (
                                  <img
                                    src={pl.clubLogo}
                                    alt={pl.club}
                                    className="inline-block object-contain"
                                    style={{ width: 38, height: 22 }}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                )}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap">{pl.name}</td>
                              {pl.scores.map((s, i) => (
                                <td
                                  key={`s-${pl.id}-${i}`}
                                  className={
                                    'px-1 py-1 text-center ' +
                                    (pl.highlight[i]
                                      ? 'bg-yellow-300 font-bold text-black'
                                      : '')
                                  }
                                >
                                  {s ?? ''}
                                </td>
                              ))}
                              <td className="px-2 py-2 text-center font-bold">
                                {pl.total ?? ''}
                              </td>
                              <td className="px-2 py-2 text-center">{pl.category}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              <p className="text-xs text-muted-foreground text-center mt-3">
                Las celdas en amarillo indican el ganador del skin (único mínimo del hoyo).
              </p>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default SkinScorecards;