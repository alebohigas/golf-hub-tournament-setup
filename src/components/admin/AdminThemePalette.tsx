/**
 * AdminThemePalette
 * Admin UI for picking the active color palette for the current tournament
 * (persisted per-domain via site_config.theme_config). Offers 6 presets and
 * a custom builder backed by native color pickers.
 */

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Check, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useSiteConfig, useSaveSiteConfig } from '@/hooks/useSiteConfig';
import type { ThemeConfig } from '@/hooks/useSiteConfig';
import {
  PALETTE_PRESETS,
  applyThemeConfig,
  hexToHslString,
  hslStringToHex,
  loadCustomPresets,
  saveCustomPreset,
  deleteCustomPreset,
  type CustomPalettePreset,
} from '@/lib/theme-palettes';

/** Small color swatch rendered from an HSL string. */
const Swatch = ({ hsl, size = 'md' }: { hsl: string; size?: 'sm' | 'md' | 'lg' }) => (
  <div
    className={cn(
      'rounded-md border border-border shadow-sm',
      size === 'sm' && 'h-5 w-5',
      size === 'md' && 'h-8 w-8',
      size === 'lg' && 'h-12 w-12',
    )}
    style={{ backgroundColor: `hsl(${hsl})` }}
  />
);

/** Default custom palette (matches the project's original tokens). */
const DEFAULT_CUSTOM: ThemeConfig = {
  name: 'Personalizada',
  primary: '150 40% 22%',
  secondary: '42 60% 55%',
  accent: '42 70% 50%',
  background: '0 0% 100%',
};

const AdminThemePalette = () => {
  const { data: siteConfig, isLoading } = useSiteConfig();
  const saveSiteConfig = useSaveSiteConfig();
  const { toast } = useToast();

  /** Currently saved palette, or null if domain has not chosen one. */
  const saved = siteConfig?.theme_config ?? null;

  /** Local editor state for the "Crear nueva paleta" builder. */
  const [custom, setCustom] = useState<ThemeConfig>(saved ?? DEFAULT_CUSTOM);
  const [showCustom, setShowCustom] = useState(false);

  /** User-saved custom palettes library (persisted in localStorage). */
  const [customPresets, setCustomPresets] = useState<CustomPalettePreset[]>(() => loadCustomPresets());

  // Keep editor state synced if the server response arrives after mount.
  useEffect(() => {
    if (saved) setCustom(saved);
  }, [saved]);

  /** Identify if the saved palette matches one of the presets. */
  const activePresetId = useMemo(() => {
    if (!saved) return null;
    const all = [...PALETTE_PRESETS, ...customPresets];
    const match = all.find(p =>
      p.primary === saved.primary &&
      p.secondary === saved.secondary &&
      p.accent === saved.accent &&
      p.background === saved.background,
    );
    return match?.id ?? null;
  }, [saved, customPresets]);

  /** Persist a palette to site_config and live-preview it immediately. */
  const persist = (theme: ThemeConfig) => {
    applyThemeConfig(theme);
    saveSiteConfig.mutate(
      { password: 'admin2025', theme_config: theme },
      {
        onSuccess: () => {
          toast({
            title: 'Paleta guardada',
            description: `"${theme.name}" se aplicó para todos los visitantes de este dominio.`,
          });
        },
        onError: (err) => {
          toast({
            title: 'Error al guardar paleta',
            description: err.message,
            variant: 'destructive',
          });
        },
      },
    );
  };

  /** Update one channel of the custom palette from a hex color input. */
  const updateCustomColor = (key: keyof Omit<ThemeConfig, 'name'>, hex: string) => {
    const hsl = hexToHslString(hex);
    if (!hsl) return;
    const next = { ...custom, [key]: hsl };
    setCustom(next);
    applyThemeConfig(next); // live preview while editing
  };

  /**
   * Save the current custom palette into the local preset library AND
   * apply it as the active palette for the domain. Triggered by the
   * "Agregar a página y guardar preset" button.
   */
  const saveAndApplyCustom = () => {
    if (!custom.name.trim()) return;
    const updated = saveCustomPreset(custom);
    setCustomPresets(updated);
    persist(custom);
  };

  /** Remove a custom preset from the saved library. */
  const removeCustomPreset = (id: string, name: string) => {
    setCustomPresets(deleteCustomPreset(id));
    toast({
      title: 'Preset eliminado',
      description: `"${name}" se quitó de tu biblioteca de paletas.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Paleta de Colores
        </CardTitle>
        <CardDescription>
          Elige una de las 6 paletas predefinidas o crea una personalizada.
          La paleta seleccionada se aplica a <strong>todos los visitantes</strong>
          {' '}de este dominio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando configuración...
          </div>
        ) : (
          <>
            {/* Preset grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PALETTE_PRESETS.map(preset => {
                const isActive = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => persist({
                      name: preset.name,
                      primary: preset.primary,
                      secondary: preset.secondary,
                      accent: preset.accent,
                      background: preset.background,
                    })}
                    disabled={saveSiteConfig.isPending}
                    className={cn(
                      'group text-left rounded-lg border-2 p-3 transition-all',
                      'hover:border-primary hover:shadow-md',
                      isActive
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border bg-card',
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{preset.name}</span>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                          <Check className="h-3 w-3" /> Activa
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5 mb-2">
                      <Swatch hsl={preset.primary} size="md" />
                      <Swatch hsl={preset.secondary} size="md" />
                      <Swatch hsl={preset.accent} size="md" />
                      <Swatch hsl={preset.background} size="md" />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Custom (user-saved) presets — rendered as a separate group */}
            {customPresets.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Sparkles className="h-3 w-3" />
                  Mis paletas guardadas
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {customPresets.map(preset => {
                    const isActive = activePresetId === preset.id;
                    return (
                      <div
                        key={preset.id}
                        className={cn(
                          'relative rounded-lg border-2 p-3 transition-all',
                          isActive
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border bg-card hover:border-primary hover:shadow-md',
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => persist({
                            name: preset.name,
                            primary: preset.primary,
                            secondary: preset.secondary,
                            accent: preset.accent,
                            background: preset.background,
                          })}
                          disabled={saveSiteConfig.isPending}
                          className="w-full text-left"
                        >
                          <div className="flex items-center justify-between mb-2 pr-7">
                            <span className="font-semibold text-sm truncate">{preset.name}</span>
                            {isActive && (
                              <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                                <Check className="h-3 w-3" /> Activa
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1.5 mb-2">
                            <Swatch hsl={preset.primary} size="md" />
                            <Swatch hsl={preset.secondary} size="md" />
                            <Swatch hsl={preset.accent} size="md" />
                            <Swatch hsl={preset.background} size="md" />
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {preset.description}
                          </p>
                        </button>
                        {/* Delete preset button (top-right corner) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCustomPreset(preset.id, preset.name);
                          }}
                          className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          aria-label={`Eliminar preset ${preset.name}`}
                          title="Eliminar preset"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom builder toggle */}
            <div className="pt-2 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setShowCustom(v => !v)}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {showCustom ? 'Ocultar' : 'Crear nueva paleta de colores'}
              </Button>
            </div>

            {/* Custom palette builder */}
            {showCustom && (
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="palette-name">Nombre de la paleta</Label>
                  <Input
                    id="palette-name"
                    value={custom.name}
                    onChange={(e) => setCustom({ ...custom, name: e.target.value })}
                    placeholder="Mi paleta personalizada"
                    className="max-w-xs"
                  />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {(['primary', 'secondary', 'accent', 'background'] as const).map((key) => {
                    const labels = {
                      primary: 'Color primario',
                      secondary: 'Color secundario',
                      accent: 'Color de acento',
                      background: 'Fondo de página',
                    };
                    const hex = hslStringToHex(custom[key]);
                    return (
                      <div key={key} className="space-y-2">
                        <Label className="text-xs">{labels[key]}</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={hex}
                            onChange={(e) => updateCustomColor(key, e.target.value)}
                            className="h-12 w-12 rounded-md border border-border cursor-pointer bg-transparent p-0"
                            aria-label={labels[key]}
                          />
                          <div className="text-xs font-mono text-muted-foreground">
                            {hex.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={saveAndApplyCustom}
                    disabled={saveSiteConfig.isPending || !custom.name.trim()}
                    className="gap-2"
                  >
                    {saveSiteConfig.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Agregar a página y guardar preset
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      // Revert live-preview back to saved palette
                      applyThemeConfig(saved);
                      setCustom(saved ?? DEFAULT_CUSTOM);
                    }}
                  >
                    Cancelar cambios
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Los cambios se previsualizan en vivo. Al guardar, la paleta se aplica
                  al sitio y se agrega con su nombre a "Mis paletas guardadas" para
                  reutilizarla en cualquier momento.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminThemePalette;