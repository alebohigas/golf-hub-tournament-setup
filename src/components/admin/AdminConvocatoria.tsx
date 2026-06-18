/**
 * AdminConvocatoria
 * Admin panel tab for managing convocatoria sections
 * Supports: reordering (drag-and-drop), enable/disable, content editing
 */

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GripVertical,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertTriangle,
  Database,
  CircleSlash,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConvocatoriaSections } from '@/hooks/useConvocatoriaSections';
import { useConvocatoriaContent } from '@/hooks/useConvocatoriaContent';
import SectionEditor from '@/components/admin/convocatoria/SectionEditor';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// ============= Section icons by ID =============

const sectionIcons: Record<string, string> = {
  descripcion: '📝',
  elegibilidad: '✅',
  costos: '💰',
  categorias: '🏷️',
  premiacion: '🏆',
  calendario: '📅',
  reglas: '⚖️',
  competencias: '⚡',
};

// ============= Component =============

const AdminConvocatoria = () => {
  const {
    sections,
    setSectionEnabled,
    reorderSections,
  } = useConvocatoriaSections();
  /** DB-backed status per section (drives the BD / Vacío badge). */
  const { hasContent } = useConvocatoriaContent();

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  /** Handle drag end for reordering */
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    reorderSections(items.map((s) => s.id));
  };

  const enabledCount = sections.filter((s) => s.enabled).length;
  const disabledCount = sections.length - enabledCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Secciones de Convocatoria
        </CardTitle>
        <CardDescription>
          Arrastra para reordenar, activa/desactiva secciones y edita el contenido.
          Las secciones deshabilitadas no se muestran en la página. El
          contenido es estrictamente DB-only: si una sección está vacía en BD,
          NO se muestra en la página pública (no hay fallback a mocks).
        </CardDescription>
        <div className="flex gap-3 mt-2">
          <Badge variant="default" className="gap-1">
            <Eye className="h-3 w-3" />
            {enabledCount} visibles
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <EyeOff className="h-3 w-3" />
            {disabledCount} ocultas
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="convocatoria-sections">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {sections.map((section, index) => (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          'rounded-lg border transition-all',
                          snapshot.isDragging
                            ? 'shadow-lg border-primary bg-primary/5'
                            : section.enabled
                              ? 'border-border bg-card'
                              : 'border-border/50 bg-muted/30 opacity-70'
                        )}
                      >
                        {/* Section row */}
                        <div className="flex items-center gap-3 px-4 py-3">
                          {/* Drag handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                          >
                            <GripVertical className="h-5 w-5" />
                          </div>

                          {/* Icon */}
                          <span className="text-xl">{sectionIcons[section.id] || '📄'}</span>

                          {/* Label and status */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                'font-medium text-sm',
                                !section.enabled && 'text-muted-foreground line-through'
                              )}>
                                {section.label}
                              </span>
                              {/* BD / Vacío badge: green when a non-empty
                                  convocatoria_content row exists for the
                                  active torneoid; grey otherwise. */}
                              {hasContent(section.id) ? (
                                <Badge variant="outline" className="text-xs gap-1 text-emerald-700 border-emerald-300 bg-emerald-50">
                                  <Database className="h-3 w-3" />
                                  BD
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs gap-1 text-muted-foreground">
                                  <CircleSlash className="h-3 w-3" />
                                  Vacío
                                </Badge>
                              )}
                              {!section.enabled && (
                                <Badge variant="outline" className="text-xs gap-1 text-amber-600 border-amber-300">
                                  <AlertTriangle className="h-3 w-3" />
                                  Oculta
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Toggle enable/disable */}
                          <Switch
                            checked={section.enabled}
                            onCheckedChange={(checked) => setSectionEnabled(section.id, checked)}
                          />

                          {/* Expand/collapse for content editing */}
                          <Collapsible
                            open={expandedSection === section.id}
                            onOpenChange={(open) =>
                              setExpandedSection(open ? section.id : null)
                            }
                          >
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                {expandedSection === section.id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </Collapsible>
                        </div>

                        {/* Expandable structured editor with live preview.
                            Renders the proper editor for the section shape
                            (text / items repeater / JSON fallback) plus a
                            preview that uses the SAME public Section
                            component for visual fidelity. */}
                        {expandedSection === section.id && (
                          <div className="px-4 pb-4 border-t border-border/50 pt-3">
                            <SectionEditor
                              sectionId={section.id}
                              label={section.label}
                              sortOrder={section.order}
                            />
                            {!section.enabled && (
                              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Sección oculta - no se mostrará en la página aunque tenga contenido
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  );
};

export default AdminConvocatoria;
