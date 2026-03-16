/**
 * AdminMenuOrder Component
 * Drag-and-drop interface to reorder menu items in the navigation
 * Uses @hello-pangea/dnd for drag-and-drop functionality
 */

import { useState, useEffect } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import { GripVertical, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { MenuItem } from '@/data/mockData';

// ============= Types =============

interface AdminMenuOrderProps {
  /** All menu items */
  menuItems: MenuItem[];
  /** Current visibility settings */
  visibilitySettings: Record<string, boolean>;
  /** Custom order overrides (pageId → order number) */
  menuItemOrder: Record<string, number>;
  /** Callback when order changes */
  onOrderChange: (order: Record<string, number>) => void;
  /** Group assignments for display */
  pageGroupAssignments: Record<string, string>;
  /** Groups for label lookup */
  menuGroups: { id: string; name: string }[];
}

// ============= Component =============

const AdminMenuOrder = ({
  menuItems,
  visibilitySettings,
  menuItemOrder,
  onOrderChange,
  pageGroupAssignments,
  menuGroups,
}: AdminMenuOrderProps) => {
  /**
   * Build sorted list of items using custom order or default order
   */
  const getSortedItems = (): MenuItem[] => {
    return [...menuItems].sort((a, b) => {
      const orderA = menuItemOrder[a.id] ?? a.order;
      const orderB = menuItemOrder[b.id] ?? b.order;
      return orderA - orderB;
    });
  };

  const [items, setItems] = useState<MenuItem[]>(getSortedItems);

  /** Sync when menuItemOrder changes externally */
  useEffect(() => {
    setItems(getSortedItems());
  }, [menuItemOrder, menuItems]);

  /**
   * Handle drag end - recalculate order numbers
   */
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    setItems(reordered);

    // Build new order map (1-indexed)
    const newOrder: Record<string, number> = {};
    reordered.forEach((item, index) => {
      newOrder[item.id] = index + 1;
    });
    onOrderChange(newOrder);
  };

  /**
   * Reset to default order from menuConfig
   */
  const handleReset = () => {
    onOrderChange({});
  };

  /**
   * Get group name for a page
   */
  const getGroupName = (pageId: string): string | undefined => {
    const groupId = pageGroupAssignments[pageId];
    if (!groupId) return undefined;
    return menuGroups.find(g => g.id === groupId)?.name;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GripVertical className="h-5 w-5 text-primary" />
              Orden del Menú
            </CardTitle>
            <CardDescription>
              Arrastra los elementos para cambiar el orden en que aparecen en la navegación.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="h-4 w-4" />
            Restablecer
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="menu-order">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  "space-y-1 rounded-lg transition-colors",
                  snapshot.isDraggingOver && "bg-accent/30"
                )}
              >
                {items.map((item, index) => {
                  const isVisible = visibilitySettings[item.id] ?? true;
                  const groupName = getGroupName(item.id);

                  return (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border transition-all",
                            "bg-card hover:bg-accent/10",
                            snapshot.isDragging && "shadow-lg ring-2 ring-primary/30 bg-card",
                            !isVisible && "opacity-50"
                          )}
                        >
                          {/* Drag handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                          >
                            <GripVertical className="h-5 w-5" />
                          </div>

                          {/* Order number */}
                          <span className="text-xs font-mono text-muted-foreground w-6 text-center">
                            {index + 1}
                          </span>

                          {/* Item label */}
                          <span className="font-medium flex-1">{item.label}</span>

                          {/* Group badge */}
                          {groupName && (
                            <Badge variant="secondary" className="text-xs">
                              {groupName}
                            </Badge>
                          )}

                          {/* Visibility indicator */}
                          {isVisible ? (
                            <Eye className="h-4 w-4 text-primary" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  );
};

export default AdminMenuOrder;
