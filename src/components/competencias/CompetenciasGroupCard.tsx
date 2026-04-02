/**
 * CompetenciasGroupCard Component
 * Card displaying a competition group with player count
 * Clickable to view group details
 */

import { Card, CardContent } from '@/components/ui/card';
import { Users, MapPin } from 'lucide-react';
import { CompetenciaGroup } from '@/data/competenciasConfig';

// ============= Types =============

interface CompetenciasGroupCardProps {
  /** Group data */
  group: CompetenciaGroup;
  /** Click handler */
  onClick: () => void;
}

// ============= Component =============

/**
 * CompetenciasGroupCard
 * Displays a clickable card for a competition group
 */
const CompetenciasGroupCard = ({ group, onClick }: CompetenciasGroupCardProps) => {
  /** Use playerCount from API, fallback to players array length if available */
  const playerCount = group.playerCount ?? group.players?.length ?? 0;
  
  return (
    <Card 
      className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-5">
        {/* Group name */}
        <h3 className="font-bold text-foreground text-lg mb-3 group-hover:text-primary transition-colors">
          {group.name}
        </h3>
        
        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {/* Player count */}
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{playerCount} jugadores</span>
          </div>
          
          {/* Hole number if available */}
          {group.hoyo && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>Hoyo {group.hoyo}</span>
            </div>
          )}
        </div>
        
        {/* Last updated */}
        {group.lastUpdated && (
          <p className="text-xs text-muted-foreground mt-2">
            Actualizado: {group.lastUpdated}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CompetenciasGroupCard;
