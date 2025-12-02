import { Card, CardContent } from '@/components/ui/card';
import { CategoryGroup, CompetitionWinner } from '@/data/competicionData';
import { Medal, ChevronRight } from 'lucide-react';

interface CategoryGroupCardProps {
  group: CategoryGroup;
  maxWinners: number;
  searchQuery?: string;
  onClick: () => void;
}

const HighlightedName = ({ name, highlight }: { name: string; highlight?: string }) => {
  if (!highlight) return <>{name}</>;
  
  const index = name.toLowerCase().indexOf(highlight.toLowerCase());
  if (index === -1) return <>{name}</>;
  
  return (
    <>
      {name.slice(0, index)}
      <span className="bg-primary/30 text-primary font-bold">
        {name.slice(index, index + highlight.length)}
      </span>
      {name.slice(index + highlight.length)}
    </>
  );
};

const WinnerRow = ({ 
  winner, 
  position, 
  searchQuery,
  isSearchMatch 
}: { 
  winner: CompetitionWinner; 
  position: number; 
  searchQuery?: string;
  isSearchMatch?: boolean;
}) => (
  <div 
    className={`px-4 py-3 flex items-center gap-3 ${
      isSearchMatch 
        ? 'bg-primary/10 border-l-4 border-primary' 
        : position % 2 === 0 
          ? 'bg-background' 
          : 'bg-muted/30'
    }`}
  >
    {/* Position Badge */}
    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
      position === 0 
        ? 'bg-yellow-500 text-yellow-950' 
        : position === 1 
          ? 'bg-gray-400 text-gray-900' 
          : position === 2 
            ? 'bg-amber-600 text-amber-950' 
            : 'bg-muted text-muted-foreground'
    }`}>
      {position === 0 ? <Medal className="h-4 w-4" /> : position + 1}
    </div>
    
    {/* Player Info */}
    <div className="flex-1 min-w-0">
      <p className="font-medium text-foreground truncate">
        <HighlightedName name={winner.playerName} highlight={searchQuery} />
      </p>
      <p className="text-xs text-muted-foreground truncate">{winner.club}</p>
    </div>
    
    {/* Result */}
    {winner.result && (
      <span className="font-bold text-primary text-lg flex-shrink-0">
        {winner.result}
      </span>
    )}
  </div>
);

const CategoryGroupCard = ({ group, maxWinners, searchQuery, onClick }: CategoryGroupCardProps) => {
  const searchTerm = searchQuery?.trim().toLowerCase() || '';
  const isSearching = searchTerm.length > 0;
  
  // Find matched players with their positions
  const matchedPlayers = isSearching 
    ? group.winners
        .map((winner, idx) => ({ winner, position: idx }))
        .filter(({ winner }) => winner.playerName.toLowerCase().includes(searchTerm))
    : [];

  // Determine what to display
  const displayWinners = isSearching 
    ? matchedPlayers 
    : group.winners.slice(0, maxWinners).map((winner, idx) => ({ winner, position: idx }));

  return (
    <Card 
      className="border-border/50 overflow-hidden hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="bg-primary px-4 py-3 flex justify-between items-center">
        <span className="font-bold text-primary-foreground">
          {group.name}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-primary-foreground/80 text-sm">
            {isSearching 
              ? `${matchedPlayers.length} encontrado${matchedPlayers.length !== 1 ? 's' : ''}`
              : `${group.winners.length} total`
            }
          </span>
          <ChevronRight className="h-4 w-4 text-primary-foreground/80" />
        </div>
      </div>
      
      {/* Winners */}
      <CardContent className="p-0">
        {displayWinners.map(({ winner, position }, idx) => (
          <div 
            key={winner.id}
            className={idx < displayWinners.length - 1 ? 'border-b border-border/30' : ''}
          >
            <WinnerRow 
              winner={winner} 
              position={position} 
              searchQuery={searchQuery}
              isSearchMatch={isSearching}
            />
          </div>
        ))}
        
        {displayWinners.length === 0 && (
          <div className="px-4 py-6 text-center text-muted-foreground text-sm">
            {isSearching ? 'No hay coincidencias' : 'Sin ganadores registrados'}
          </div>
        )}

        {!isSearching && group.winners.length > maxWinners && (
          <div className="px-4 py-2 text-center text-primary text-sm bg-primary/5 border-t border-border/30">
            Ver {group.winners.length - maxWinners} más →
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryGroupCard;
