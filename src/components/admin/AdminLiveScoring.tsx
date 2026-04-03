/**
 * AdminLiveScoring
 * Admin panel component for configuring which categories appear
 * on the Live Scoring page and their scoring type (stroke/stableford)
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Radio, Plus, Trash2, Loader2, RefreshCw } from 'lucide-react';
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

interface AdminLiveScoringProps {}

const AdminLiveScoring = ({}: AdminLiveScoringProps) => {
  const { toast } = useToast();
  const { data: siteConfig } = useSiteConfig();
  const saveSiteConfig = useSaveSiteConfig();

  /** Local state for the live scoring entries */
  const [entries, setEntries] = useState<LiveScoringEntry[]>([]);

  /** Fetch available categories from API */
  const { data: categories, isLoading: loadingCategories } = useQuery<ApiCategory[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const resp = await apiFetch<any>(getCategoriesUrl());
      const cats: ApiCategory[] = [];
      if (resp.strokePlay) {
        resp.strokePlay.forEach((c: any) => cats.push({
          categoryId: c.categoryId,
          name: c.name,
          shortName: c.shortName,
          system: c.system,
        }));
      }
      if (resp.matchPlay) {
        resp.matchPlay.forEach((c: any) => cats.push({
          categoryId: c.categoryId,
          name: c.name,
          shortName: c.shortName,
          system: c.system,
        }));
      }
      if (Array.isArray(resp)) {
        resp.forEach((c: any) => cats.push({
          categoryId: c.categoryId,
          name: c.name,
          shortName: c.shortName,
          system: c.system,
        }));
      }
      return cats;
    },
  });

  /** Load saved config into local state */
  useEffect(() => {
    if (siteConfig?.live_scoring_config) {
      setEntries(siteConfig.live_scoring_config);
    }
  }, [siteConfig?.live_scoring_config]);

  /** Add a new entry */
  const handleAdd = () => {
    if (!categories || categories.length === 0) return;
    // Pick first category not already in list
    const usedIds = new Set(entries.map(e => e.categoryId));
    const available = categories.find(c => !usedIds.has(c.categoryId));
    if (!available) {
      toast({ title: 'Todas las categorías ya están agregadas', variant: 'destructive' });
      return;
    }
    setEntries(prev => [...prev, {
      categoryId: available.categoryId,
      categoryName: available.name,
      tipo: (available.system?.toLowerCase().includes('stableford') ? 'stableford' : 'stroke') as 'stroke' | 'stableford',
      gross: 0,
      enabled: true,
    }]);
  };

  /** Remove an entry */
  const handleRemove = (idx: number) => {
    setEntries(prev => prev.filter((_, i) => i !== idx));
  };

  /** Update a field in an entry */
  const updateEntry = (idx: number, field: Partial<LiveScoringEntry>) => {
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, ...field } : e));
  };

  /** Save config to server */
  const handleSave = () => {
    saveSiteConfig.mutate(
      { password: 'admin2025', live_scoring_config: entries.length > 0 ? entries : null },
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-primary" />
          Configuración de Live Scoring
        </CardTitle>
        <CardDescription>
          Selecciona las categorías que se mostrarán en la página <strong>/live</strong> con sus resultados en tiempo real.
          Elige el tipo de scoring para cada una.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Loading categories */}
        {loadingCategories && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando categorías...
          </div>
        )}

        {/* Entries list */}
        {entries.map((entry, idx) => (
          <div key={idx} className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-border bg-card">
            {/* Category selector */}
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs text-muted-foreground mb-1 block">Categoría</Label>
              <Select
                value={entry.categoryId}
                onValueChange={(val) => {
                  const cat = categories?.find(c => c.categoryId === val);
                  updateEntry(idx, {
                    categoryId: val,
                    categoryName: cat?.name || val,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map(c => (
                    <SelectItem key={c.categoryId} value={c.categoryId}>
                      {c.name} {c.shortName ? `(${c.shortName})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo selector */}
            <div className="w-[150px]">
              <Label className="text-xs text-muted-foreground mb-1 block">Tipo</Label>
              <Select
                value={entry.tipo}
                onValueChange={(val) => updateEntry(idx, { tipo: val as 'stroke' | 'stableford' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stroke">Stroke Play</SelectItem>
                  <SelectItem value="stableford">Stableford</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Gross toggle */}
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Gross</Label>
              <Switch
                checked={entry.gross === 1}
                onCheckedChange={(checked) => updateEntry(idx, { gross: checked ? 1 : 0 })}
              />
            </div>

            {/* Enabled toggle */}
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Activo</Label>
              <Switch
                checked={entry.enabled}
                onCheckedChange={(checked) => updateEntry(idx, { enabled: checked })}
              />
              <Badge variant={entry.enabled ? 'default' : 'secondary'} className="text-xs">
                {entry.enabled ? 'ON' : 'OFF'}
              </Badge>
            </div>

            {/* Remove button */}
            <Button variant="ghost" size="icon" onClick={() => handleRemove(idx)} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {/* Add + Save buttons */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={handleAdd} disabled={loadingCategories} className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar Categoría
          </Button>
          <Button onClick={handleSave} disabled={saveSiteConfig.isPending} className="gap-2">
            {saveSiteConfig.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Guardar
          </Button>
        </div>

        {/* Empty state */}
        {entries.length === 0 && !loadingCategories && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay categorías configuradas para Live Scoring. Agrega una para comenzar.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminLiveScoring;
