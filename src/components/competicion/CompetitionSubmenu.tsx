import { Button } from '@/components/ui/button';
import { Competition } from '@/data/competicionData';
import { Target, Trophy, Flag, Zap, Star, Award, Medal, Ruler, Crosshair } from 'lucide-react';

/** Map of icon keys to Lucide icon components */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  target: Target,
  trophy: Trophy,
  flag: Flag,
  zap: Zap,
  star: Star,
  award: Award,
  medal: Medal,
  ruler: Ruler,
  crosshair: Crosshair,
};

interface CompetitionSubmenuProps {
  competitions: Competition[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const CompetitionSubmenu = ({ competitions, selectedId, onSelect }: CompetitionSubmenuProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      <Button
        variant={selectedId === null ? 'default' : 'outline'}
        onClick={() => onSelect(null)}
        className="gap-2"
      >
        Todos
      </Button>
      {competitions.map((comp) => {
        /** Resolve icon from map, fallback to Trophy if not found */
        const IconComponent = iconMap[comp.icon as keyof typeof iconMap] || Trophy;
        return (
          <Button
            key={comp.id}
            variant={selectedId === comp.id ? 'default' : 'outline'}
            onClick={() => onSelect(comp.id)}
            className="gap-2"
          >
            <IconComponent className="h-4 w-4" />
            {comp.shortName}
          </Button>
        );
      })}
    </div>
  );
};

export default CompetitionSubmenu;
