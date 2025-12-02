import { Card, CardContent } from '@/components/ui/card';
import { Competition, CategoryGroup } from '@/data/competicionData';
import { Target, Trophy, Flag, Zap, Star, Award, Medal } from 'lucide-react';

const iconMap = {
  target: Target,
  trophy: Trophy,
  flag: Flag,
  zap: Zap,
  star: Star,
  award: Award,
  medal: Medal,
};

interface CompetitionCardProps {
  competition: Competition;
}

const WinnerRow = ({ 
  winner, 
  position 
}: { 
  winner: { playerName: string; club: string; result?: string }; 
  position: number;
}) => (
  <div 
    className={`flex items-center gap-3 p-2 rounded-lg ${
      position === 0 
        ? 'bg-yellow-500/10 border border-yellow-500/20' 
        : 'bg-muted/20'
    }`}
  >
    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
      position === 0 
        ? 'bg-yellow-500 text-yellow-950' 
        : position === 1 
          ? 'bg-gray-400 text-gray-900' 
          : position === 2 
            ? 'bg-amber-600 text-amber-950' 
            : 'bg-muted text-muted-foreground'
    }`}>
      {position + 1}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-foreground text-sm truncate">{winner.playerName}</p>
      <p className="text-xs text-muted-foreground truncate">{winner.club}</p>
    </div>
    {winner.result && (
      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
        {winner.result}
      </span>
    )}
  </div>
);

const CategoryGroupSection = ({ 
  group, 
  maxWinners 
}: { 
  group: CategoryGroup; 
  maxWinners: number;
}) => (
  <div className="space-y-2">
    <h4 className="text-sm font-semibold text-muted-foreground border-b border-border/50 pb-1">
      {group.name}
    </h4>
    <div className="space-y-1.5">
      {group.winners.slice(0, maxWinners).map((winner, idx) => (
        <WinnerRow key={winner.id} winner={winner} position={idx} />
      ))}
      {group.winners.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">Sin ganadores</p>
      )}
    </div>
  </div>
);

const CompetitionCard = ({ competition }: CompetitionCardProps) => {
  const IconComponent = iconMap[competition.icon];

  return (
    <Card className="border-border/50 hover:border-primary/30 transition-all">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border/50">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <IconComponent className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-lg">{competition.name}</h3>
            <p className="text-sm text-muted-foreground">{competition.description}</p>
          </div>
        </div>

        {/* Category Groups */}
        <div className={`grid gap-4 ${
          competition.categoryGroups.length === 1 
            ? 'grid-cols-1' 
            : competition.categoryGroups.length === 2 
              ? 'grid-cols-1 sm:grid-cols-2' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {competition.categoryGroups.map((group) => (
            <CategoryGroupSection 
              key={group.id} 
              group={group} 
              maxWinners={competition.maxWinnersPerGroup} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitionCard;
