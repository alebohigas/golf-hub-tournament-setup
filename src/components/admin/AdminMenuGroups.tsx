/**
 * AdminMenuGroups Component
 * Manage menu groups and assign pages to groups
 */

import { useState } from 'react';
import { Plus, Trash2, GripVertical, FolderOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { MenuItem } from '@/data/mockData';

// ============= Types =============

export interface MenuGroup {
  id: string;
  name: string;
  order: number;
  pageIds: string[];
}

interface AdminMenuGroupsProps {
  /** All available menu items */
  menuItems: MenuItem[];
  /** Current group configuration */
  groups: MenuGroup[];
  /** Callback when groups are updated */
  onGroupsChange: (groups: MenuGroup[]) => void;
  /** Page assignments to groups */
  pageGroupAssignments: Record<string, string>;
  /** Callback when page assignment changes */
  onPageGroupChange: (pageId: string, groupId: string | null) => void;
}

// ============= Component =============

/**
 * AdminMenuGroups
 * Interface for creating and managing menu groups
 */
const AdminMenuGroups = ({
  menuItems,
  groups,
  onGroupsChange,
  pageGroupAssignments,
  onPageGroupChange,
}: AdminMenuGroupsProps) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  /**
   * Add a new group
   */
  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;

    const newGroup: MenuGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName.trim(),
      order: groups.length + 1,
      pageIds: [],
    };

    onGroupsChange([...groups, newGroup]);
    setNewGroupName('');
  };

  /**
   * Delete a group
   */
  const handleDeleteGroup = (groupId: string) => {
    // Remove group and unassign all pages from it
    const updatedGroups = groups.filter(g => g.id !== groupId);
    onGroupsChange(updatedGroups);

    // Unassign pages from deleted group
    Object.entries(pageGroupAssignments).forEach(([pageId, assignedGroupId]) => {
      if (assignedGroupId === groupId) {
        onPageGroupChange(pageId, null);
      }
    });
  };

  /**
   * Rename a group
   */
  const handleRenameGroup = (groupId: string, newName: string) => {
    const updatedGroups = groups.map(g =>
      g.id === groupId ? { ...g, name: newName } : g
    );
    onGroupsChange(updatedGroups);
  };

  /**
   * Get pages in a specific group
   */
  const getPagesInGroup = (groupId: string) => {
    return menuItems.filter(item => pageGroupAssignments[item.id] === groupId);
  };

  /**
   * Get unassigned pages
   */
  const getUnassignedPages = () => {
    return menuItems.filter(item => !pageGroupAssignments[item.id]);
  };

  return (
    <div className="space-y-6">
      {/* Create new group */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Crear Nuevo Grupo</CardTitle>
          <CardDescription>
            Los grupos permiten organizar las páginas en submenús desplegables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Nombre del grupo (ej: Información, Resultados)"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
            />
            <Button onClick={handleAddGroup} disabled={!newGroupName.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              Crear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing groups */}
      {groups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Grupos Existentes</CardTitle>
            <CardDescription>
              Expande cada grupo para ver y gestionar sus páginas asignadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {groups.map((group) => {
              const pagesInGroup = getPagesInGroup(group.id);
              const isExpanded = expandedGroup === group.id;

              return (
                <Collapsible
                  key={group.id}
                  open={isExpanded}
                  onOpenChange={(open) => setExpandedGroup(open ? group.id : null)}
                >
                  <div className="rounded-lg border border-border overflow-hidden">
                    {/* Group header */}
                    <div className="flex items-center gap-2 p-3 bg-muted/50">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <FolderOpen className="h-4 w-4 text-primary" />
                      <Input
                        value={group.name}
                        onChange={(e) => handleRenameGroup(group.id, e.target.value)}
                        className="h-8 flex-1 bg-background"
                      />
                      <Badge variant="secondary">{pagesInGroup.length} páginas</Badge>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteGroup(group.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Group content - pages */}
                    <CollapsibleContent>
                      <div className="p-3 space-y-2 bg-background">
                        {pagesInGroup.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            No hay páginas asignadas a este grupo
                          </p>
                        ) : (
                          pagesInGroup.map((page) => (
                            <div
                              key={page.id}
                              className="flex items-center justify-between p-2 rounded bg-muted/30"
                            >
                              <span className="text-sm">{page.label}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => onPageGroupChange(page.id, null)}
                              >
                                Quitar del grupo
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Page assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Asignar Páginas a Grupos</CardTitle>
          <CardDescription>
            Selecciona un grupo para cada página. Las páginas sin grupo aparecerán directamente en el menú principal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.path}</p>
                </div>
                <Select
                  value={pageGroupAssignments[item.id] || 'none'}
                  onValueChange={(value) => 
                    onPageGroupChange(item.id, value === 'none' ? null : value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sin grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin grupo</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMenuGroups;
