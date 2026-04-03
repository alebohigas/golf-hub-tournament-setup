/**
 * AdminLiveScoring
 * Admin panel component for configuring which categories appear
 * on the Live Scoring page and their scoring type (stroke/stableford)
 * Uses checkbox list for easy multi-select of categories
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Radio, Loader2, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
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
}

// ============= Component =============

const AdminLiveScoring = () => {
  const { toast } = useToast();
  const { data: siteConfig } = useSiteConfig();
  const saveSiteConfig = useSaveSiteConfig();

  /** Local state for the live scoring entries keyed by categoryId */
  const [entries, setEntries] = useState<Map<string, LiveScoringEntry>>(new Map());

  /** Global scoring type applied to all selected categories */
  const [globalTipo, setGlobalTipo] = useState<'stroke' | 'stableford'>('stroke');
  /** Global gross toggle */
  const [globalGross, setGlobalGross] = useState(false);

  /** Fetch available categories from API */
  const { data: categories, isLoading: loadingCategories } = useQuery<ApiCategory[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const resp = await apiFetch<any>(getCategoriesUrl());

      /** Normalize category shape because categories.php returns `id`, not always `categoryId` */
      const normalizeCategory = (raw: any): ApiCategory | null => {
        const categoryId = String(raw?.categoryId ?? raw?.id ?? raw?.categoria_id ?? '').trim();
        if (!categoryId) return null;

        return {
          categoryId,
          name: raw?.name ?? raw?.categoryName ?? raw?.categoria ?? categoryId,
          shortName: raw?.shortName ?? raw?.abreviatura ?? raw?.short_name,
          system: raw?.system ?? raw?.sistema,
        };
      };

      /** Collect and dedupe categories by stable ID */
      const categoriesMap = new Map<string, ApiCategory>();
      const sourceLists = Array.isArray(resp)
        ? [resp]
        : [resp?.strokePlay ?? [], resp?.matchPlay ?? []];

      sourceLists.forEach((list) => {
        list.forEach((raw: any) => {
          const normalized = normalizeCategory(raw);
          if (normalized) {
            categoriesMap.set(normalized.categoryId, normalized);
          }
        });
      });

      return Array.from(categoriesMap.values());
    },
  });

  /** Load saved config into local state */
  useEffect(() => {
    if (siteConfig?.live_scoring_config) {
      const map = new Map<string, LiveScoringEntry>();
      siteConfig.live_scoring_config.forEach(e => map.set(e.categoryId, e));
      setEntries(map);
      // Infer global settings from first entry
      const first = siteConfig.live_scoring_config[0];
      if (first) {
        setGlobalTipo(first.tipo);
        setGlobalGross(first.gross === 1);
      }
    }
  }, [siteConfig?.live_scoring_config]);

  /** Toggle a category on/off */
  const toggleCategory = (cat: ApiCategory) => {
    setEntries(prev => {
      const next = new Map(prev);
      if (next.has(cat.categoryId)) {
        next.delete(cat.categoryId);
      } else {
        next.set(cat.categoryId, {
          categoryId: cat.categoryId,
          categoryName: cat.name,
          tipo: globalTipo,
          gross: globalGross ? 1 : 0,
          enabled: true,
        });
      }
      return next;
    });
  };

  /** Select/deselect all */
  const toggleAll = (select: boolean) => {
    if (!categories) return;
    if (select) {
      const next = new Map<string, LiveScoringEntry>();
      categories.forEach(cat => {
        next.set(cat.categoryId, entries.get(cat.categoryId) || {
          categoryId: cat.categoryId,
          categoryName: cat.name,
          tipo: globalTipo,
          gross: globalGross ? 1 : 0,
          enabled: true,
        });
      });
      setEntries(next);
    } else {
      setEntries(new Map());
    }
  };

  /** Apply global tipo/gross to all selected entries */
  const applyGlobalSettings = () => {
    setEntries(prev => {
      const next = new Map(prev);
      next.forEach((entry, key) => {
        next.set(key, { ...entry, tipo: globalTipo, gross: globalGross ? 1 : 0 });
      });
      return next;
    });
  };

  /** Save config to server */
  const handleSave = () => {
    // Apply global settings before saving
    const entriesArray = Array.from(entries.values()).map(e => ({
      ...e,
      tipo: globalTipo,
      gross: globalGross ? 1 : 0 as 0 | 1,
    }));

    saveSiteConfig.mutate(
      { password: 'admin2025', live_scoring_config: entriesArray.length > 0 ? entriesArray : null },
      {
        onSuccess: () => {
          toast({ title: 'Live Scoring guardado', description: 'Configuración actualizada para todos los visitantes.' });
        },
        onError: (err) => {
          toast({ title: 'Error al guardar', description: err.message, variant: 'destructive' });
        },
      }
    );
  };

  const selectedCount = entries.size;
  const totalCount = categories?.length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-primary" />
          Configuración de Live Scoring
        </CardTitle>
        <CardDescription>
          Selecciona las categorías que se mostrarán en la página <strong>/live</strong> con resultados en tiempo real.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Global settings */}
        <div className="flex flex-wrap items-end gap-4 p-4 rounded-lg border border-border bg-muted/30">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Tipo de scoring</Label>
            <Select value={globalTipo} onValueChange={(val) => setGlobalTipo(val as 'stroke' | 'stableford')}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stroke">Stroke Play</SelectItem>
                <SelectItem value="stableford">Stableford</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Gross</Label>
            <Switch checked={globalGross} onCheckedChange={setGlobalGross} />
            <Badge variant={globalGross ? 'default' : 'secondary'} className="text-xs">
              {globalGross ? 'GROSS' : 'NETO'}
            </Badge>
          </div>
        </div>

        {/* Loading categories */}
        {loadingCategories && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando categorías...
          </div>
        )}

        {/* Category checkboxes */}
        {categories && categories.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Categorías ({selectedCount}/{totalCount} seleccionadas)
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map(cat => {
                const isSelected = entries.has(cat.categoryId);
                return (
                  <div
                    key={cat.categoryId}
                    onClick={() => toggleCategory(cat)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleCategory(cat)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-sm font-medium">{cat.name}</span>
                    {cat.shortName && (
                      <Badge variant="secondary" className="text-xs ml-auto">
                        {cat.shortName}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
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
