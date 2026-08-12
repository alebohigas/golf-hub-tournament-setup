/**
 * SectionEditor
 * --------------------------------------------------------------
 * Two-column editor for a single Convocatoria section:
 *   - LEFT: structured form (per-section schema). For simple text
 *     sections we use textareas/inputs; for items-based sections we
 *     render a repeater. For complex/uncommon shapes (costos,
 *     desempates) we fall back to a JSON editor with live validation.
 *   - RIGHT: live preview using the SAME public Section component
 *     fed by the draft state, so the editor matches the public look.
 *
 * The editor never reads or writes mock data. All persistence goes
 * through `useConvocatoriaContent.saveSection` /  `clearSection`.
 */

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Save, Trash2, Plus, X, RotateCcw, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useConvocatoriaContent, type ConvocatoriaContentRow } from '@/hooks/useConvocatoriaContent';

// Live-preview Section components (reuse the public ones so the
// admin preview is pixel-identical to what users will see).
import DescripcionSection from '@/components/convocatoria/DescripcionSection';
import ElegibilidadSection from '@/components/convocatoria/ElegibilidadSection';
import PremiacionSection from '@/components/convocatoria/PremiacionSection';
import ReglasSection from '@/components/convocatoria/ReglasSection';
import CompetenciasEspecialesSection from '@/components/convocatoria/CompetenciasEspecialesSection';
import ServiciosSection from '@/components/convocatoria/ServiciosSection';
import PatrocinadoresOficialesSection from '@/components/convocatoria/PatrocinadoresOficialesSection';
import CostosSection from '@/components/convocatoria/CostosSection';
import DesempatesSection from '@/components/convocatoria/DesempatesSection';

// ============= Types =============

interface SectionEditorProps {
  /** Section ID matching `convocatoria_content.section_id`. */
  sectionId: string;
  /** Human label for headings/toasts. */
  label: string;
  /** Display order to persist back to the DB (0 by default). */
  sortOrder?: number;
}

/**
 * Section-type registry: maps each known sectionId to:
 *  - sectionType: persisted in `convocatoria_content.section_type`
 *  - shape:       which form layout to render
 *  - empty:       a safe empty payload for new rows
 *  - preview:     renderer used in the right-hand column
 */
type Shape =
  | 'text'              // single string under c.text
  | 'elegibilidad'      // { eligibilityText, notesText[], inscripcionesText }
  | 'items_premio'      // { items: [{ categoria, premios[] }] }
  | 'items_regla'       // { items: [{ titulo, contenido }] }
  | 'items_competencia' // { items: [{ nombre, descripcion, premios? }] }
  | 'items_servicio'    // { items: [{ dia, items: [{ servicio, horario }] }] }
  | 'items_patrocinador'// { items: [{ premio, patrocinador, descripcion }] }
  | 'json';             // fallback raw JSON editor (costos, desempates, …)

interface ShapeMeta {
  sectionType: string;
  shape: Shape;
  empty: any;
}

const SHAPES: Record<string, ShapeMeta> = {
  descripcion:              { sectionType: 'text',         shape: 'text',               empty: { text: '' } },
  elegibilidad:             { sectionType: 'elegibilidad', shape: 'elegibilidad',       empty: { eligibilityText: '', notesText: [], inscripcionesText: '' } },
  costos:                   { sectionType: 'costos',       shape: 'json',               empty: { sociosPricing: [], foraneosPricing: [], pricingNote: '', contactInfo: { bankName: '', clabe: '', cuenta: '', nombre: '', email: '', telefono: '', telefonoDirecto: '' }, contactWarning: '', inscripcionesText: '' } },
  premiacion:               { sectionType: 'premiacion',   shape: 'items_premio',       empty: { items: [] } },
  desempates:               { sectionType: 'desempates',   shape: 'json',               empty: { intro: '', paraCorte: [], paraTrofeos: [], showCorte: true, showTrofeos: true } },
  reglas:                   { sectionType: 'reglas',       shape: 'items_regla',        empty: { items: [] } },
  competencias:             { sectionType: 'competencias', shape: 'items_competencia',  empty: { items: [] } },
  servicios:                { sectionType: 'servicios',    shape: 'items_servicio',     empty: { items: [] } },
  patrocinadoresOficiales:  { sectionType: 'patrocinadores', shape: 'items_patrocinador', empty: { items: [] } },
};

// ============= Helpers =============

/** Deep clone via JSON (sections are plain JSON). */
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

/** True when two values are structurally equal (JSON compare). */
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

// ============= Component =============

const SectionEditor = ({ sectionId, label, sortOrder = 0 }: SectionEditorProps) => {
  const { bySectionId, saveSection, clearSection } = useConvocatoriaContent();
  const { toast } = useToast();

  const meta = SHAPES[sectionId];
  const row: ConvocatoriaContentRow | undefined = bySectionId.get(sectionId);

  // ----- Draft state -----
  // Initialize from DB row (or empty template). Re-hydrate when the
  // underlying row changes (e.g. after a successful save).
  const initial = useMemo(() => {
    if (!meta) return {};
    const dbContent = row?.content as any;
    return dbContent && typeof dbContent === 'object'
      ? { ...meta.empty, ...dbContent }
      : clone(meta.empty);
  }, [meta, row?.content]);

  const [draft, setDraft] = useState<any>(initial);
  useEffect(() => { setDraft(initial); }, [initial]);

  // JSON editor mirror (kept in sync with draft when shape === 'json')
  const [jsonText, setJsonText] = useState<string>(() => JSON.stringify(initial, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  useEffect(() => { setJsonText(JSON.stringify(initial, null, 2)); setJsonError(null); }, [initial]);

  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  if (!meta) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4 text-sm text-muted-foreground">
          Esta sección (<code>{sectionId}</code>) se administra desde otra
          pestaña (datos derivados de la API) y no tiene editor manual.
        </CardContent>
      </Card>
    );
  }

  const dirty = !eq(draft, initial);

  // ----- Save / Clear -----

  const handleSave = async () => {
    setSaving(true);
    // If we're in JSON mode, re-parse from text to ensure latest edits.
    let payload = draft;
    if (meta.shape === 'json') {
      try {
        payload = JSON.parse(jsonText);
        setJsonError(null);
      } catch (e: any) {
        setJsonError(e.message);
        setSaving(false);
        toast({ title: 'JSON inválido', description: e.message, variant: 'destructive' });
        return;
      }
    }
    const ok = await saveSection({
      sectionId,
      sectionType: meta.sectionType,
      title: label,
      content: payload,
      sortOrder,
      enabled: true,
    });
    setSaving(false);
    toast(ok
      ? { title: 'Sección guardada', description: label }
      : { title: 'Error al guardar', variant: 'destructive' });
  };

  const handleClear = async () => {
    if (!confirm(`Eliminar el contenido en BD para "${label}"? La sección dejará de mostrarse en la página pública.`)) return;
    setClearing(true);
    const ok = await clearSection(sectionId);
    setClearing(false);
    toast(ok
      ? { title: 'Sección vaciada', description: 'Ya no se muestra en la página pública.' }
      : { title: 'Error al limpiar', variant: 'destructive' });
  };

  const handleReset = () => setDraft(clone(initial));

  // ----- Preview -----
  const preview = renderPreview(sectionId, draft);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs">
          {dirty && <Badge variant="outline" className="border-amber-400 text-amber-600">Cambios sin guardar</Badge>}
          {row && <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">BD</Badge>}
          {!row && <Badge variant="outline" className="text-muted-foreground">Vacío</Badge>}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={handleReset} disabled={!dirty}>
            <RotateCcw className="h-4 w-4 mr-1" />Descartar
          </Button>
          <Button size="sm" variant="outline" onClick={handleClear} disabled={!row || clearing} className="text-destructive">
            {clearing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
            Limpiar BD
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Guardar
          </Button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* FORM */}
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Editor</div>
          {/* Desempate: interruptores de publicación de cada bloque. */}
          {sectionId === 'desempates' && (
            <DesempatesToggles draft={draft} setDraft={setDraft} jsonText={jsonText} setJsonText={setJsonText} />
          )}
          {/* Costos: carga rápida de las tablas SOCIOS / INVITADOS. */}
          {sectionId === 'costos' && (
            <CostosQuickFill draft={draft} setDraft={setDraft} setJsonText={setJsonText} setJsonError={setJsonError} />
          )}
          <ShapeForm
            shape={meta.shape}
            draft={draft}
            setDraft={setDraft}
            jsonText={jsonText}
            setJsonText={setJsonText}
            jsonError={jsonError}
            setJsonError={setJsonError}
          />
        </div>
        {/* PREVIEW */}
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Vista previa</div>
          <div className="border rounded-lg p-4 bg-background overflow-auto max-h-[600px]">
            {preview ?? (
              <p className="text-sm text-muted-foreground italic">
                Sin contenido — la sección no se mostrará en la página pública.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionEditor;

// ============= Desempates visibility toggles =============

/**
 * DesempatesToggles
 * Two switches that control whether "Para el Corte" and "Para Trofeos"
 * are published on /convocatoria. They write `showCorte` / `showTrofeos`
 * into the section payload and keep the JSON editor text in sync so the
 * save (which re-parses the JSON) preserves the values.
 */
function DesempatesToggles({
  draft, setDraft, jsonText, setJsonText,
}: {
  draft: any;
  setDraft: (d: any) => void;
  jsonText: string;
  setJsonText: (s: string) => void;
}) {
  /** Apply a flag to both the draft object and the JSON mirror. */
  const setFlag = (key: 'showCorte' | 'showTrofeos', value: boolean) => {
    let base: any = draft;
    try { base = JSON.parse(jsonText); } catch { /* keep draft if JSON is mid-edit */ }
    const next = { ...base, [key]: value };
    setDraft(next);
    setJsonText(JSON.stringify(next, null, 2));
  };

  const showCorte = draft?.showCorte !== false;
  const showTrofeos = draft?.showTrofeos !== false;

  return (
    <div className="rounded-lg border p-3 space-y-3 bg-muted/30">
      <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
        Publicación en /convocatoria
      </div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="sw-corte" className="text-sm">Mostrar “Para el Corte”</label>
        <Switch id="sw-corte" checked={showCorte} onCheckedChange={(v) => setFlag('showCorte', v)} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="sw-trofeos" className="text-sm">Mostrar “Para Trofeos”</label>
        <Switch id="sw-trofeos" checked={showTrofeos} onCheckedChange={(v) => setFlag('showTrofeos', v)} />
      </div>
      <p className="text-xs text-muted-foreground">
        Apagar un bloque lo oculta en la página pública sin borrar sus criterios.
      </p>
    </div>
  );
}

// ============= Preview router =============

/**
 * MONEY_INPUT_RE
 * Formatos aceptados en los campos de importe: dígitos con separadores de
 * miles opcionales, decimales opcionales y símbolo `$` opcional.
 * Ej: `13550`, `13,550`, `$13,550.00`, `8000.5`
 */
const MONEY_INPUT_RE = /^\$?\s*\d{1,3}(,\d{3})*(\.\d{1,2})?$|^\$?\s*\d+(\.\d{1,2})?$/;

/**
 * parseMoney
 * Convierte un texto de importe a número. Devuelve `null` si no es válido.
 */
function parseMoney(raw: string): number | null {
  const s = (raw ?? '').trim();
  if (!s) return null;
  if (!MONEY_INPUT_RE.test(s)) return null;
  const n = Number(s.replace(/[$,\s]/g, ''));
  return Number.isFinite(n) ? n : null;
}

/**
 * formatMoney
 * Normaliza un importe a moneda MXN con separador de miles y 2 decimales
 * (`13550` → `$13,550.00`). Devuelve el texto original si no es válido.
 */
function formatMoney(raw: string): string {
  const n = parseMoney(raw);
  if (n === null) return raw;
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * MoneyField
 * Input de importe con formateo automático a moneda al salir del campo y
 * mensaje de error inline cuando el valor es inválido o requerido.
 */
function MoneyField({
  label, value, onChange, required, error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string | null;
}) {
  return (
    <div className="space-y-1">
      <Input
        placeholder={label}
        value={value}
        aria-label={label}
        aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => onChange(formatMoney(value))}
        className={cn(error && 'border-destructive focus-visible:ring-destructive')}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/**
 * CostosQuickFill
 * Botón de carga rápida para la sección "costos": captura los importes de
 * SOCIOS e INVITADOS (Caballeros / Damas y Juveniles) y los escribe en el
 * JSON de la sección con la estructura que espera `CostosSection`
 * (`sociosPricing[].tiers[]`), para que la tabla se vea llena en la página.
 * Valida que SOCIOS no quede vacío y que todo importe capturado tenga
 * formato de moneda válido antes de permitir la carga.
 */
function CostosQuickFill(props: {
  draft: any;
  setDraft: (d: any) => void;
  setJsonText: (s: string) => void;
  setJsonError: (s: string | null) => void;
}) {
  const { draft, setDraft, setJsonText, setJsonError } = props;

  /** Lee el importe actual de una tabla/categoría, si ya existe en el draft. */
  const readCosto = (title: string, categoria: string) => {
    const t = (draft?.sociosPricing ?? []).find((x: any) => x?.title === title);
    const tier = (t?.tiers ?? []).find((r: any) => r?.categoria === categoria);
    return tier?.costo ?? '';
  };

  const [socCab, setSocCab] = useState(() => readCosto('SOCIOS', 'Caballeros') || '$13,550.00');
  const [socDam, setSocDam] = useState(() => readCosto('SOCIOS', 'Damas y Juveniles') || '$8,000.00');
  const [invCab, setInvCab] = useState(() => readCosto('INVITADOS', 'Caballeros') || '');
  const [invDam, setInvDam] = useState(() => readCosto('INVITADOS', 'Damas y Juveniles') || '');

  /**
   * validate
   * `required`: obligatorio (SOCIOS). `optional`: puede quedar vacío
   * (INVITADOS), pero si trae texto debe ser un importe válido.
   */
  const validate = (v: string, required: boolean): string | null => {
    const s = (v ?? '').trim();
    if (!s) return required ? 'Importe obligatorio' : null;
    if (parseMoney(s) === null) return 'Formato inválido (ej. $13,550.00)';
    return null;
  };

  const errors = {
    socCab: validate(socCab, true),
    socDam: validate(socDam, true),
    invCab: validate(invCab, false),
    invDam: validate(invDam, false),
  };
  /** Si se captura un lado de INVITADOS, se piden ambos importes. */
  const invPartial = !!(invCab.trim()) !== !!(invDam.trim());
  const hasErrors = Object.values(errors).some(Boolean) || invPartial;

  /** Escribe las dos tablas en el draft + sincroniza el editor JSON. */
  const apply = () => {
    if (hasErrors) return;
    /* Normaliza todo a moneda antes de publicar. */
    const fSocCab = formatMoney(socCab);
    const fSocDam = formatMoney(socDam);
    const fInvCab = invCab.trim() ? formatMoney(invCab) : '';
    const fInvDam = invDam.trim() ? formatMoney(invDam) : '';
    setSocCab(fSocCab); setSocDam(fSocDam);
    setInvCab(fInvCab); setInvDam(fInvDam);
    const tables: any[] = [
      { title: 'SOCIOS', tiers: [
        { categoria: 'Caballeros', costo: fSocCab },
        { categoria: 'Damas y Juveniles', costo: fSocDam },
      ] },
    ];
    if (fInvCab && fInvDam) {
      tables.push({ title: 'INVITADOS', tiers: [
        { categoria: 'Caballeros', costo: fInvCab },
        { categoria: 'Damas y Juveniles', costo: fInvDam },
      ] });
    }
    const next = { ...(draft ?? {}), sociosPricing: tables };
    setDraft(next);
    setJsonText(JSON.stringify(next, null, 2));
    setJsonError(null);
  };

  return (
    <div className="rounded-md border p-3 bg-muted/30 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Carga rápida de costos
      </p>
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">SOCIOS</p>
        <div className="grid grid-cols-2 gap-2">
          <MoneyField label="Caballeros" value={socCab} onChange={setSocCab} required error={errors.socCab} />
          <MoneyField label="Damas y Juveniles" value={socDam} onChange={setSocDam} required error={errors.socDam} />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">INVITADOS</p>
        <div className="grid grid-cols-2 gap-2">
          <MoneyField label="Caballeros" value={invCab} onChange={setInvCab} error={errors.invCab} />
          <MoneyField label="Damas y Juveniles" value={invDam} onChange={setInvDam} error={errors.invDam} />
        </div>
        {invPartial && (
          <p className="text-xs text-destructive">
            Captura ambos importes de INVITADOS o deja los dos vacíos.
          </p>
        )}
      </div>
      <Button size="sm" onClick={apply} disabled={hasErrors}>Cargar en el editor</Button>
      <p className="text-xs text-muted-foreground">
        Los importes se formatean automáticamente como moneda (ej. $13,550.00).
        Después presiona “Guardar” para publicar en /convocatoria.
      </p>
    </div>
  );
}

/** Render the matching public Section component with the draft payload. */
function renderPreview(sectionId: string, draft: any): JSX.Element | null {
  switch (sectionId) {
    case 'descripcion':
      return <DescripcionSection descripcion={draft?.text ?? ''} />;
    case 'elegibilidad':
      return (
        <ElegibilidadSection
          eligibilityText={draft?.eligibilityText ?? ''}
          notesText={draft?.notesText ?? []}
          inscripcionesText={draft?.inscripcionesText ?? ''}
        />
      );
    case 'premiacion':
      return <PremiacionSection data={draft?.items ?? []} />;
    case 'reglas':
      return <ReglasSection data={draft?.items ?? []} />;
    case 'competencias':
      return <CompetenciasEspecialesSection data={draft?.items ?? []} />;
    case 'servicios':
      return <ServiciosSection data={draft?.items ?? []} />;
    case 'patrocinadoresOficiales':
      return <PatrocinadoresOficialesSection data={draft?.items ?? []} />;
    case 'costos':
      return (
        <CostosSection
          sociosPricing={draft?.sociosPricing ?? []}
          foraneosPricing={draft?.foraneosPricing ?? []}
          pricingNote={draft?.pricingNote ?? ''}
          contactInfo={draft?.contactInfo ?? { bankName: '', clabe: '', cuenta: '', nombre: '', email: '', telefono: '', telefonoDirecto: '' }}
          contactWarning={draft?.contactWarning ?? ''}
          inscripcionesText={draft?.inscripcionesText ?? ''}
        />
      );
    case 'desempates':
      return <DesempatesSection data={draft ?? { intro: '', paraCorte: [], paraTrofeos: [] }} />;
    default:
      return null;
  }
}

// ============= Form router =============

interface ShapeFormProps {
  shape: Shape;
  draft: any;
  setDraft: (d: any) => void;
  jsonText: string;
  setJsonText: (s: string) => void;
  jsonError: string | null;
  setJsonError: (s: string | null) => void;
}

/** Renders the appropriate form for the section shape. */
function ShapeForm({ shape, draft, setDraft, jsonText, setJsonText, jsonError, setJsonError }: ShapeFormProps) {
  switch (shape) {
    case 'text':
      return (
        <Textarea
          rows={10}
          value={draft.text ?? ''}
          onChange={(e) => setDraft({ ...draft, text: e.target.value })}
          placeholder="Texto de descripción…"
        />
      );
    case 'elegibilidad':
      return (
        <div className="space-y-3">
          <label className="text-xs text-muted-foreground">Texto de requisitos</label>
          <Textarea rows={4} value={draft.eligibilityText ?? ''}
            onChange={(e) => setDraft({ ...draft, eligibilityText: e.target.value })} />
          <label className="text-xs text-muted-foreground">Notas (una por línea)</label>
          <Textarea rows={5}
            value={(draft.notesText ?? []).join('\n')}
            onChange={(e) => setDraft({ ...draft, notesText: e.target.value.split('\n').filter(Boolean) })} />
          <label className="text-xs text-muted-foreground">Texto de inscripciones</label>
          <Textarea rows={3} value={draft.inscripcionesText ?? ''}
            onChange={(e) => setDraft({ ...draft, inscripcionesText: e.target.value })} />
        </div>
      );
    case 'items_premio':
      return (
        <Repeater
          items={draft.items ?? []}
          onChange={(items) => setDraft({ ...draft, items })}
          factory={() => ({ categoria: '', premios: [''] })}
          render={(item, update) => (
            <>
              <Input placeholder="Categoría" value={item.categoria}
                onChange={(e) => update({ ...item, categoria: e.target.value })} />
              <StringList
                label="Premios"
                items={item.premios ?? []}
                onChange={(premios) => update({ ...item, premios })}
              />
            </>
          )}
        />
      );
    case 'items_regla':
      return (
        <Repeater
          items={draft.items ?? []}
          onChange={(items) => setDraft({ ...draft, items })}
          factory={() => ({ titulo: '', contenido: '' })}
          render={(item, update) => (
            <>
              <Input placeholder="Título" value={item.titulo}
                onChange={(e) => update({ ...item, titulo: e.target.value })} />
              <Textarea rows={3} placeholder="Contenido" value={item.contenido}
                onChange={(e) => update({ ...item, contenido: e.target.value })} />
            </>
          )}
        />
      );
    case 'items_competencia':
      return (
        <Repeater
          items={draft.items ?? []}
          onChange={(items) => setDraft({ ...draft, items })}
          factory={() => ({ nombre: '', descripcion: '', premios: '' })}
          render={(item, update) => (
            <>
              <Input placeholder="Nombre" value={item.nombre}
                onChange={(e) => update({ ...item, nombre: e.target.value })} />
              <Textarea rows={3} placeholder="Descripción" value={item.descripcion}
                onChange={(e) => update({ ...item, descripcion: e.target.value })} />
              <Textarea rows={2} placeholder='Premios (ej. "1ero: $1,000. 2do: $500.")' value={item.premios ?? ''}
                onChange={(e) => update({ ...item, premios: e.target.value })} />
            </>
          )}
        />
      );
    case 'items_servicio':
      return (
        <Repeater
          items={draft.items ?? []}
          onChange={(items) => setDraft({ ...draft, items })}
          factory={() => ({ dia: '', items: [{ servicio: '', horario: '' }] })}
          render={(dayItem, update) => (
            <>
              <Input placeholder='Día (ej. "Viernes 26 de Junio")' value={dayItem.dia}
                onChange={(e) => update({ ...dayItem, dia: e.target.value })} />
              <Repeater
                items={dayItem.items ?? []}
                onChange={(items) => update({ ...dayItem, items })}
                factory={() => ({ servicio: '', horario: '' })}
                render={(sub, updateSub) => (
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Servicio" value={sub.servicio}
                      onChange={(e) => updateSub({ ...sub, servicio: e.target.value })} />
                    <Input placeholder="Horario" value={sub.horario}
                      onChange={(e) => updateSub({ ...sub, horario: e.target.value })} />
                  </div>
                )}
                addLabel="Agregar servicio"
              />
            </>
          )}
        />
      );
    case 'items_patrocinador':
      return (
        <Repeater
          items={draft.items ?? []}
          onChange={(items) => setDraft({ ...draft, items })}
          factory={() => ({ premio: '', patrocinador: '', descripcion: '' })}
          render={(item, update) => (
            <>
              <Input placeholder="Premio (ej. Hole In One — Hoyo 7)" value={item.premio}
                onChange={(e) => update({ ...item, premio: e.target.value })} />
              <Input placeholder="Patrocinador" value={item.patrocinador}
                onChange={(e) => update({ ...item, patrocinador: e.target.value })} />
              <Textarea rows={2} placeholder="Descripción del premio" value={item.descripcion}
                onChange={(e) => update({ ...item, descripcion: e.target.value })} />
            </>
          )}
        />
      );
    case 'json':
      return (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Esta sección usa una estructura avanzada. Edita el JSON directamente;
            la vista previa se actualiza en cuanto el JSON sea válido.
          </p>
          <Textarea
            rows={20}
            spellCheck={false}
            className="font-mono text-xs"
            value={jsonText}
            onChange={(e) => {
              const val = e.target.value;
              setJsonText(val);
              try {
                const parsed = JSON.parse(val);
                setDraft(parsed);
                setJsonError(null);
              } catch (err: any) {
                setJsonError(err.message);
              }
            }}
          />
          {jsonError && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />{jsonError}
            </p>
          )}
        </div>
      );
  }
}

// ============= Sub-components =============

/** Generic add/remove repeater for a list of items. */
function Repeater<T>(props: {
  items: T[];
  onChange: (items: T[]) => void;
  factory: () => T;
  render: (item: T, update: (next: T) => void) => JSX.Element;
  addLabel?: string;
}) {
  const { items, onChange, factory, render, addLabel = 'Agregar' } = props;
  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="rounded-md border p-3 bg-muted/30 space-y-2 relative">
          <Button size="icon" variant="ghost" className="absolute top-1 right-1 h-7 w-7"
            onClick={() => onChange(items.filter((_, i) => i !== idx))} aria-label="Eliminar">
            <X className="h-4 w-4" />
          </Button>
          {render(item, (next) => onChange(items.map((it, i) => (i === idx ? next : it))))}
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => onChange([...items, factory()])}>
        <Plus className="h-4 w-4 mr-1" />{addLabel}
      </Button>
    </div>
  );
}

/** Simple list of strings editor. */
function StringList(props: { label: string; items: string[]; onChange: (items: string[]) => void }) {
  const { label, items, onChange } = props;
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      {items.map((s, idx) => (
        <div key={idx} className="flex gap-2">
          <Input value={s} onChange={(e) => onChange(items.map((v, i) => (i === idx ? e.target.value : v)))} />
          <Button size="icon" variant="ghost" onClick={() => onChange(items.filter((_, i) => i !== idx))}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => onChange([...items, ''])}>
        <Plus className="h-4 w-4 mr-1" />Agregar
      </Button>
    </div>
  );
}