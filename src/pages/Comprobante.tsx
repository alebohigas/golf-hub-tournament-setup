/**
 * Comprobante page (public)
 * --------------------------------------------------------------------
 * Lands here from the "Adjuntar comprobante" button in the validation
 * email. The URL carries an opaque token (?token=...) that identifies
 * the registro row. We:
 *   1. GET the registro data and render it read-only with bold values.
 *   2. Accept a single file upload (image or PDF).
 *   3. POST it back with the token to attach it and flip enviado=1.
 *
 * No password is required — the token itself is the auth.
 */

import { useEffect, useMemo, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, AlertCircle, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getRegistroPublicoUrl,
  getRegistroPublicoSubmitUrl,
} from '@/config/api';

/** Shape of the public registro payload returned by /api/registro_publico.php. */
interface PublicRegistro {
  id: number;
  reg_nombre?: string;
  reg_apellido?: string;
  reg_correo?: string;
  reg_telefono?: string;
  reg_celular?: string;
  reg_handicap?: string;
  reg_categoria?: string;
  categoria_name?: string;
  reg_club?: string;
  reg_es_socio?: string;
  reg_tipo_socio?: string;
  reg_cargo_socio?: number | string;
  reg_numsocio?: string;
  reg_precio_estimado?: number | string;
  reg_precio_moneda?: string;
  has_archivo?: number;
  reg_archivo_nombre?: string;
  torneo_name?: string;
  // Tallas (editables si vienen con valor desde el registro)
  akron_talla?: string | null;
  akron_talla_guante?: string | null;
  reg_talla_gorra?: string | null;
  akron_calzado?: string | null;
}

/** Read the `token` query parameter from the current URL. */
const useTokenParam = (): string => {
  return useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('token') || '';
  }, []);
};

/** Render a single key/value as label + bold value (read-only). */
const Field = ({ label, value }: { label: string; value?: string | number | null }) => {
  const v = value == null || value === '' ? '—' : String(value);
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="font-bold text-foreground break-words">{v}</span>
    </div>
  );
};

const Comprobante = () => {
  const token = useTokenParam();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [registro, setRegistro] = useState<PublicRegistro | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  /**
   * Tallas editables — se inicializan desde el registro y solo se muestran
   * los campos cuyo valor original NO es NULL/empty.
   */
  const [tallas, setTallas] = useState<Record<string, string>>({});
  const [tallasVisibles, setTallasVisibles] = useState<string[]>([]);

  /** Initial load — fetch registro by token. */
  useEffect(() => {
    if (!token) { setError('Falta token en la URL.'); setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch(getRegistroPublicoUrl(token));
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'No se pudo cargar el registro');
        setRegistro(json.registro);
        // Determinar qué tallas mostrar (solo no-null)
        const r = json.registro || {};
        const candidatos: Array<{ key: string; label: string }> = [
          { key: 'akron_talla',        label: 'Talla de camisa' },
          { key: 'akron_talla_guante', label: 'Talla de guante' },
          { key: 'reg_talla_gorra',    label: 'Talla de gorra' },
          { key: 'akron_calzado',      label: 'Talla de calzado' },
        ];
        const visibles: string[] = [];
        const init: Record<string, string> = {};
        for (const c of candidatos) {
          const v = r[c.key];
          if (v !== null && v !== undefined && String(v).trim() !== '') {
            visibles.push(c.key);
            init[c.key] = String(v);
          }
        }
        setTallas(init);
        setTallasVisibles(visibles);
      } catch (e: any) {
        setError(e.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  /** Submit the file to the public POST endpoint. */
  const onSubmit = async () => {
    if (!file) {
      toast({ title: 'Selecciona un archivo primero.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('token', token);
      fd.append('reg_archivo', file);
      // Enviar tallas editadas (solo las visibles/no-null originales)
      for (const k of tallasVisibles) {
        fd.append(k, tallas[k] ?? '');
      }
      const res = await fetch(getRegistroPublicoSubmitUrl(), { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al subir');
      setDone(true);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Render states ----------
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Cargando su registro…
        </div>
      </Layout>
    );
  }
  if (error || !registro) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" /> No se pudo abrir su registro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{error || 'Token inválido.'}</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
  if (done) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-6 w-6" /> ¡Registro completado!
              </CardTitle>
              <CardDescription>
                Recibimos su comprobante. El comité validará su pago en breve.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  // ---------- Main view ----------
  const phone = registro.reg_telefono || registro.reg_celular;
  const monto = registro.reg_precio_estimado != null && String(registro.reg_precio_estimado) !== ''
    ? `${Number(registro.reg_precio_estimado).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${registro.reg_precio_moneda || 'MXN'}`
    : '—';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Adjuntar comprobante de pago</CardTitle>
            <CardDescription>
              Folio <strong>#{registro.id}</strong>
              {registro.torneo_name ? ` · ${registro.torneo_name}` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Data summary (read-only, bold values) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 bg-muted/40 p-4 rounded-md">
              <Field label="Nombre" value={`${registro.reg_nombre ?? ''} ${registro.reg_apellido ?? ''}`.trim()} />
              <Field label="Correo" value={registro.reg_correo} />
              <Field label="Teléfono" value={phone} />
              <Field label="Club" value={registro.reg_club} />
              <Field label="Categoría" value={registro.categoria_name} />
              <Field label="Handicap" value={registro.reg_handicap} />
              <Field label="Socio" value={registro.reg_es_socio === 'SI' ? `Sí · ${registro.reg_tipo_socio || ''}` : 'No'} />
              <Field label="Monto a pagar" value={monto} />
            </div>

            {/* Existing file note */}
            {Number(registro.has_archivo) === 1 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground rounded-md border border-dashed p-3">
                <FileText className="h-4 w-4" />
                Ya hay un comprobante cargado{registro.reg_archivo_nombre ? `: ${registro.reg_archivo_nombre}` : ''}.
                Puede reemplazarlo subiendo uno nuevo.
              </div>
            )}

            {/* Tallas — editables, solo las que tienen valor en el registro */}
            {tallasVisibles.length > 0 && (
              <div className="space-y-3 rounded-md border p-4">
                <div>
                  <h3 className="text-sm font-semibold">Confirma tus tallas</h3>
                  <p className="text-xs text-muted-foreground">
                    Verifica y, si es necesario, corrige los siguientes datos.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tallasVisibles.map((k) => {
                    const labels: Record<string, string> = {
                      akron_talla: 'Talla de camisa',
                      akron_talla_guante: 'Talla de guante',
                      reg_talla_gorra: 'Talla de gorra',
                      akron_calzado: 'Talla de calzado',
                    };
                    return (
                      <div key={k} className="space-y-1">
                        <Label htmlFor={k} className="text-xs uppercase tracking-wide text-muted-foreground">
                          {labels[k]}
                        </Label>
                        <Input
                          id={k}
                          value={tallas[k] ?? ''}
                          onChange={(e) => setTallas((prev) => ({ ...prev, [k]: e.target.value }))}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* File picker */}
            <div className="space-y-2">
              <Label htmlFor="file" className="text-sm font-medium">Comprobante (imagen o PDF)</Label>
              <Input
                id="file"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file && (
                <p className="text-xs text-muted-foreground">{file.name} · {(file.size / 1024).toFixed(0)} KB</p>
              )}
            </div>

            <Button
              onClick={onSubmit}
              disabled={submitting || !file}
              size="lg"
              className="w-full gap-2"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Terminar Registro
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Comprobante;