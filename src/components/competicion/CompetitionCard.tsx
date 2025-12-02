import { Card, CardContent } from '@/components/ui/card';
import { CategoryGroup } from '@/data/competicionData';
import { Medal } from 'lucide-react';

interface CategoryGroupCardProps {
  group: CategoryGroup;
  maxWinners: number;
}

const CategoryGroupCard = ({ group, maxWinners }: CategoryGroupCardProps) => {
  return (
    <Card className="border-border/50 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="bg-primary px-4 py-3 flex justify-between items-center">
        <span className="font-bold text-primary-foreground">
          {group.name}
        </span>
        <span className="text-primary-foreground/80 text-sm">
          {group.winners.length} ganador{group.winners.length !== 1 ? 'es' : ''}
        </span>
      </div>
      
      {/* Winners */}
      <CardContent className="p-0">
        {group.winners.slice(0, maxWinners).map((winner, idx) => (
          <div 
            key={winner.id} 
            className={`px-4 py-3 flex items-center gap-3 ${
              idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'
            } ${idx < Math.min(group.winners.length, maxWinners) - 1 ? 'border-b border-border/30' : ''}`}
          >
            {/* Position Badge */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
              idx === 0 
                ? 'bg-yellow-500 text-yellow-950' 
                : idx === 1 
                  ? 'bg-gray-400 text-gray-900' 
                  : idx === 2 
                    ? 'bg-amber-600 text-amber-950' 
                    : 'bg-muted text-muted-foreground'
            }`}>
              {idx === 0 ? <Medal className="h-4 w-4" /> : idx + 1}
            </div>
            
            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{winner.playerName}</p>
              <p className="text-xs text-muted-foreground truncate">{winner.club}</p>
            </div>
            
            {/* Result */}
            {winner.result && (
              <span className="font-bold text-primary text-lg flex-shrink-0">
                {winner.result}
              </span>
            )}
          </div>
        ))}
        
        {group.winners.length === 0 && (
          <div className="px-4 py-6 text-center text-muted-foreground text-sm">
            Sin ganadores registrados
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryGroupCard;
