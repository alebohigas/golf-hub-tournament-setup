/**
 * Premios Page
 * Displays tournament prizes with a global player search
 * Search finds a player across all competitions and shows
 * grouped results by competition type with position/medal icons
 */

import { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import PlayerSearchInput from '@/components/shared/PlayerSearchInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Award, Medal, Star, Target, Flag, Zap, Crosshair, Ruler, Loader2 } from 'lucide-react';
import {
  useAllCompetenciasWithPlayers,
  searchPlayerAcrossCompetencias,
  collectUniquePlayerNames,
  type PlayerCompetitionResult,
} from '@/hooks/useAllCompetenciasData';

// ============= Icon Mapping =============

/** Map icon string names to Lucide icon components */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  target: Target,
  trophy: Trophy,
  flag: Flag,
  zap: Zap,
  star: Star,
  award: Award,
  medal: Medal,
  crosshair: Crosshair,
  ruler: Ruler,
};

/** Get icon component by name, fallback to Trophy */
const getIcon = (iconName: string) => {
  const IconComponent = iconMap[iconName] || Trophy;
  return <IconComponent className="h-6 w-6" />;
};

// ============= Medal Helper =============

/** Get medal emoji/icon for top positions */
const getPositionDisplay = (position: number) => {
  if (position === 1) return { emoji: '🥇', label: '1er Lugar', color: 'text-yellow-500' };
  if (position === 2) return { emoji: '🥈', label: '2do Lugar', color: 'text-gray-400' };
  if (position === 3) return { emoji: '🥉', label: '3er Lugar', color: 'text-amber-600' };
  return { emoji: '', label: `${position}° Lugar`, color: 'text-foreground' };
};

// ============= Sub-Components =============

/** Default prize cards shown when no search is active */
const DefaultPrizeCards = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {/* Champion card */}
    <Card className="border-border/50">
      <CardHeader className="text-center pb-2">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <Trophy className="h-8 w-8 text-amber-600" />
        </div>
        <CardTitle className="font-display">Campeón General</CardTitle>
      </CardHeader>
      <CardContent className="text-center text-muted-foreground">
        <p>Trofeo conmemorativo y reconocimiento especial para el campeón absoluto del torneo.</p>
      </CardContent>
    </Card>

    {/* Category card */}
    <Card className="border-border/50">
      <CardHeader className="text-center pb-2">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Medal className="h-8 w-8 text-gray-600" />
        </div>
        <CardTitle className="font-display">Por Categoría</CardTitle>
      </CardHeader>
      <CardContent className="text-center text-muted-foreground">
        <p>Premios para los tres primeros lugares de cada categoría del torneo.</p>
      </CardContent>
    </Card>

    {/* Special prizes card */}
    <Card className="border-border/50">
      <CardHeader className="text-center pb-2">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Star className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="font-display">Premios Especiales</CardTitle>
      </CardHeader>
      <CardContent className="text-center text-muted-foreground">
        <p>Hoyo en uno, drive más largo y tiro más cercano al hoyo.</p>
      </CardContent>
    </Card>

    {/* Category prizes breakdown */}
    <Card className="border-border/50 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Award className="h-5 w-5 text-accent" />
          Premiación por Categoría
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['1er Lugar', '2do Lugar', '3er Lugar', 'Mejor Neto'].map((premio, idx) => (
            <div key={idx} className="text-center p-4 bg-muted rounded-lg">
              <span className="text-2xl font-display font-bold text-accent block mb-1">
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '⭐'}
              </span>
              <span className="text-sm text-foreground font-medium">{premio}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// ============= Search Results Component =============

interface SearchResultsProps {
  /** Grouped results by competition type */
  groupedResults: Record<string, PlayerCompetitionResult[]>;
  /** Player name searched */
  playerName: string;
}

/** Display search results grouped by competition type */
const SearchResults = ({ groupedResults, playerName }: SearchResultsProps) => {
  const competitionIds = Object.keys(groupedResults);

  if (competitionIds.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          No se encontraron resultados para "{playerName}"
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          Resultados de <span className="text-primary">{playerName}</span>
        </h2>
        <p className="text-muted-foreground mt-1">
          Participó en {competitionIds.length} competencia{competitionIds.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Results by competition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {competitionIds.map(compId => {
          const results = groupedResults[compId];
          const first = results[0];
          return (
            <Card key={compId} className="border-border/50 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 font-display text-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {getIcon(first.competenciaIcon)}
                  </div>
                  {first.competenciaName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results.map((result, idx) => {
                  const pos = getPositionDisplay(result.position);
                  return (
                    <div
                      key={`${result.groupId}-${idx}`}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-foreground">{result.groupName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {pos.emoji && (
                          <span className="text-xl">{pos.emoji}</span>
                        )}
                        <span className={`font-bold text-lg ${pos.color}`}>
                          {pos.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ============= Main Component =============

const Premios = () => {
  /** Search query state */
  const [searchQuery, setSearchQuery] = useState('');

  /** Fetch all competitions with player data */
  const { competencias, isLoading } = useAllCompetenciasWithPlayers();

  /** Unique player names for autocomplete suggestions */
  const playerSuggestions = useMemo(
    () => collectUniquePlayerNames(competencias),
    [competencias]
  );

  /** Search results grouped by competition ID */
  const groupedResults = useMemo(() => {
    const results = searchPlayerAcrossCompetencias(competencias, searchQuery);
    // Group by competenciaId
    return results.reduce<Record<string, PlayerCompetitionResult[]>>((acc, r) => {
      if (!acc[r.competenciaId]) acc[r.competenciaId] = [];
      acc[r.competenciaId].push(r);
      return acc;
    }, {});
  }, [competencias, searchQuery]);

  /** Derive player display name from first result */
  const playerDisplayName = useMemo(() => {
    const allResults = Object.values(groupedResults).flat();
    return allResults.length > 0 ? allResults[0].playerName : searchQuery;
  }, [groupedResults, searchQuery]);

  /** Whether search is active */
  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <Layout>
      <PageHero
        title="Premios"
        subtitle="Reconocimientos y premiación del torneo"
      />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">

          {/* Player Search Bar with autocomplete */}
          <PlayerSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            suggestions={playerSuggestions}
            className="max-w-md mx-auto mb-10"
          />

          {/* Loading state */}
          {isLoading && isSearchActive && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Cargando competencias...</span>
            </div>
          )}

          {/* Search results or default cards */}
          {isSearchActive ? (
            <SearchResults
              groupedResults={groupedResults}
              playerName={playerDisplayName}
            />
          ) : (
            <DefaultPrizeCards />
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Premios;
