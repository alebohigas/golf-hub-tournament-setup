/**
 * Registro Page (Pre-Registro)
 * --------------------------------------------------------------------
 * Public registration form for the active tournament.
 *
 * The set of rendered fields, their labels and required-state come from
 * /api/registro_fields.php (admin-configurable). Some fields trigger
 * additional UI logic on the client:
 *
 *   - reg_nombre + reg_apellido + reg_fechanac
 *       → if a matching row exists in `jugadores` we auto-fill the rest.
 *   - reg_es_socio (SI/NO) → toggles reg_tipo_socio (Titular/Emérito/Dependiente).
 *   - reg_pais → loads states; reg_estado → loads cities (cascading).
 *   - reg_handicap + reg_sexo + reg_fechanac → restricts the categoría
 *       options to those the player is eligible for.
 *   - reg_archivo → file input, posted as multipart and stored as LONGBLOB.
 *
 * Submission goes to /api/registro.php as multipart/form-data.
 */

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import registroHero from '@/assets/registro-hero.jpg';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle2, Send } from 'lucide-react';
import { useRegistroFields } from '@/hooks/useRegistroFields';
import { useCategories } from '@/hooks/usePlayersData';
import { useToast } from '@/hooks/use-toast';
import {
  getRegistroSubmitUrl,
  getLocationsCountriesUrl,
  getLocationsStatesUrl,
  getLocationsCitiesUrl,
} from '@/config/api';

// ============= Types =============

/** Row returned by /api/locations.php */
interface LocationRow { id: number; name: string }

/** Field-name → suggested placeholder text shown as greyed example. */
const PLACEHOLDERS: Record<string, string> = {
  reg_nombre:     'Ej: Juan Carlos',
  reg_apellido:   'Ej: Pérez González',
  reg_correo:     'tu@correo.com',
  reg_telefono:   '+52 55 1234 5678',
  reg_handicap:   'Ej: 14.2',
  reg_club:       'Ej: Club de Golf Valle Alto',
  reg_ghin:       'Ej: 123456789',
  reg_notas:      'Notas adicionales para el comité…',
  reg_fechanac:   'YYYY-MM-DD',
};

// ============= Helpers =============

/** Calculate age in completed years from a YYYY-MM-DD birthdate. */
const calcAge = (yyyymmdd: string): number | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(yyyymmdd)) return null;
  const [y, m, d] = yyyymmdd.split('-').map(Number);
  const dob = new Date(y, m - 1, d);
  if (isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    now.getMonth() < dob.getMonth() ||
    (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate());
  if (beforeBirthday) age -= 1;
  return age;
};

// ============= Component =============

const Registro = () => {
  const { data: fieldsData, isLoading: loadingFields } = useRegistroFields();
  const { data: categories = [] } = useCategories();
  const { toast } = useToast();

  /** Values for every form field, keyed by field_name. */
  const [values, setValues] = useState<Record<string, string>>({});
  /** Selected file for reg_archivo (kept outside `values` since it's binary). */
  const [file, setFile] = useState<File | null>(null);
  /** Submission state */
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /** Cascading dropdown data + selected ids */
  const [countries, setCountries] = useState<LocationRow[]>([]);
  const [states, setStates]       = useState<LocationRow[]>([]);
  const [cities, setCities]       = useState<LocationRow[]>([]);

  /** Field config sorted by display_order, enabled only. */
  const visibleFields = useMemo(() => {
    if (!fieldsData?.fields) return [];
    return [...fieldsData.fields]
      .filter(f => !!f.is_enabled)
      .sort((a, b) => a.display_order - b.display_order);
  }, [fieldsData]);

  /** Quick lookup: is a given field configured/enabled? */
  const isFieldEnabled = (name: string) => visibleFields.some(f => f.field_name === name);
  const isFieldRequired = (name: string) =>
    !!visibleFields.find(f => f.field_name === name && f.is_required);

  /** Load countries on mount (only if the field is enabled). */
  useEffect(() => {
    if (!isFieldEnabled('reg_pais')) return;
    fetch(getLocationsCountriesUrl())
      .then(r => r.json())
      .then((rows: LocationRow[]) => setCountries(rows || []))
      .catch(() => setCountries([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleFields.length]);

  /** Cascade states when country changes. */
  useEffect(() => {
    const cid = values.reg_pais;
    if (!cid) { setStates([]); return; }
    fetch(getLocationsStatesUrl(cid))
      .then(r => r.json())
      .then((rows: LocationRow[]) => setStates(rows || []))
      .catch(() => setStates([]));
    // Reset downstream selections
    setValues(v => ({ ...v, reg_estado: '', reg_ciudad: '' }));
    setCities([]);
  }, [values.reg_pais]);

  /** Cascade cities when state changes. */
  useEffect(() => {
    const sid = values.reg_estado;
    if (!sid) { setCities([]); return; }
    fetch(getLocationsCitiesUrl(sid))
      .then(r => r.json())
      .then((rows: LocationRow[]) => setCities(rows || []))
      .catch(() => setCities([]));
    setValues(v => ({ ...v, reg_ciudad: '' }));
  }, [values.reg_estado]);

  /** Eligible categories given hcp/sex/age (when those values are present). */
  const eligibleCategories = useMemo(() => {
    const hcp  = parseFloat(values.reg_handicap);
    const sex  = (values.reg_sexo || '').toUpperCase();
    const age  = calcAge(values.reg_fechanac || '');
    return categories.filter(c => {
      // Handicap range — only filter when user has typed a number AND the
      // category has a usable range (max > 0 in legacy data sometimes is 0).
      if (!isNaN(hcp) && c.hcpMax > 0 && (hcp < c.hcpMin || hcp > c.hcpMax)) return false;
      // Gender filter when category restricts it (M/F).
      if (sex && c.gender && (c.gender === 'M' || c.gender === 'F') && c.gender !== sex) return false;
      // Age range filter (senior categories with min/max set).
      if (age !== null) {
        if (c.ageMin != null && age < c.ageMin) return false;
        if (c.ageMax != null && age > c.ageMax) return false;
      }
      return true;
    });
  }, [categories, values.reg_handicap, values.reg_sexo, values.reg_fechanac]);

  /** Generic value setter. */
  const setValue = (name: string, v: string) =>
    setValues(prev => ({ ...prev, [name]: v }));

  /** Submit the form as multipart/form-data. */
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(values).forEach(([k, v]) => {
        if (v !== '' && v !== undefined && v !== null) fd.append(k, v);
      });
      if (file) fd.append('reg_archivo', file);

      const res = await fetch(getRegistroSubmitUrl(), { method: 'POST', body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !(json as any).saved) {
        throw new Error((json as any).error || 'Error al enviar el formulario');
      }
      setSubmitted(true);
      toast({ title: '¡Pre-registro enviado!', description: 'Recibirás confirmación por correo.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  /** Render one field row by its config entry. */
  const renderField = (name: string, label: string, required: boolean) => {
    const placeholder = PLACEHOLDERS[name] ?? '';
    const id = `f-${name}`;
    const common = { id, required, placeholder } as const;

    // ----- Specialized renderers -----
    if (name === 'reg_es_socio') {
      return (
        <div className="space-y-2" key={name}>
          <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
          <Select value={values[name] || ''} onValueChange={v => setValue(name, v)}>
            <SelectTrigger id={id}><SelectValue placeholder="Selecciona una opción" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SI">Sí, soy socio</SelectItem>
              <SelectItem value="NO">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (name === 'reg_tipo_socio') {
      const enabled = values.reg_es_socio === 'SI';
      return (
        <div className="space-y-2" key={name}>
          <Label htmlFor={id}>{label}{required && enabled && <span className="text-destructive"> *</span>}</Label>
          <Select value={values[name] || ''} onValueChange={v => setValue(name, v)} disabled={!enabled}>
            <SelectTrigger id={id}>
              <SelectValue placeholder={enabled ? 'Selecciona el tipo' : 'Solo para socios'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TITULAR">Titular</SelectItem>
              <SelectItem value="EMERITO">Emérito</SelectItem>
              <SelectItem value="DEPENDIENTE">Dependiente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (name === 'reg_sexo') {
      return (
        <div className="space-y-2" key={name}>
          <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
          <Select value={values[name] || ''} onValueChange={v => setValue(name, v)}>
            <SelectTrigger id={id}><SelectValue placeholder="Selecciona" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="M">Masculino</SelectItem>
              <SelectItem value="F">Femenino</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (name === 'reg_categoria') {
      return (
        <div className="space-y-2" key={name}>
          <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
          <Select value={values[name] || ''} onValueChange={v => setValue(name, v)}>
            <SelectTrigger id={id}>
              <SelectValue placeholder={eligibleCategories.length ? 'Selecciona categoría' : 'Completa hcp/sexo/edad'} />
            </SelectTrigger>
            <SelectContent>
              {eligibleCategories.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {eligibleCategories.length} categoría(s) compatible(s) con tus datos.
          </p>
        </div>
      );
    }

    if (name === 'reg_pais') {
      return (
        <div className="space-y-2" key={name}>
          <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
          <Select value={values[name] || ''} onValueChange={v => setValue(name, v)}>
            <SelectTrigger id={id}><SelectValue placeholder="Selecciona país" /></SelectTrigger>
            <SelectContent>
              {countries.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (name === 'reg_estado') {
      return (
        <div className="space-y-2" key={name}>
          <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
          <Select value={values[name] || ''} onValueChange={v => setValue(name, v)} disabled={!values.reg_pais}>
            <SelectTrigger id={id}>
              <SelectValue placeholder={values.reg_pais ? 'Selecciona estado' : 'Selecciona país primero'} />
            </SelectTrigger>
            <SelectContent>
              {states.map(s => (
                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (name === 'reg_ciudad') {
      return (
        <div className="space-y-2" key={name}>
          <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
          <Select value={values[name] || ''} onValueChange={v => setValue(name, v)} disabled={!values.reg_estado}>
            <SelectTrigger id={id}>
              <SelectValue placeholder={values.reg_estado ? 'Selecciona ciudad' : 'Selecciona estado primero'} />
            </SelectTrigger>
            <SelectContent>
              {cities.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (name === 'reg_archivo') {
      return (
        <div className="space-y-2" key={name}>
          <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
          <Input
            id={id}
            type="file"
            accept="image/*,application/pdf"
            required={required}
            onChange={e => setFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-muted-foreground">PDF o imagen, máximo 15 MB.</p>
        </div>
      );
    }

    if (name === 'reg_notas') {
      return (
        <div className="space-y-2 md:col-span-2" key={name}>
          <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
          <Textarea
            id={id} required={required} placeholder={placeholder}
            value={values[name] || ''}
            onChange={e => setValue(name, e.target.value)}
            rows={4}
          />
        </div>
      );
    }

    /** Default: text/email/number/date input. */
    let type: string = 'text';
    if (name === 'reg_correo')     type = 'email';
    if (name === 'reg_telefono')   type = 'tel';
    if (name === 'reg_handicap')   type = 'number';
    if (name === 'reg_fechanac')   type = 'date';

    return (
      <div className="space-y-2" key={name}>
        <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
        <Input
          {...common}
          type={type}
          step={name === 'reg_handicap' ? '0.1' : undefined}
          value={values[name] || ''}
          onChange={e => setValue(name, e.target.value)}
        />
      </div>
    );
  };

  return (
    <Layout>
      <PageHero
        title="Pre-Registro"
        subtitle="Inscríbete al torneo. Verificaremos tus datos y te enviaremos confirmación por correo."
        backgroundImage={registroHero}
      />

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          {submitted ? (
            <Card>
              <CardContent className="py-12 text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 mx-auto text-primary" />
                <h2 className="text-2xl font-bold">¡Pre-registro recibido!</h2>
                <p className="text-muted-foreground">
                  Hemos guardado tu solicitud. El comité revisará tus datos
                  y te contactará por correo para confirmar tu inscripción.
                </p>
                <Button variant="outline" onClick={() => { setSubmitted(false); setValues({}); setFile(null); }}>
                  Enviar otro pre-registro
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Formulario de Pre-Registro</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingFields ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Cargando formulario…
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleFields.map(f => renderField(f.field_name, f.field_label, !!f.is_required))}
                    <div className="md:col-span-2 flex justify-end pt-2">
                      <Button type="submit" disabled={submitting} className="gap-2" size="lg">
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Enviar pre-registro
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Registro;