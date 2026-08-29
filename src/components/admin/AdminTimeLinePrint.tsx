/**
 * AdminTimeLinePrint — Admin → pestaña "Time Line"
 * -----------------------------------------------------------------------------
 * Formulario para generar el reporte TIME LINE (hora estimada en cada hoyo)
 * de un día de juego:
 *   - Fecha (día de juego)
 *   - Campo (campoid)
 *   - Desde / hasta hoyo
 *   - Desde / hasta hora
 * El botón GENERA abre `/admin/time-line` con los filtros en la URL.
 */

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, Clock, Loader2, Printer } from 'lucide-react';
import { useSalidasImpresionDays } from '@/hooks/useSalidasImpresion';
import { useTimeLineReport } from '@/hooks/useTimeLine';
import { useTorneoId } from '@/hooks/useTorneoId';
import { API_BASE_URL } from '@/config/api';

/** Expresión de hora válida en formato 24h HH:MM (00:00 – 23:59). */
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Convierte "HH:MM" a minutos desde medianoche; -1 si el formato es inválido. */
const toMinutes = (t: string): number => {
  const m = TIME_RE.exec(t.trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : -1;
};

/**
 * Alto útil (px @96 dpi) de cada hoja en horizontal con márgenes de 10 mm.
 * Debe coincidir con PAPER_SIZES de `src/pages/AdminTimeLine.tsx`.
 */
const PAPER_SIZES = {
  letter: { label: 'Carta (11 × 8.5 in)', heightPx: 740 },
  a4: { label: 'A4 (297 × 210 mm)', heightPx: 718 },
};

/** Clave de tamaño de papel. */
type PaperKey = keyof typeof PAPER_SIZES;

/** Alto reservado en la primera hoja para encabezado + pie del reporte. */
const HEADER_FOOTER_PX = 170;
/** Alto de un bloque de salida sin jugadores (3 renglones + separación). */
const BLOCK_BASE_PX = 78;
/** Alto de cada renglón de jugador dentro del bloque. */
const PLAYER_ROW_PX = 20;

/** Panel de generación del reporte TIME LINE. */
const AdminTimeLinePrint = () => {
  const { data, isLoading } = useSalidasImpresionDays();
  const days = data?.days ?? [];
  /** Torneo activo (obligatorio: el API lo exige en cada petición). */
  const { torneoId } = useTorneoId();

  // ============= Estado del formulario =============
  const [fecha, setFecha] = useState('');
  const [campoid, setCampoid] = useState('');
  const [hi, setHi] = useState('1');
  const [hf, setHf] = useState('18');
  const [hri, setHri] = useState('06:00');
  const [hrf, setHrf] = useState('11:00');

  /** Precarga el primer día de juego disponible. */
  useEffect(() => {
    if (!fecha && days.length > 0) {
      setFecha(days[0].fecha);
      setCampoid(days[0].campoid);
    }
  }, [days, fecha]);

  /** Campos disponibles para la fecha elegida (con fallback a todos). */
  const camposDeFecha = useMemo(() => {
    const list = days.filter((d) => d.fecha === fecha);
    return list.length > 0 ? list : days;
  }, [days, fecha]);

  /**
   * Validación del formulario. Todo debe estar presente y coherente antes de
   * abrir el reporte:
   *   - URL base del API configurada
   *   - torneo activo (torneoid)
   *   - día de juego y campo seleccionados
   *   - hoyos enteros 1–18 con hf >= hi
   *   - horas HH:MM (24 h) con hora final >= hora inicial
   */
  const errors = useMemo<string[]>(() => {
    const errs: string[] = [];
    if (!API_BASE_URL || !API_BASE_URL.trim())
      errs.push('La URL del API no está configurada.');
    if (!torneoId || !torneoId.trim())
      errs.push('No hay torneo activo configurado (torneoid).');
    if (!fecha || !fecha.trim()) errs.push('Selecciona el día de juego.');
    if (!campoid || !campoid.trim()) errs.push('Selecciona el campo.');

    const nHi = Number(hi);
    const nHf = Number(hf);
    if (!hi.trim() || !Number.isInteger(nHi) || nHi < 1 || nHi > 18)
      errs.push('El hoyo inicial debe ser un número entero entre 1 y 18.');
    if (!hf.trim() || !Number.isInteger(nHf) || nHf < 1 || nHf > 18)
      errs.push('El hoyo final debe ser un número entero entre 1 y 18.');
    if (Number.isInteger(nHi) && Number.isInteger(nHf) && nHf < nHi)
      errs.push('El hoyo final debe ser mayor o igual al hoyo inicial.');

    const mIni = toMinutes(hri);
    const mFin = toMinutes(hrf);
    if (!hri.trim()) errs.push('Indica la hora inicial.');
    else if (mIni < 0) errs.push('La hora inicial no tiene un formato válido (HH:MM, 24 horas).');
    if (!hrf.trim()) errs.push('Indica la hora final.');
    else if (mFin < 0) errs.push('La hora final no tiene un formato válido (HH:MM, 24 horas).');
    if (mIni >= 0 && mFin >= 0 && mFin < mIni)
      errs.push('La hora final debe ser posterior o igual a la hora inicial.');

    return errs;
  }, [torneoId, fecha, campoid, hi, hf, hri, hrf]);

  const isValid = errors.length === 0;

  // ============= Vista previa (encabezado + paginación) =============

  /** Papel elegido para estimar la paginación de la vista previa. */
  const [paper, setPaper] = useState<PaperKey>('letter');
  /** Controla el diálogo de vista previa. */
  const [previewOpen, setPreviewOpen] = useState(false);

  /** Filtros congelados para la consulta de vista previa. */
  const previewFilters = useMemo(
    () => (isValid ? { fecha, campoid, hi, hf, hri, hrf } : null),
    [isValid, fecha, campoid, hi, hf, hri, hrf]
  );

  const { data: report, isLoading: loadingPreview } = useTimeLineReport(
    previewFilters,
    previewOpen && isValid
  );

  /**
   * Resumen de la vista previa: totales y estimación de páginas usando el
   * mismo criterio que la impresión (bloques completos, sin partirse, dentro
   * del alto útil de la hoja horizontal).
   */
  const summary = useMemo(() => {
    const groups = report?.groups ?? [];
    const players = groups.reduce((n, g) => n + g.players.length, 0);
    const usable = PAPER_SIZES[paper].heightPx - HEADER_FOOTER_PX;
    let pages = groups.length > 0 ? 1 : 0;
    let used = 0;
    for (const g of groups) {
      const h = BLOCK_BASE_PX + g.players.length * PLAYER_ROW_PX;
      if (used > 0 && used + h > usable) {
        pages += 1;
        used = h;
      } else {
        used += h;
      }
    }
    return { groups: groups.length, players, pages };
  }, [report, paper]);

  /**
   * Abre el reporte imprimible en una pestaña nueva con la configuración
   * actual (papel incluido).
   * @param auto - `'pdf'` descarga el PDF final en automático, `'print'` abre
   *   el diálogo de impresión, y sin valor sólo muestra el reporte.
   */
  const generar = (auto?: 'pdf' | 'print') => {
    if (!isValid) return;
    const qs = new URLSearchParams({ fecha, campoid, hi, hf, hri, hrf, paper });
    if (auto) qs.set('auto', auto);
    setPreviewOpen(false);
    window.open(`/admin/time-line?${qs.toString()}`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Time Line
        </CardTitle>
        <CardDescription>
          Genera el reporte con la hora estimada de cada grupo en los 18 hoyos, filtrando por
          campo, rango de hoyos de salida y rango de horas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando días de juego…
          </div>
        ) : (
          <div className="flex flex-wrap items-end gap-4">
            {/* Fecha */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Fecha</Label>
              {days.length > 0 ? (
                <Select
                  value={fecha}
                  onValueChange={(v) => {
                    setFecha(v);
                    const match = days.find((d) => d.fecha === v);
                    if (match) setCampoid(match.campoid);
                  }}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Día de juego" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(new Set(days.map((d) => d.fecha))).map((f) => (
                      <SelectItem key={f} value={f}>
                        {days.find((d) => d.fecha === f)?.fechaFormato || f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-[180px]"
                />
              )}
            </div>

            {/* Campo */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Campo</Label>
              {camposDeFecha.length > 0 ? (
                <Select value={campoid} onValueChange={setCampoid}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Campo" />
                  </SelectTrigger>
                  <SelectContent>
                    {camposDeFecha.map((d) => (
                      <SelectItem key={`${d.fecha}-${d.campoid}`} value={d.campoid}>
                        {d.campo || `Campo ${d.campoid}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={campoid}
                  onChange={(e) => setCampoid(e.target.value)}
                  className="w-[120px]"
                  placeholder="Campo ID"
                />
              )}
            </div>

            {/* Rango de hoyos */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Desde hoyo</Label>
              <Input
                type="number"
                min={1}
                max={18}
                value={hi}
                onChange={(e) => setHi(e.target.value)}
                className="w-[100px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Hasta hoyo</Label>
              <Input
                type="number"
                min={1}
                max={18}
                value={hf}
                onChange={(e) => setHf(e.target.value)}
                className="w-[100px]"
              />
            </div>

            {/* Rango de horas */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Desde las</Label>
              <Input
                type="time"
                value={hri}
                onChange={(e) => setHri(e.target.value)}
                className="w-[120px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Hasta las</Label>
              <Input
                type="time"
                value={hrf}
                onChange={(e) => setHrf(e.target.value)}
                className="w-[120px]"
              />
            </div>

            {/* Papel (sólo para estimar la paginación de la vista previa) */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Papel</Label>
              <Select value={paper} onValueChange={(v) => setPaper(v as PaperKey)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Papel" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PAPER_SIZES) as PaperKey[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {PAPER_SIZES[k].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Acción — abre la vista previa antes de generar el reporte */}
            <Button onClick={() => setPreviewOpen(true)} disabled={!isValid}>
              <Printer className="mr-2 h-4 w-4" />
              GENERA
            </Button>
          </div>
        )}

        {/* Errores de validación */}
        {!isLoading && errors.length > 0 && (
          <ul className="mt-4 space-y-1 rounded-md border border-destructive/40 bg-destructive/5 p-3">
            {errors.map((e) => (
              <li key={e} className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {e}
              </li>
            ))}
          </ul>
        )}

        {/* ============= Vista previa: encabezado + paginación ============= */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Vista previa del reporte Time Line</DialogTitle>
              <DialogDescription>
                Confirma el encabezado tal como se imprimirá y la paginación estimada para el papel
                seleccionado.
              </DialogDescription>
            </DialogHeader>

            {loadingPreview ? (
              <div className="flex items-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Calculando vista previa…
              </div>
            ) : (
              <>
                {/* Encabezado exacto del reporte: 4 renglones */}
                <div className="rounded-md border border-border bg-card p-3 text-center">
                  <p className="text-lg font-extrabold uppercase leading-[1.25] text-foreground">
                    {report?.tournament || '—'}
                  </p>
                  <p className="text-xs font-bold uppercase leading-[1.5] text-muted-foreground">
                    {report?.course || report?.club || '—'}
                    <span className="text-primary">
                      {' '}
                      / {report?.fechaFormato || fecha || '—'}
                    </span>
                  </p>
                  <p className="mt-1 text-[11px] font-semibold leading-[1.5] text-muted-foreground">
                    Hoyos {hi}–{hf} · Horario {hri}–{hrf} · Grupos: {summary.groups} / Jugadores:{' '}
                    {summary.players}
                  </p>
                  <p className="text-[10px] leading-[1.5] text-muted-foreground">
                    Generado: al abrir el reporte
                  </p>
                </div>

                {/* Paginación estimada */}
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                  <dt className="font-semibold text-muted-foreground">Papel</dt>
                  <dd className="font-bold text-foreground">{PAPER_SIZES[paper].label}, horizontal</dd>
                  <dt className="font-semibold text-muted-foreground">Grupos / Jugadores</dt>
                  <dd className="font-bold text-foreground">
                    {summary.groups} / {summary.players}
                  </dd>
                  <dt className="font-semibold text-muted-foreground">Páginas estimadas</dt>
                  <dd className="font-bold text-foreground">
                    {summary.pages} (numeradas “Página X de {summary.pages}”)
                  </dd>
                </dl>

                {summary.groups === 0 && (
                  <p className="text-sm text-destructive">
                    No hay salidas para estos filtros: ajusta el rango de hoyos u horas.
                  </p>
                )}
              </>
            )}

            <DialogFooter>
              <Button
                variant="ghost"
                className="bg-primary/10 hover:bg-primary/20"
                onClick={() => setPreviewOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={generar} disabled={!isValid || summary.groups === 0}>
                <Printer className="mr-2 h-4 w-4" />
                Ver reporte
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminTimeLinePrint;
