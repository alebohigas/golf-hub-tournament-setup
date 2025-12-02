import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CategoryGroup } from '@/data/competicionData';
import { Medal } from 'lucide-react';

interface CategoryDetailModalProps {
  group: CategoryGroup | null;
  competitionName: string;
  isOpen: boolean;
  onClose: () => void;
}

const CategoryDetailModal = ({ group, competitionName, isOpen, onClose }: CategoryDetailModalProps) => {
  if (!group) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {competitionName} - {group.name}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-1">
            {group.winners.slice(0, 20).map((winner, idx) => (
              <div 
                key={winner.id} 
                className={`px-4 py-3 flex items-center gap-3 rounded-lg ${
                  idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                }`}
              >
                {/* Position Badge */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
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
                  <p className="font-medium text-foreground">{winner.playerName}</p>
                  <p className="text-sm text-muted-foreground">{winner.club}</p>
                </div>
                
                {/* Result */}
                {winner.result && (
                  <span className="font-bold text-primary text-lg flex-shrink-0">
                    {winner.result}
                  </span>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDetailModal;
