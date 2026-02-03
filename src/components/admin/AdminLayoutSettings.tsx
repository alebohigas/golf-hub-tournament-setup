/**
 * AdminLayoutSettings Component
 * Controls for admin panel layout configuration
 */

import { LayoutGrid, List, Columns2, Columns3, Columns4 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ============= Types =============

export type LayoutMode = 'grid' | 'list';
export type ColumnCount = 2 | 3 | 4;

interface AdminLayoutSettingsProps {
  /** Current layout mode */
  layout: LayoutMode;
  /** Callback when layout changes */
  onLayoutChange: (layout: LayoutMode) => void;
  /** Number of columns in grid mode */
  columns: ColumnCount;
  /** Callback when columns change */
  onColumnsChange: (columns: ColumnCount) => void;
}

// ============= Column Options =============

const columnOptions: { value: ColumnCount; icon: typeof Columns2; label: string }[] = [
  { value: 2, icon: Columns2, label: '2 columnas' },
  { value: 3, icon: Columns3, label: '3 columnas' },
  { value: 4, icon: Columns4, label: '4 columnas' },
];

// ============= Component =============

/**
 * AdminLayoutSettings
 * Toggle between grid/list view and column count
 */
const AdminLayoutSettings = ({
  layout,
  onLayoutChange,
  columns,
  onColumnsChange,
}: AdminLayoutSettingsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
      {/* Layout mode toggle */}
      <div className="flex items-center gap-2">
        <Label className="text-sm text-muted-foreground">Vista:</Label>
        <div className="flex rounded-md border border-border overflow-hidden">
          <Button
            variant={layout === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onLayoutChange('grid')}
            className={cn(
              "rounded-none gap-1.5",
              layout === 'grid' && "pointer-events-none"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Grid</span>
          </Button>
          <Button
            variant={layout === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onLayoutChange('list')}
            className={cn(
              "rounded-none gap-1.5",
              layout === 'list' && "pointer-events-none"
            )}
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Lista</span>
          </Button>
        </div>
      </div>

      {/* Column count - only shown in grid mode */}
      {layout === 'grid' && (
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Columnas:</Label>
          <div className="flex rounded-md border border-border overflow-hidden">
            {columnOptions.map((option) => (
              <Button
                key={option.value}
                variant={columns === option.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onColumnsChange(option.value)}
                className={cn(
                  "rounded-none gap-1.5",
                  columns === option.value && "pointer-events-none"
                )}
                title={option.label}
              >
                <option.icon className="h-4 w-4" />
                <span className="hidden lg:inline">{option.value}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayoutSettings;
