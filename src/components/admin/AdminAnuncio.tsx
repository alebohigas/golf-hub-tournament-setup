/**
 * AdminAnuncio
 * -----------------------------------------------------------------------
 * Admin tab that manages the site-wide scrolling announcement ribbon
 * rendered between the header and the sponsor ribbon on every page.
 *
 * Persists to `site_config.anuncio_config`. Read globally by
 * <AnnouncementRibbon /> mounted inside <Layout />.
 */
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Loader2,
  CheckCircle2,
  Megaphone,
  Bold,
  Italic,
  Type as TypeIcon,
} from 'lucide-react';
import {
  useSiteConfig,
  useSaveSiteConfig,
  type AnuncioConfig,
} from '@/hooks/useSiteConfig';
import { useToast } from '@/hooks/use-toast';
import { getSuperAdminPassword } from '@/lib/superAdminAuth';

/** Sensible defaults when no config has been saved yet. */
const DEFAULT_ANUNCIO: AnuncioConfig = {
  enabled: false,
  text: '',
  bgColor: '#111827',
  textColor: '#ffffff',
  fontFamily: 'sans',
  fontSize: 16,
  bold: true,
  italic: false,
  speedSeconds: 30,
};

/**
 * Maps preset → CSS stack for the live preview (must mirror the runtime
 * mapping in AnnouncementRibbon).
 */
const PREVIEW_FONT: Record<string, string> = {
  sans: 'ui-sans-serif, system-ui, sans-serif',
  serif: 'ui-serif, Georgia, serif',
  mono: 'ui-monospace, SFMono-Regular, monospace',
  display: '"Playfair Display", Georgia, serif',
};

/**
 * AdminAnuncio — form + live preview for the scrolling announcement ribbon.
 */
const AdminAnuncio = () => {
  const { toast } = useToast();
  const { data: siteConfig, isLoading } = useSiteConfig();
  const saveSiteConfig = useSaveSiteConfig();
  const [config, setConfig] = useState<AnuncioConfig>(DEFAULT_ANUNCIO);

  // Hydrate from server whenever the fetched config changes.
  useEffect(() => {
    if (siteConfig?.anuncio_config) {
      setConfig({ ...DEFAULT_ANUNCIO, ...siteConfig.anuncio_config });
    }
  }, [siteConfig?.anuncio_config]);

  /** Persist the current config to the server. */
  const handleSave = () => {
    if (config.enabled && !config.text.trim()) {
      toast({
        title: 'Falta texto',
        description: 'Escribe el mensaje del anuncio antes de activarlo.',
        variant: 'destructive',
      });
      return;
    }
    saveSiteConfig.mutate(
      { password: getSuperAdminPassword(), anuncio_config: config },
      {
        onSuccess: () =>
          toast({
            title: 'Anuncio guardado',
            description: 'La tira se aplicó a todos los visitantes.',
          }),
        onError: (err) =>
          toast({
            title: 'Error al guardar',
            description: err.message,
            variant: 'destructive',
          }),
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* ===== Live preview ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Vista previa
          </CardTitle>
          <CardDescription>
            Así se verá la tira en la parte superior del sitio (arriba del
            ribbon de patrocinadores).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="w-full overflow-hidden border-y border-border rounded"
            style={{ backgroundColor: config.bgColor }}
          >
            <div
              className="sponsor-scroll flex whitespace-nowrap py-2"
              style={{ animationDuration: `${Math.max(5, config.speedSeconds)}s` }}
            >
              {[0, 1].map((i) => (
                <span
                  key={i}
                  className="px-4"
                  style={{
                    color: config.textColor,
                    fontFamily: PREVIEW_FONT[config.fontFamily],
                    fontSize: `${config.fontSize}px`,
                    fontWeight: config.bold ? 700 : 500,
                    fontStyle: config.italic ? 'italic' : 'normal',
                    letterSpacing: '0.02em',
                  }}
                >
                  {(config.text || 'Escribe el mensaje del anuncio...')
                    .concat('\u00A0\u00A0\u00A0•\u00A0\u00A0\u00A0')
                    .repeat(6)}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== Config form ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TypeIcon className="h-5 w-5 text-primary" />
            Configuración del anuncio
          </CardTitle>
          <CardDescription>
            Activa, edita el texto, y ajusta colores y tipografía. Se muestra
            en todas las páginas del torneo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master switch */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label className="text-base">Activar tira de anuncios</Label>
              <p className="text-xs text-muted-foreground">
                Cuando esté apagada, no aparece en ninguna página.
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(v) => setConfig((c) => ({ ...c, enabled: v }))}
            />
          </div>

          {/* Text */}
          <div className="space-y-2">
            <Label htmlFor="anuncio-text">Texto del anuncio</Label>
            <Textarea
              id="anuncio-text"
              value={config.text}
              onChange={(e) => setConfig((c) => ({ ...c, text: e.target.value }))}
              placeholder="Ej: Inscripciones abiertas hasta el 20 de julio. ¡Cupo limitado!"
              rows={3}
            />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="anuncio-bg">Color de fondo</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="anuncio-bg"
                  type="color"
                  value={config.bgColor}
                  onChange={(e) => setConfig((c) => ({ ...c, bgColor: e.target.value }))}
                  className="h-10 w-16 p-1"
                />
                <Input
                  type="text"
                  value={config.bgColor}
                  onChange={(e) => setConfig((c) => ({ ...c, bgColor: e.target.value }))}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="anuncio-fg">Color del texto</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="anuncio-fg"
                  type="color"
                  value={config.textColor}
                  onChange={(e) => setConfig((c) => ({ ...c, textColor: e.target.value }))}
                  className="h-10 w-16 p-1"
                />
                <Input
                  type="text"
                  value={config.textColor}
                  onChange={(e) => setConfig((c) => ({ ...c, textColor: e.target.value }))}
                  className="font-mono"
                />
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fuente</Label>
              <Select
                value={config.fontFamily}
                onValueChange={(v) =>
                  setConfig((c) => ({ ...c, fontFamily: v as AnuncioConfig['fontFamily'] }))
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sans">Sans-serif (moderna)</SelectItem>
                  <SelectItem value="serif">Serif (clásica)</SelectItem>
                  <SelectItem value="mono">Monoespaciada</SelectItem>
                  <SelectItem value="display">Display (Playfair)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estilo</Label>
              <ToggleGroup
                type="multiple"
                value={[
                  ...(config.bold ? ['bold'] : []),
                  ...(config.italic ? ['italic'] : []),
                ]}
                onValueChange={(vals) =>
                  setConfig((c) => ({
                    ...c,
                    bold: vals.includes('bold'),
                    italic: vals.includes('italic'),
                  }))
                }
                className="justify-start"
              >
                <ToggleGroupItem value="bold" aria-label="Negrita">
                  <Bold className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="italic" aria-label="Cursiva">
                  <Italic className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* Font size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Tamaño de letra</Label>
              <span className="text-sm font-mono text-muted-foreground">{config.fontSize}px</span>
            </div>
            <Slider
              min={10}
              max={48}
              step={1}
              value={[config.fontSize]}
              onValueChange={([v]) => setConfig((c) => ({ ...c, fontSize: v }))}
            />
          </div>

          {/* Speed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Velocidad (menor = más rápido)</Label>
              <span className="text-sm font-mono text-muted-foreground">
                {config.speedSeconds}s por vuelta
              </span>
            </div>
            <Slider
              min={10}
              max={120}
              step={5}
              value={[config.speedSeconds]}
              onValueChange={([v]) => setConfig((c) => ({ ...c, speedSeconds: v }))}
            />
          </div>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saveSiteConfig.isPending || isLoading}
            className="gap-2"
          >
            {saveSiteConfig.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Guardar anuncio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnuncio;
