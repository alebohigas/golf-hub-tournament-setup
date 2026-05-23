/**
 * AdminRegistros Page
 * --------------------------------------------------------------------
 * Separate, password-protected dashboard for the Pre-Registro feature.
 * Lists all submissions for the active tournament, allows toggling a
 * "verificado" flag, and provides a download link for the comprobante
 * stored as LONGBLOB in registro.reg_archivo.
 *
 * Auth: independent password (`registros2025`) — not tied to /admin.
 */

import { Fragment, useEffect, useMemo, useState, type FormEvent } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Lock, Shield, FileDown, RefreshCw, Search, CheckCircle2, XCircle, ChevronRight, ChevronDown, Eye, Mail, UserMinus, UserCheck, UserX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  getRegistroListUrl,
  getRegistroVerifyUrl,
  getRegistroArchivoUrl,
  getRegistroEmailUrl,
  getRegistroUnregisterUrl,
  getRegistroBajaUrl,
} from '@/config/api';

/** localStorage key for the registros admin session token. */
const SESSION_KEY = 'registros_admin_session';
const REGISTROS_PASSWORD = 'registros2025';

/**
 * Formatea un teléfono crudo "(+52 5512345678)" o "+52 5512345678" como
 * "(+52) 5512345678". Si no detecta lada con '+', devuelve el valor original.
 */
const formatPhone = (raw?: string | null): string => {
  const s = (raw || '').trim();
  if (!s) return '';
  const m = s.match(/^\+?\s*(\d{1,4})[\s-]+(.+)$/);
  if (m) return `(+${m[1]}) ${m[2].trim()}`;
  return s;
};

/** A single registro row from /api/registro.php */
interface RegistroRow {
  id: number;
  /** ID del torneo al que pertenece este registro (visible para admin). */
  torneoid?: number | string;
  reg_nombre?: string;
  reg_apellido?: string;
  reg_correo?: string;
  reg_telefono?: string;
  /** Alias canónico del teléfono en algunos esquemas. */
  reg_celular?: string;
  reg_handicap?: string;
  reg_categoria?: string;
  /** Nombre legible de la categoría (JOIN del backend). */
  categoria_name?: string;
  reg_es_socio?: string;
  reg_tipo_socio?: string;
  reg_club?: string;
  reg_fecha?: string;
  created_at?: string;
  /** Fallback adicional de timestamp de alta en esquemas antiguos. */
  fecha_alta?: string;
  reg_verificado?: number | string;
  /** Toggle administrativo: pago confirmado por tesorería. */
  reg_pago_verificado?: number | string;
  /** Monto realmente recibido (capturado por el admin). */
  reg_monto_confirmado?: number | string | null;
  /** Snapshot del precio mostrado al jugador al enviar el form. */
  reg_precio_estimado?: number | string;
  reg_precio_moneda?: string;
  has_archivo?: number | string;
  reg_archivo_nombre?: string;
  /** '1' si el jugador eligió cargo a cuenta de socio. */
  reg_cargo_socio?: number | string;
  /** Número/clave de membresía cuando aplica. */
  reg_numsocio?: string;
  /** Flag: jugador completó el flujo (subió comprobante o cargo a cuenta). */
  enviado?: number | string;
  /** Token opaco para el link público de adjuntar comprobante. */
  reg_token?: string;
  /** Contador de correos "registro validado" enviados al jugador. */
  reg_email_count?: number | string;
  /** Timestamp del último correo enviado al jugador. */
  reg_email_last?: string;
}

// ============= Login form =============

const LoginForm = ({ onLogin }: { onLogin: (pwd: string) => boolean }) => {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!onLogin(pwd)) { setErr(true); setPwd(''); }
  };
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Pre-Registros</CardTitle>
          <CardDescription>Acceso para el equipo de verificación</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pwd">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pwd" type="password" value={pwd}
                  onChange={e => { setPwd(e.target.value); setErr(false); }}
                  className={cn('pl-10', err && 'border-destructive focus-visible:ring-destructive')}
                  placeholder="Ingresa la contraseña"
                />
              </div>
              {err && <p className="text-sm text-destructive">Contraseña incorrecta</p>}
            </div>
            <Button type="submit" className="w-full">Entrar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// ============= Dashboard =============

export const RegistrosDashboard = ({ password }: { password: string }) => {
  const [rows, setRows] = useState<RegistroRow[]>([]);
  const [loading, setLoading] = useState(false);
  /**
   * Las 4 secciones del flujo de pre-registro:
   *   sec1 — Sin validar registro (enviado=0)
   *   sec2 — Pendiente verificación de pago (enviado=1, status_pago in {0})
   *   sec3 — Verificar registro (status_pago=1, verificado=0)
   *   sec4 — Registros completados (verificado=1, status_pago in {1,99})
   */
  const [section, setSection] = useState<'sec1' | 'sec2' | 'sec3' | 'sec4'>('sec1');
  const [search, setSearch] = useState('');
  /** Set de IDs cuyos detalles están expandidos en la tabla. */
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const toggleExpand = (id: number) =>
    setExpanded(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  /** Comprobante actualmente abierto en el modal de vista previa. */
  const [previewRow, setPreviewRow] = useState<RegistroRow | null>(null);
  const { toast } = useToast();

  /** Tracks which rows have an in-flight action button (per id+kind). */
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const markBusy = (key: string, v: boolean) =>
    setBusy(prev => ({ ...prev, [key]: v }));

  /** Fetch the latest list (always scoped to current torneoid). */
  const refresh = async () => {
    setLoading(true);
    try {
      // getRegistroListUrl now always limits to the active tournament
      const res = await fetch(getRegistroListUrl(password));
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al cargar');
      setRows(json.rows || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);

  /**
   * Admin update genérico: envía cualquier combinación de campos
   * (verified, pago_verificado, monto_confirmado) al endpoint verify
   * y aplica el cambio optimistamente en la fila local.
   * Si `verified` pasa a 1, el backend dispara correo al jugador.
   */
  const updateRegistro = async (
    row: RegistroRow,
    patch: { verified?: 0 | 1; pago_verificado?: 0 | 1; monto_confirmado?: string | null },
  ) => {
    try {
      const res = await fetch(getRegistroVerifyUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, password, ...patch }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error');
      setRows(prev => prev.map(r => {
        if (r.id !== row.id) return r;
        const next: RegistroRow = { ...r };
        if (patch.verified !== undefined)         next.reg_verificado       = patch.verified;
        if (patch.pago_verificado !== undefined)  next.reg_pago_verificado  = patch.pago_verificado;
        if (patch.monto_confirmado !== undefined) next.reg_monto_confirmado = patch.monto_confirmado ?? '';
        return next;
      }));
      if (patch.verified === 1) {
        toast({ title: 'Registro verificado' });
      }
    } catch (err: any) {
      toast({ title: 'Error al actualizar', description: err.message, variant: 'destructive' });
    }
  };

  /**
   * Sección 1 → POST /registro_email.php para mandarle al jugador el
   * correo "registro validado, sube tu comprobante".
   * NO marca enviado=1: eso ocurre cuando el jugador realmente sube
   * el comprobante desde la página pública.
   */
  const sendEmail = async (row: RegistroRow) => {
    const key = `email-${row.id}`;
    markBusy(key, true);
    try {
      const res = await fetch(getRegistroEmailUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error');
      toast({ title: 'Correo enviado', description: `Enviado a ${json.to}` });
    } catch (err: any) {
      toast({ title: 'Error al enviar correo', description: err.message, variant: 'destructive' });
    } finally {
      markBusy(key, false);
    }
  };

  /**
   * Sección 4 → toggle status_pago entre 1 (registrado) y 99
   * (des-registrado). Mismo botón cambia texto/icono según estado.
   */
  const toggleUnregister = async (row: RegistroRow) => {
    const key = `unreg-${row.id}`;
    markBusy(key, true);
    try {
      const res = await fetch(getRegistroUnregisterUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error');
      setRows(prev => prev.map(r => r.id === row.id
        ? { ...r, reg_pago_verificado: json.status_pago }
        : r));
      toast({
        title: json.status_pago === 99 ? 'Des-registrado' : 'Registrado',
      });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      markBusy(key, false);
    }
  };

  /**
   * Sección 4 → marca al jugador en `jugadores` con estatus='BAJA'.
   * No toca el registro mismo.
   */
  const darDeBaja = async (row: RegistroRow) => {
    if (!confirm(`¿Dar de baja al jugador ${row.reg_nombre || ''} ${row.reg_apellido || ''} en la tabla jugadores?`)) return;
    const key = `baja-${row.id}`;
    markBusy(key, true);
    try {
      const res = await fetch(getRegistroBajaUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error');
      toast({
        title: 'Jugador dado de baja',
        description: `${json.jugadores_updated} fila(s) actualizada(s) en jugadores.`,
      });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      markBusy(key, false);
    }
  };

  /**
   * Clasifica una fila en una de las 4 secciones según el flujo:
   *   sec1 — enviado=0
   *   sec2 — enviado=1 AND status_pago=0
   *   sec3 — status_pago=1 AND verificado=0
   *   sec4 — verificado=1 (status_pago=1 o 99)
   */
  const classify = (r: RegistroRow): 'sec1' | 'sec2' | 'sec3' | 'sec4' => {
    const enviado   = Number(r.enviado) === 1;
    const hasFile   = Number(r.has_archivo) === 1;
    const cargo     = String(r.reg_cargo_socio ?? '') === '1';
    const statusP   = Number(r.reg_pago_verificado);
    const verified  = Number(r.reg_verificado) === 1;
    if (verified) return 'sec4';
    if (statusP === 1) return 'sec3';
    // Auto-mover a sec2 si subió comprobante o eligió cargo a cuenta,
    // aunque la columna `enviado` no se haya actualizado.
    if (enviado || hasFile || cargo) return 'sec2';
    return 'sec1';
  };

  /** Conteos por sección — alimentan los tabs. */
  const counts = useMemo(() => {
    const c = { sec1: 0, sec2: 0, sec3: 0, sec4: 0 } as Record<'sec1'|'sec2'|'sec3'|'sec4', number>;
    for (const r of rows) c[classify(r)]++;
    return c;
  }, [rows]);

  /** Filtrado final por sección + búsqueda. */
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(r => {
      if (classify(r) !== section) return false;
      if (term) {
        const hay = [r.reg_nombre, r.reg_apellido, r.reg_correo, r.reg_telefono, r.reg_club]
          .filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [rows, section, search]);

  /** Tabs definidos arriba — orden importa (botones). */
  const SECTIONS: { id: 'sec1'|'sec2'|'sec3'|'sec4'; label: string }[] = [
    { id: 'sec1', label: 'Sin validar registro' },
    { id: 'sec2', label: 'Pendiente verificación de pago' },
    { id: 'sec3', label: 'Verificar registro' },
    { id: 'sec4', label: 'Registros completados' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pre-Registros</h1>
          <p className="text-muted-foreground">
            {rows.length} pre-registros · {counts.sec1} sin validar · {counts.sec2} pendiente pago · {counts.sec3} por verificar · {counts.sec4} completados
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh} disabled={loading} className="gap-2">
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Actualizar
          </Button>
        </div>
      </div>

      {/* Section tabs + search */}
      <Card>
        <CardContent className="pt-6 flex flex-col md:flex-row gap-3">
          <div className="flex gap-2 flex-wrap">
            {SECTIONS.map(s => (
              <Button
                key={s.id}
                variant={section === s.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSection(s.id)}
              >
                {s.label} <span className="ml-2 opacity-70">({counts[s.id]})</span>
              </Button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="Buscar por nombre, correo, club…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No hay registros para mostrar.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="w-8 p-3"></th>
                    <th className="text-left p-3">Jugador</th>
                    <th className="text-left p-3">Contacto</th>
                    <th className="text-left p-3">Categoría / Hcp</th>
                    <th className="text-left p-3">Club</th>
                    <th className="text-left p-3">Socio</th>
                    <th className="text-center p-3">Pago / Comprobante</th>
                    <th className="text-center p-3">Monto cobrado</th>
                    <th className="text-center p-3">Monto confirmado recibido</th>
                    <th className="text-center p-3">Pago verificado</th>
                    <th className="text-center p-3">Registro verificado</th>
                    <th className="text-center p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => {
                    const verified = Number(r.reg_verificado) === 1;
                    const pagoVerif = Number(r.reg_pago_verificado) === 1;
                    const hasFile = Number(r.has_archivo) === 1;
                    const cargoCuenta = String(r.reg_cargo_socio ?? '') === '1';
                    const moneda = r.reg_precio_moneda || 'MXN';
                    const montoCobrado = r.reg_precio_estimado !== undefined && r.reg_precio_estimado !== null && String(r.reg_precio_estimado) !== ''
                      ? `${Number(r.reg_precio_estimado).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${moneda}`
                      : '—';
                    return (
                    <Fragment key={r.id}>
                    <tr className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => toggleExpand(r.id)}>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={(e) => { e.stopPropagation(); toggleExpand(r.id); }}
                            aria-label={expanded.has(r.id) ? 'Colapsar' : 'Expandir'}
                          >
                            {expanded.has(r.id)
                              ? <ChevronDown className="h-4 w-4" />
                              : <ChevronRight className="h-4 w-4" />}
                          </button>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{[r.reg_nombre, r.reg_apellido].filter(Boolean).join(' ') || '—'}</div>
                          <div className="text-xs text-muted-foreground">#{r.id} · {r.reg_fecha || r.created_at || (r as any).fecha_alta || '—'}</div>
                        </td>
                        <td className="p-3">
                          <div>{r.reg_correo || '—'}</div>
                          <div className="text-xs text-muted-foreground">{formatPhone(r.reg_telefono || r.reg_celular)}</div>
                        </td>
                        <td className="p-3">
                          <div>{r.categoria_name || '—'}</div>
                          <div className="text-xs text-muted-foreground">Hcp: {r.reg_handicap ?? '—'}</div>
                        </td>
                        <td className="p-3">
                          <div>{r.reg_club || '—'}</div>
                        </td>
                        <td className="p-3">
                          {r.reg_es_socio === 'SI' ? (
                            <Badge variant="default">Socio · {r.reg_tipo_socio || '—'}</Badge>
                          ) : (
                            <Badge variant="secondary">No socio</Badge>
                          )}
                          {cargoCuenta && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              Clave: <span className="font-mono">{r.reg_numsocio || '—'}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {cargoCuenta ? (
                            <Badge variant="default" className="bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20">
                              Cargo a cuenta
                            </Badge>
                          ) : hasFile ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={(e) => { e.stopPropagation(); setPreviewRow(r); }}
                            >
                              <Eye className="h-4 w-4" /> Ver
                            </Button>
                          ) : <span className="text-muted-foreground text-xs">—</span>}
                        </td>
                        {/* Monto cobrado (snapshot mostrado al jugador al enviar el form). */}
                        <td className="p-3 text-center font-mono text-xs">{montoCobrado}</td>
                        {/* Campo: monto confirmado recibido (se persiste onBlur). */}
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={r.reg_monto_confirmado != null ? String(r.reg_monto_confirmado) : ''}
                            placeholder="0.00"
                            className="h-8 w-28 text-right font-mono"
                            onBlur={(e) => {
                              const val = e.currentTarget.value.trim();
                              const current = r.reg_monto_confirmado != null ? String(r.reg_monto_confirmado) : '';
                              if (val !== current) updateRegistro(r, { monto_confirmado: val });
                            }}
                          />
                        </td>
                        {/*
                          Toggle: pago verificado por tesorería.
                          Regla: sólo se puede activar si el monto confirmado recibido
                          coincide exactamente con el monto cobrado (reg_precio_estimado).
                          Si no coinciden, el switch queda deshabilitado.
                        */}
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          {(() => {
                            const cobradoNum = Number(r.reg_precio_estimado);
                            const confirmadoRaw = r.reg_monto_confirmado;
                            const confirmadoNum = confirmadoRaw != null && String(confirmadoRaw).trim() !== ''
                              ? Number(confirmadoRaw)
                              : NaN;
                            const montosCoinciden =
                              Number.isFinite(cobradoNum) &&
                              Number.isFinite(confirmadoNum) &&
                              cobradoNum === confirmadoNum;
                            const canToggle = montosCoinciden;
                            return (
                              <div
                                className="flex items-center justify-center gap-2"
                                title={canToggle ? '' : 'El monto confirmado debe coincidir con el monto cobrado'}
                              >
                                <Switch
                                  checked={pagoVerif}
                                  disabled={!canToggle}
                                  onCheckedChange={(v) => updateRegistro(r, { pago_verificado: v ? 1 : 0 })}
                                />
                                {pagoVerif
                                  ? <CheckCircle2 className="h-4 w-4 text-primary" />
                                  : <XCircle className="h-4 w-4 text-muted-foreground" />}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <Switch
                              checked={verified}
                              disabled={section !== 'sec3' && section !== 'sec4'}
                              onCheckedChange={(v) => updateRegistro(r, { verified: v ? 1 : 0 })}
                            />
                            {verified
                              ? <CheckCircle2 className="h-4 w-4 text-primary" />
                              : <XCircle className="h-4 w-4 text-muted-foreground" />}
                          </div>
                        </td>
                        {/*
                          Acciones por sección:
                          sec1 → "Enviar correo" siempre disponible (recordatorio al jugador).
                          sec3 → "Verificar" marca verificado=1 (atajo del switch).
                          sec4 → "Des-/Registrar" + "Dar de baja".
                        */}
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2 flex-wrap">
                            {section === 'sec1' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                disabled={!!busy[`email-${r.id}`] || !r.reg_correo}
                                onClick={() => sendEmail(r)}
                              >
                                {busy[`email-${r.id}`]
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : <Mail className="h-4 w-4" />}
                                Enviar correo
                              </Button>
                            )}
                            {section === 'sec3' && !verified && (
                              <Button
                                size="sm"
                                className="gap-1"
                                onClick={() => updateRegistro(r, { verified: 1 })}
                              >
                                <UserCheck className="h-4 w-4" /> Verificar
                              </Button>
                            )}
                            {section === 'sec4' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1"
                                  disabled={!!busy[`unreg-${r.id}`]}
                                  onClick={() => toggleUnregister(r)}
                                >
                                  {busy[`unreg-${r.id}`]
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <UserMinus className="h-4 w-4" />}
                                  {Number(r.reg_pago_verificado) === 99 ? 'Registrar' : 'Des-registrar'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="gap-1"
                                  disabled={!!busy[`baja-${r.id}`]}
                                  onClick={() => darDeBaja(r)}
                                >
                                  {busy[`baja-${r.id}`]
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <UserX className="h-4 w-4" />}
                                  Dar de baja
                                </Button>
                              </>
                            )}
                            {section === 'sec2' && (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expanded.has(r.id) && (
                        <tr className="border-t bg-muted/20">
                          <td></td>
                          <td colSpan={11} className="p-4">
                            {/* Detalle completo: lista todos los campos llenados del registro. */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                              {[
                                ['Nombre', r.reg_nombre],
                                ['Apellido', r.reg_apellido],
                                ['Correo', r.reg_correo],
                                ['Teléfono', formatPhone(r.reg_telefono || r.reg_celular)],
                                ['Handicap', r.reg_handicap],
                                ['Categoría', r.categoria_name],
                                ['Club', r.reg_club],
                                ['¿Es socio?', r.reg_es_socio],
                                ['Tipo de socio', r.reg_tipo_socio],
                                ['Cargo a cuenta', String(r.reg_cargo_socio ?? '') === '1' ? 'Sí' : 'No'],
                                ['Clave de socio', r.reg_numsocio],
                                ['Fecha registro', r.reg_fecha || r.created_at || (r as any).fecha_alta],
                                ['Precio estimado', r.reg_precio_estimado != null && String(r.reg_precio_estimado) !== '' ? `${Number(r.reg_precio_estimado).toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2})} ${r.reg_precio_moneda || 'MXN'}` : ''],
                                ['Monto confirmado', r.reg_monto_confirmado],
                                ['Pago verificado', Number(r.reg_pago_verificado) === 1 ? 'Sí' : 'No'],
                                ['Registro verificado', Number(r.reg_verificado) === 1 ? 'Sí' : 'No'],
                                ['Comprobante', Number(r.has_archivo) === 1 ? (r.reg_archivo_nombre || 'archivo cargado') : ''],
                              ].map(([label, value]) => {
                                const v = value == null || value === '' ? '—' : String(value);
                                return (
                                  <div key={String(label)} className="flex flex-col">
                                    <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
                                    <span className="font-medium break-words">{v}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de vista previa del comprobante (imagen o PDF inline). */}
      <Dialog open={!!previewRow} onOpenChange={(o) => !o && setPreviewRow(null)}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-4">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-3 pr-6">
              <span className="truncate">
                Comprobante · {previewRow ? `${previewRow.reg_nombre ?? ''} ${previewRow.reg_apellido ?? ''}`.trim() : ''}
                {previewRow?.reg_archivo_nombre ? ` — ${previewRow.reg_archivo_nombre}` : ''}
              </span>
              {previewRow && (
                <Button asChild size="sm" variant="outline" className="gap-1 shrink-0">
                  <a
                    href={getRegistroArchivoUrl(previewRow.id, password)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileDown className="h-4 w-4" /> Abrir en nueva pestaña
                  </a>
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          {previewRow && (() => {
            const url = getRegistroArchivoUrl(previewRow.id, password);
            const name = (previewRow.reg_archivo_nombre || '').toLowerCase();
            const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(name);
            return isImage ? (
              <div className="flex-1 overflow-auto bg-muted/30 rounded flex items-center justify-center">
                <img src={url} alt="Comprobante" className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <iframe src={url} title="Comprobante" className="flex-1 w-full rounded border" />
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============= Page =============

const AdminRegistros = () => {
  const [authed, setAuthed] = useState<boolean>(() => sessionStorage.getItem(SESSION_KEY) === '1');

  /** Compare against the local constant; on success persist for the session. */
  const onLogin = (pwd: string) => {
    if (pwd === REGISTROS_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setAuthed(true);
      return true;
    }
    return false;
  };

  return (
    <Layout>
      {authed ? <RegistrosDashboard password={REGISTROS_PASSWORD} /> : <LoginForm onLogin={onLogin} />}
    </Layout>
  );
};

export default AdminRegistros;