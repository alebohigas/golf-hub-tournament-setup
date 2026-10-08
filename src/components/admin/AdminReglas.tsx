/**
 * AdminReglas
 * =============================================================================
 * Pestaña de Admin "REGLAS Y CC". Opera igual que "Convocatoria": lista de
 * secciones de la página pública /reglas con insignia BD/Vacío, interruptor
 * de visibilidad (persistido en `convocatoria_content.enabled`) y editor
 * desplegable por sección con Guardar / Limpiar.
 *
 * Todas las secciones viven en `convocatoria_content` (por torneoid) con los
 * mismos section_id que lee src/pages/Reglas.tsx.
 */

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Scale, Eye, EyeOff, ChevronDown, ChevronUp, Database, CircleSlash,
  AlertTriangle, Plus, Trash2, ArrowUp, ArrowDown, Save, Loader2, Eraser,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConvocatoriaContent } from '@/hooks/useConvocatoriaContent';
import { useToast } from '@/hooks/use-toast';

// ============= Section registry =============

/** Forma del contenido de cada sección (define el formulario). */
type Shape = 'cards' | 'accordion' | 'pdf_label' | 'oficial' | 'visibility';

/** Definición de una sección editable de Reglas y CC. */
interface ReglasSectionDef {
  id: string;
  label: string;
  icon: string;
  shape: Shape;
  sectionType: string;
}

/** Secciones en el mismo orden en que aparecen en la página pública. */
const REGLAS_SECTIONS: ReglasSectionDef[] = [
  { id: 'reglas_intro_cards', label: 'Tarjetas de introducción', icon: '📘', shape: 'cards',     sectionType: 'cards' },
  { id: 'reglas_locales',     label: 'Reglas locales del torneo', icon: '⚖️', shape: 'accordion', sectionType: 'accordion' },
  // Solo visibilidad: la tabla la alimenta la BD (torneos.valorstable), aquí solo se muestra/oculta.
  { id: 'reglas_stableford',  label: 'Puntaje Stableford (tabla de puntos)', icon: '🔢', shape: 'visibility', sectionType: 'visibility' },
  { id: 'reglamento_local',   label: 'Reglamento / Términos de la competencia', icon: '📜', shape: 'accordion', sectionType: 'accordion' },
  { id: 'codigo_conducta',    label: 'Código de conducta', icon: '🤝', shape: 'accordion', sectionType: 'accordion' },
  { id: 'reglas_pdf_label',   label: 'Texto del botón PDF', icon: '📄', shape: 'pdf_label', sectionType: 'pdf_label' },
  { id: 'reglas_oficial',     label: 'Oficial de reglas (contacto)', icon: '📞', shape: 'oficial',   sectionType: 'oficial' },
];

/** Iconos disponibles para las tarjetas de introducción (ver Reglas.tsx). */
const CARD_ICONS = ['BookOpen', 'Scale', 'Clock', 'AlertTriangle', 'Gavel', 'ScrollText'];

/** Contenido vacío por forma, usado en secciones sin fila en BD. */
const emptyFor = (shape: Shape): any =>
  shape === 'cards' || shape === 'accordion' ? []
  : shape === 'pdf_label' ? { label: '' }
  : { heading: '', name: '', phone: '' };

/** True cuando la fila de BD tiene contenido utilizable. */
const hasUsableContent = (c: any) => {
  if (c == null) return false;
  if (Array.isArray(c)) return c.length > 0;
  if (typeof c === 'object') return Object.values(c).some(v => String(v ?? '').trim() !== '');
  return String(c).trim() !== '';
};

// ============= Main component =============

const AdminReglas = () => {
  const { bySectionId, saveSection } = useConvocatoriaContent();
  const [expanded, setExpanded] = useState<string | null>(null);

  /** Visibilidad efectiva: BD manda; sin fila se considera visible. */
  const isEnabled = (id: string) => bySectionId.get(id)?.enabled ?? true;

  /** Persiste el interruptor de visibilidad conservando el contenido. */
  const toggle = async (def: ReglasSectionDef, idx: number, enabled: boolean) => {
    const row = bySectionId.get(def.id);
    await saveSection({
      sectionId: def.id,
      sectionType: row?.section_type ?? def.sectionType,
      title: row?.title ?? def.label,
      content: row?.content ?? emptyFor(def.shape),
      sortOrder: row?.sort_order ?? idx + 1,
      enabled,
    });
  };

  const enabledCount = REGLAS_SECTIONS.filter(s => isEnabled(s.id)).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Secciones de Reglas y CC
        </CardTitle>
        <CardDescription>
          Activa/desactiva y edita el contenido de cada sección de la página de
          Reglas del torneo activo. Si una sección está vacía en BD no se
          muestra en la página pública. Los desempates se editan en Convocatoria.
        </CardDescription>
        <div className="flex gap-3 mt-2">
          <Badge variant="default" className="gap-1"><Eye className="h-3 w-3" />{enabledCount} visibles</Badge>
          <Badge variant="secondary" className="gap-1"><EyeOff className="h-3 w-3" />{REGLAS_SECTIONS.length - enabledCount} ocultas</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {REGLAS_SECTIONS.map((def, idx) => {
          const enabled = isEnabled(def.id);
          const open = expanded === def.id;
          const filled = hasUsableContent(bySectionId.get(def.id)?.content);
          return (
            <div
              key={def.id}
              className={cn('rounded-lg border transition-all',
                enabled ? 'border-border bg-card' : 'border-border/50 bg-muted/30 opacity-70')}
            >
              <Collapsible open={open} onOpenChange={o => setExpanded(o ? def.id : null)}>
                {/* Fila de la sección */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xl">{def.icon}</span>
                  <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                    <span className={cn('font-medium text-sm', !enabled && 'text-muted-foreground line-through')}>
                      {def.label}
                    </span>
                    {filled ? (
                      <Badge variant="outline" className="text-xs gap-1 text-primary border-primary/40 bg-primary/10">
                        <Database className="h-3 w-3" />BD
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs gap-1 text-muted-foreground">
                        <CircleSlash className="h-3 w-3" />Vacío
                      </Badge>
                    )}
                    {!enabled && (
                      <Badge variant="outline" className="text-xs gap-1 text-destructive border-destructive/40">
                        <AlertTriangle className="h-3 w-3" />Oculta
                      </Badge>
                    )}
                  </div>
                  <Switch checked={enabled} onCheckedChange={c => toggle(def, idx, c)} />
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="px-4 pb-4 border-t pt-4">
                    {open && <ReglasSectionEditor def={def} sortOrder={idx + 1} />}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

// ============= Section editor =============

/**
 * ReglasSectionEditor
 * Formulario de una sección: mantiene un borrador local hidratado desde BD,
 * y guarda (upsert) o limpia (delete) la fila del torneo activo.
 */
const ReglasSectionEditor = ({ def, sortOrder }: { def: ReglasSectionDef; sortOrder: number }) => {
  const { bySectionId, saveSection, clearSection } = useConvocatoriaContent();
  const { toast } = useToast();
  const row = bySectionId.get(def.id);

  /** Borrador inicial: contenido de BD si coincide con la forma esperada. */
  const initial = useMemo(() => {
    const c = row?.content as any;
    const empty = emptyFor(def.shape);
    if (Array.isArray(empty)) return Array.isArray(c) ? JSON.parse(JSON.stringify(c)) : [];
    return c && typeof c === 'object' && !Array.isArray(c) ? { ...empty, ...c } : empty;
  }, [row?.content, def.shape]);

  const [draft, setDraft] = useState<any>(initial);
  useEffect(() => setDraft(initial), [initial]);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);

  /** Guarda el borrador en convocatoria_content. */
  const onSave = async () => {
    setSaving(true);
    const ok = await saveSection({
      sectionId: def.id,
      sectionType: def.sectionType,
      title: row?.title ?? def.label,
      content: draft,
      sortOrder: row?.sort_order ?? sortOrder,
      enabled: row?.enabled ?? true,
    });
    setSaving(false);
    toast(ok
      ? { title: 'Sección guardada', description: def.label }
      : { title: 'Error al guardar', description: def.label, variant: 'destructive' });
  };

  /** Elimina la fila de BD (la sección queda Vacía y se oculta). */
  const onClear = async () => {
    if (!confirm(`¿Limpiar "${def.label}"? Se eliminará el contenido de este torneo.`)) return;
    setClearing(true);
    const ok = await clearSection(def.id);
    setClearing(false);
    toast(ok
      ? { title: 'Sección limpiada', description: def.label }
      : { title: 'Error al limpiar', description: def.label, variant: 'destructive' });
  };

  return (
    <div className="space-y-4">
      {def.shape === 'cards' && <ItemsForm items={draft} onChange={setDraft} kind="cards" />}
      {def.shape === 'accordion' && <ItemsForm items={draft} onChange={setDraft} kind="accordion" />}
      {def.shape === 'pdf_label' && (
        <div className="space-y-1">
          <label className="text-xs font-medium">Texto del botón</label>
          <Input
            value={draft.label ?? ''}
            placeholder="Ver Reglas y T. de Competencia (PDF)"
            onChange={e => setDraft({ ...draft, label: e.target.value })}
          />
        </div>
      )}
      {def.shape === 'oficial' && (
        <div className="grid gap-3 sm:grid-cols-3">
          {([['heading', 'Encabezado'], ['name', 'Nombre'], ['phone', 'Teléfono']] as const).map(([k, l]) => (
            <div key={k} className="space-y-1">
              <label className="text-xs font-medium">{l}</label>
              <Input value={draft[k] ?? ''} onChange={e => setDraft({ ...draft, [k]: e.target.value })} />
            </div>
          ))}
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-2 justify-end flex-wrap">
        <Button variant="outline" size="sm" onClick={onClear} disabled={clearing || !row} className="gap-2">
          {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eraser className="h-4 w-4" />}Limpiar
        </Button>
        <Button size="sm" onClick={onSave} disabled={saving || !dirty} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Guardar
        </Button>
      </div>
    </div>
  );
};

// ============= Items repeater =============

/**
 * ItemsForm
 * Editor de listas: tarjetas ({icon,title,body}) o acordeón ({titulo,contenido}).
 * Permite agregar, eliminar y mover renglones.
 */
const ItemsForm = ({ items, onChange, kind }: {
  items: any[];
  onChange: (v: any[]) => void;
  kind: 'cards' | 'accordion';
}) => {
  const titleKey = kind === 'cards' ? 'title' : 'titulo';
  const bodyKey = kind === 'cards' ? 'body' : 'contenido';

  const update = (i: number, patch: any) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => onChange([...items, kind === 'cards'
    ? { icon: 'BookOpen', title: '', body: '' }
    : { titulo: '', contenido: '' }]);

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">Sin elementos. Pulsa “Agregar”.</p>
      )}
      {items.map((it, i) => (
        <div key={i} className="rounded-md border p-3 space-y-2 bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground w-6">{i + 1}</span>
            {kind === 'cards' && (
              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={it.icon ?? 'BookOpen'}
                onChange={e => update(i, { icon: e.target.value })}
              >
                {CARD_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
              </select>
            )}
            <Input
              placeholder="Título"
              value={it[titleKey] ?? ''}
              onChange={e => update(i, { [titleKey]: e.target.value })}
            />
            <Button variant="ghost" size="icon" onClick={() => move(i, -1)} aria-label="Subir"><ArrowUp className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => move(i, 1)} aria-label="Bajar"><ArrowDown className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Eliminar">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
          <Textarea
            rows={4}
            placeholder="Contenido"
            value={it[bodyKey] ?? ''}
            onChange={e => update(i, { [bodyKey]: e.target.value })}
          />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="gap-2"><Plus className="h-4 w-4" />Agregar</Button>
    </div>
  );
};

export default AdminReglas;
