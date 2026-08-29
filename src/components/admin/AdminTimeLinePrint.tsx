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
import { AlertCircle, Clock, Loader2, Printer } from 'lucide-react';
import { useSalidasImpresionDays } from '@/hooks/useSalidasImpresion';
import { useTorneoId } from '@/hooks/useTorneoId';
import { API_BASE_URL } from '@/config/api';

/** Expresión de hora válida en formato 24h HH:MM (00:00 – 23:59). */
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Convierte "HH:MM" a minutos desde medianoche; -1 si el formato es inválido. */
const toMinutes = (t: string): number => {
  const m = TIME_RE.exec(t.trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : -1;
};

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

  /** Validación del formulario (hoyos 1–18 ordenados, horas HH:MM ordenadas). */
  const errors = useMemo<string[]>(() => {
    const errs: string[] = [];
    if (!fecha) errs.push('Selecciona el día de juego.');
    if (!campoid) errs.push('Selecciona el campo.');

    const nHi = Number(hi);
    const nHf = Number(hf);
    if (!Number.isInteger(nHi) || nHi < 1 || nHi > 18)
      errs.push('El hoyo inicial debe ser un número entero entre 1 y 18.');
    if (!Number.isInteger(nHf) || nHf < 1 || nHf > 18)
      errs.push('El hoyo final debe ser un número entero entre 1 y 18.');
    if (Number.isInteger(nHi) && Number.isInteger(nHf) && nHi > nHf)
      errs.push('El hoyo inicial debe ser menor o igual al hoyo final.');

    const mIni = toMinutes(hri);
    const mFin = toMinutes(hrf);
    if (mIni < 0) errs.push('La hora inicial no tiene un formato válido (HH:MM, 24 horas).');
    if (mFin < 0) errs.push('La hora final no tiene un formato válido (HH:MM, 24 horas).');
    if (mIni >= 0 && mFin >= 0 && mIni > mFin)
      errs.push('La hora inicial debe ser anterior o igual a la hora final.');

    return errs;
  }, [fecha, campoid, hi, hf, hri, hrf]);

  const isValid = errors.length === 0;

  /** Abre el reporte imprimible en una pestaña nueva. */
  const generar = () => {
    if (!isValid) return;
    const qs = new URLSearchParams({ fecha, campoid, hi, hf, hri, hrf }).toString();
    window.open(`/admin/time-line?${qs}`, '_blank');
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

            {/* Acción */}
            <Button onClick={generar} disabled={!isValid}>
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
      </CardContent>
    </Card>
  );
};

export default AdminTimeLinePrint;
