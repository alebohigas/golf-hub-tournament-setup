/**
 * AdminLiveScoring
 * Admin panel for configuring which categories appear on the Live Scoring page.
 * Each category has its own tipo (stroke/stableford) and gross setting.
 * Categories can be reordered via drag & drop; default order is categoryId ASC.
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Radio, Loader2, RefreshCw, GripVertical } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { apiFetch } from '@/lib/apiClient';
import { getCategoriesUrl } from '@/config/api';
import { useSiteConfig, useSaveSiteConfig, type LiveScoringEntry } from '@/hooks/useSiteConfig';
import { useToast } from '@/hooks/use-toast';

// ============= Types =============

/** Category from the categories API */
interface ApiCategory {
  categoryId: string;
  name: string;
  shortName?: string;
  system?: string;
  /** Gross flag from DB (categorias.gross) — 1 = supports gross scoring */
  gross?: number;
}

/**
 * Map a category's `sistema` string from the DB (e.g. "STROKE PLAY", "STABLEFORD")
 * into the Live Scoring `tipo` value used by the public /live page.
 * Defaults to 'stableford' when the system is unknown/empty (matches prior default).
 */
const mapSystemToTipo = (system?: string): 'stroke' | 'stableford' => {
  const s = (system || '').toUpperCase();
  if (s.includes('STROKE') || s.includes('MEDAL')) return 'stroke';
  return 'stableford';
};

// ============= Component =============

const AdminLiveScoring = () => {
  const { toast } = useToast();
  const { data: siteConfig } = useSiteConfig();
  const saveSiteConfig = useSaveSiteConfig();

  /** Ordered list of selected entries (order matters for display on /live) */
  const [orderedEntries, setOrderedEntries] = useState<LiveScoringEntry[]>([]);
  /** Set of selected categoryIds for quick lookup */
  const selectedIds = new Set(orderedEntries.map(e => e.categoryId));

  /** Fetch available categories from API */
  const { data: categories, isLoading: loadingCategories } = useQuery<ApiCategory[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const resp = await apiFetch<any>(getCategoriesUrl());

      const normalizeCategory = (raw: any): ApiCategory | null => {
        const categoryId = String(raw?.categoryId ?? raw?.id ?? raw?.categoria_id ?? '').trim();
        if (!categoryId) return null;
        return {
          categoryId,
          name: raw?.name ?? raw?.categoryName ?? raw?.categoria ?? categoryId,
          shortName: raw?.shortName ?? raw?.abreviatura ?? raw?.short_name,
          system: raw?.system ?? raw?.sistema,
          gross: Number(raw?.gross ?? 0) || 0,
        };
      };

      const categoriesMap = new Map<string, ApiCategory>();
      const sourceLists = Array.isArray(resp)
        ? [resp]
        : [resp?.strokePlay ?? [], resp?.matchPlay ?? []];

      sourceLists.forEach((list) => {
        list.forEach((raw: any) => {
          const normalized = normalizeCategory(raw);
          if (normalized) categoriesMap.set(normalized.categoryId, normalized);
        });
      });

      return Array.from(categoriesMap.values());
    },
  });

  /** Load saved config into ordered list */
  useEffect(() => {
    if (siteConfig?.live_scoring_config) {
      const sorted = [...siteConfig.live_scoring_config].sort(
        (a, b) => (a.order ?? Number(a.categoryId)) - (b.order ?? Number(b.categoryId))
      );
      setOrderedEntries(sorted);
    }
  }, [siteConfig?.live_scoring_config]);

  /** Toggle a category on/off */
  const toggleCategory = useCallback((cat: ApiCategory) => {
    setOrderedEntries(prev => {
      if (prev.some(e => e.categoryId === cat.categoryId)) {
        return prev.filter(e => e.categoryId !== cat.categoryId);
      }
      return [...prev, {
        categoryId: cat.categoryId,
        categoryName: cat.name,
        tipo: mapSystemToTipo(cat.system),
        gross: (cat.gross === 1 ? 1 : 0) as 0 | 1,
        enabled: true,
        order: prev.length,
      }];
    });
  }, []);

  /** Update tipo for a specific category */
  const setCategoryTipo = (categoryId: string, tipo: 'stroke' | 'stableford') => {
    setOrderedEntries(prev => prev.map(e =>
      e.categoryId === categoryId ? { ...e, tipo } : e
    ));
  };

  /** Update gross for a specific category */
  const setCategoryGross = (categoryId: string, gross: boolean) => {
    setOrderedEntries(prev => prev.map(e =>
      e.categoryId === categoryId ? { ...e, gross: gross ? 1 : 0 } : e
    ));
  };

  /** Select/deselect all */
  const toggleAll = (select: boolean) => {
    if (!categories) return;
    if (select) {
      const existing = new Map(orderedEntries.map(e => [e.categoryId, e]));
      const sorted = [...categories].sort((a, b) => Number(a.categoryId) - Number(b.categoryId));
      setOrderedEntries(sorted.map((cat, idx) => existing.get(cat.categoryId) || {
        categoryId: cat.categoryId,
        categoryName: cat.name,
        tipo: mapSystemToTipo(cat.system),
        gross: (cat.gross === 1 ? 1 : 0) as 0 | 1,
        enabled: true,
        order: idx,
      }));
    } else {
      setOrderedEntries([]);
    }
  };

  /** Handle drag & drop reorder */
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    setOrderedEntries(prev => {
      const next = [...prev];
      const [moved] = next.splice(result.source.index, 1);
      next.splice(result.destination!.index, 0, moved);
      return next.map((e, i) => ({ ...e, order: i }));
    });
  };

  /** Save config to server */
  const handleSave = () => {
    const withOrder = orderedEntries.map((e, i) => ({ ...e, order: i }));
    saveSiteConfig.mutate(
      { password: 'admin2025', live_scoring_config: withOrder.length > 0 ? withOrder : null },
      {
        onSuccess: () => {
          toast({ title: 'Live Scoring guardado', description: 'Configuración actualizada.' });
        },
        onError: (err) => {
          toast({ title: 'Error al guardar', description: err.message, variant: 'destructive' });
        },
      }
    );
  };

  const totalCount = categories?.length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-primary" />
          Configuración de Live Scoring
        </CardTitle>
        <CardDescription>
          Selecciona categorías, configura el tipo de scoring individual, y arrastra para reordenar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Loading */}
        {loadingCategories && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando categorías...
          </div>
        )}

        {/* Category selection */}
        {categories && categories.length > 0 && (
          <div className="space-y-4">
            {/* Header with select/deselect buttons */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Categorías ({orderedEntries.length}/{totalCount} seleccionadas)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toggleAll(true)}>
                  Seleccionar todas
                </Button>
                <Button variant="outline" size="sm" onClick={() => toggleAll(false)}>
                  Deseleccionar
                </Button>
              </div>
            </div>

            {/* Unselected categories as simple checkboxes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {categories
                .filter(cat => !selectedIds.has(cat.categoryId))
                .map(cat => (
                  <div
                    key={cat.categoryId}
                    className="flex items-center gap-2 p-2 rounded-lg border border-border hover:border-primary/30 cursor-pointer transition-colors"
                    onClick={() => toggleCategory(cat)}
                  >
                    <Checkbox checked={false} onCheckedChange={() => toggleCategory(cat)} onClick={e => e.stopPropagation()} />
                    <span className="text-sm">{cat.name}</span>
                  </div>
                ))
              }
            </div>

            {/* Selected categories - drag & drop reorderable */}
            {orderedEntries.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Orden de visualización (arrastra para reordenar)
                </p>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="live-categories">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1">
                        {orderedEntries.map((entry, index) => (
                          <Draggable key={entry.categoryId} draggableId={entry.categoryId} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`rounded-lg border transition-colors ${
                                  snapshot.isDragging
                                    ? 'border-primary shadow-lg bg-background'
                                    : 'border-primary/50 bg-primary/5'
                                }`}
                              >
                                {/* Row: grip + checkbox + name + settings */}
                                <div className="flex items-center gap-2 p-3">
                                  {/* Drag handle */}
                                  <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                                    <GripVertical className="h-4 w-4" />
                                  </div>

                                  {/* Checkbox to deselect */}
                                  <Checkbox
                                    checked={true}
                                    onCheckedChange={() => toggleCategory({ categoryId: entry.categoryId, name: entry.categoryName })}
                                    onClick={e => e.stopPropagation()}
                                  />

                                  {/* Category name */}
                                  <span className="text-sm font-medium flex-1">{entry.categoryName}</span>

                                  {/* Inline tipo selector */}
                                  <Select
                                    value={entry.tipo}
                                    onValueChange={(val) => setCategoryTipo(entry.categoryId, val as 'stroke' | 'stableford')}
                                  >
                                    <SelectTrigger className="w-[130px] h-7 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="stroke">Stroke Play</SelectItem>
                                      <SelectItem value="stableford">Stableford</SelectItem>
                                    </SelectContent>
                                  </Select>

                                  {/* Gross toggle */}
                                  <div className="flex items-center gap-1">
                                    <Switch
                                      checked={entry.gross === 1}
                                      onCheckedChange={(checked) => setCategoryGross(entry.categoryId, checked)}
                                    />
                                    <Badge variant={entry.gross === 1 ? 'default' : 'secondary'} className="text-[10px]">
                                      {entry.gross === 1 ? 'GROSS' : 'NETO'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            )}
          </div>
        )}

        {/* Save button */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} disabled={saveSiteConfig.isPending} className="gap-2">
            {saveSiteConfig.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Guardar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminLiveScoring;
