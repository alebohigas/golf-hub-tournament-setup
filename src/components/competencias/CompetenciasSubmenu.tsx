/**
 * CompetenciasSubmenu Component
 * Horizontal submenu for filtering competition types
 * Shows all enabled competition types as buttons
 */

import { Button } from '@/components/ui/button';
import { CompetenciaTipo } from '@/data/competenciasConfig';
import { Target, Trophy, Flag, Zap, Star, Award, Medal, Crosshair, Ruler } from 'lucide-react';

// ============= Icon Mapping =============

/** Map icon names to Lucide components */
const iconMap = {
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

// ============= Types =============

interface CompetenciasSubmenuProps {
  /** Available competition types */
  competencias: CompetenciaTipo[];
  /** Currently selected competition ID (null = show all) */
  selectedId: string | null;
  /** Callback when selection changes */
  onSelect: (id: string | null) => void;
  /** Whether the "Mejor Score del Día" view is currently active */
  mejorScoreActive?: boolean;
  /** Callback when the "Mejor Score del Día" button is pressed */
  onMejorScoreClick?: () => void;
  /** Whether the "Clasificados de Approach" view is currently active */
  approachActive?: boolean;
  /** Callback when the "Clasificados de Approach" button is pressed */
  onApproachClick?: () => void;
}

// ============= Component =============

/**
 * CompetenciasSubmenu
 * Renders a horizontal button group for filtering competitions
 */
const CompetenciasSubmenu = ({
  competencias,
  selectedId,
  onSelect,
  mejorScoreActive = false,
  onMejorScoreClick,
  approachActive = false,
  onApproachClick,
}: CompetenciasSubmenuProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {/* "All" button */}
      <Button
        variant={selectedId === null && !mejorScoreActive && !approachActive ? 'default' : 'outline'}
        onClick={() => onSelect(null)}
        className="gap-2"
      >
        Todos
      </Button>
      
      {/* Competition type buttons */}
      {competencias.map((comp) => {
        const IconComponent = iconMap[comp.icon];
        return (
          <Button
            key={comp.id}
            variant={selectedId === comp.id && !mejorScoreActive && !approachActive ? 'default' : 'outline'}
            onClick={() => onSelect(comp.id)}
            className="gap-2"
          >
            <IconComponent className="h-4 w-4" />
            {comp.shortName}
          </Button>
        );
      })}

      {/* Synthetic entry: Mejor Score del Día (only when handler provided) */}
      {onMejorScoreClick && (
        <Button
          variant={mejorScoreActive ? 'default' : 'outline'}
          onClick={onMejorScoreClick}
          className="gap-2"
        >
          <Medal className="h-4 w-4" />
          Mejor Score
        </Button>
      )}

      {/* Synthetic entry: Clasificados de Approach (only when handler provided) */}
      {onApproachClick && (
        <Button
          variant={approachActive ? 'default' : 'outline'}
          onClick={onApproachClick}
          className="gap-2"
        >
          <Crosshair className="h-4 w-4" />
          Clasificados Approach
        </Button>
      )}
    </div>
  );
};

export default CompetenciasSubmenu;
