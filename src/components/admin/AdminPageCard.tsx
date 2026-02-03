/**
 * AdminPageCard Component
 * Individual card for toggling page visibility with notes support
 * Supports compact grid and list layouts
 */

import { useState } from 'react';
import { Eye, EyeOff, ChevronDown, ChevronUp, StickyNote } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

// ============= Types =============

interface AdminPageCardProps {
  /** Unique page identifier */
  pageId: string;
  /** Display label for the page */
  label: string;
  /** URL path for the page */
  path: string;
  /** Whether the page is currently visible */
  isVisible: boolean;
  /** Callback when visibility is toggled */
  onToggle: (visible: boolean) => void;
  /** Current note for this page */
  note?: string;
  /** Callback when note is updated */
  onNoteChange: (note: string) => void;
  /** Layout mode: 'grid' or 'list' */
  layout: 'grid' | 'list';
  /** Group name if assigned */
  groupName?: string;
}

// ============= Component =============

/**
 * AdminPageCard
 * Displays a page with visibility toggle and expandable notes
 */
const AdminPageCard = ({
  pageId,
  label,
  path,
  isVisible,
  onToggle,
  note = '',
  onNoteChange,
  layout,
  groupName,
}: AdminPageCardProps) => {
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const hasNote = note.trim().length > 0;

  // Grid layout - compact card
  if (layout === 'grid') {
    return (
      <div
        className={cn(
          "flex flex-col p-3 rounded-lg border transition-colors h-full",
          isVisible
            ? "bg-card border-border"
            : "bg-muted/50 border-muted"
        )}
      >
        {/* Header with toggle */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {isVisible ? (
              <Eye className="h-4 w-4 text-primary shrink-0" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span className={cn(
              "text-sm font-medium truncate",
              !isVisible && "text-muted-foreground"
            )}>
              {label}
            </span>
          </div>
          <Switch
            checked={isVisible}
            onCheckedChange={onToggle}
            aria-label={`Toggle visibility for ${label}`}
            className="shrink-0"
          />
        </div>

        {/* Path and group */}
        <p className="text-xs text-muted-foreground truncate mb-2">{path}</p>
        
        {groupName && (
          <Badge variant="outline" className="text-xs w-fit mb-2">
            {groupName}
          </Badge>
        )}

        {/* Note toggle */}
        <Collapsible open={isNoteOpen} onOpenChange={setIsNoteOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-between text-xs h-7 mt-auto",
                hasNote && "text-primary"
              )}
            >
              <span className="flex items-center gap-1">
                <StickyNote className="h-3 w-3" />
                {hasNote ? 'Ver nota' : 'Añadir nota'}
              </span>
              {isNoteOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <Textarea
              placeholder="Escribe una nota para esta página..."
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              className="text-xs min-h-[60px] resize-none"
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // List layout - horizontal row
  return (
    <div
      className={cn(
        "flex flex-col p-4 rounded-lg border transition-colors",
        isVisible
          ? "bg-card border-border"
          : "bg-muted/50 border-muted"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isVisible ? (
            <Eye className="h-5 w-5 text-primary shrink-0" />
          ) : (
            <EyeOff className="h-5 w-5 text-muted-foreground shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p className={cn(
              "font-medium",
              !isVisible && "text-muted-foreground"
            )}>
              {label}
            </p>
            <p className="text-sm text-muted-foreground">{path}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {groupName && (
            <Badge variant="outline" className="hidden sm:flex">
              {groupName}
            </Badge>
          )}
          <Badge variant={isVisible ? "default" : "secondary"}>
            {isVisible ? "Visible" : "Oculto"}
          </Badge>
          <Switch
            checked={isVisible}
            onCheckedChange={onToggle}
            aria-label={`Toggle visibility for ${label}`}
          />
        </div>
      </div>

      {/* Note section - always visible in list mode */}
      <div className="mt-3 pt-3 border-t border-border/50">
        <Textarea
          placeholder="Añadir nota para esta página..."
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          className="text-sm min-h-[50px] resize-none"
        />
      </div>
    </div>
  );
};

export default AdminPageCard;
