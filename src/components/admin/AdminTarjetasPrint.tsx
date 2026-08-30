/**
 * AdminTarjetasPrint — Admin → pestaña "Tarjetas"
 * -----------------------------------------------------------------------------
 * Formulario para generar la impresión de TARJETAS de juego:
 *   - Fecha (día de juego)
 *   - Campo (se deduce del día; editable si hay varios)
 *   - Categorías (una, varias o todas; Stroke Play y Stableford)
 *
 * El botón GENERAR abre `/admin/tarjetas-impresion` con los filtros en la URL,
 * donde el reporte se imprime a tamaño carta con 2 tarjetas por hoja.
 */

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, ClipboardList, Loader2, Printer } from 'lucide-react';
import { useTarjetasCatalogo } from '@/hooks/useTarjetasImpresion';

/** Panel de impresión de tarjetas. */
const AdminTarjetasPrint = () => {
  const { data, isLoading } = useTarjetasCatalogo();
  const days = data?.days ?? [];

  // ============= Estado del formulario =============
  const [fecha, setFecha] = useState('');
  const [campoid, setCampoid] = useState('');
  /** IDs de categorías seleccionadas. */
  const [catIds, setCatIds] = useState<string[]>([]);
  /** Tipo de juego a imprimir: auto (por categoría), stroke o stableford. */
  const [sistema, setSistema] = useState<'auto' | 'stroke' | 'stableford'>('auto');
  /** Alto de la cabecera superior en mm (3 cm por defecto). */
  const [headerMm, setHeaderMm] = useState(30);
  /** Margen lateral de la tarjeta en mm. */
  const [marginMm, setMarginMm] = useState(8);
  /** Escala del contenido de la tarjeta en % (mantiene el acomodo estable). */
  const [scale, setScale] = useState(100);

  /** Clave de persistencia local de la configuración de maquetación. */
  const LS_KEY = 'tarjetas-print-config';

  /** Carga la configuración guardada. */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const cfg = JSON.parse(raw) as Partial<{
        sistema: 'auto' | 'stroke' | 'stableford';
        headerMm: number;
        marginMm: number;
        scale: number;
      }>;
      if (cfg.sistema) setSistema(cfg.sistema);
      if (cfg.headerMm) setHeaderMm(cfg.headerMm);
      if (typeof cfg.marginMm === 'number') setMarginMm(cfg.marginMm);
      if (cfg.scale) setScale(cfg.scale);
    } catch {
      /* configuración corrupta: se ignora */
    }
  }, []);

  /** Persiste la configuración de maquetación. */
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ sistema, headerMm, marginMm, scale }));
  }, [sistema, headerMm, marginMm, scale]);

  /** Precarga el primer día disponible. */
  useEffect(() => {
    if (!fecha && days.length > 0) {
      setFecha(days[0].fecha);
      setCampoid(days[0].campoid);
    }
  }, [days, fecha]);

  /** Fechas únicas del catálogo. */
  const fechas = useMemo(
    () => Array.from(new Set(days.map((d) => d.fecha))),
    [days],
  );

  /** Campos disponibles para la fecha elegida. */
  const camposDeFecha = useMemo(() => days.filter((d) => d.fecha === fecha), [days, fecha]);

  /** Categorías del día + campo elegidos (sin duplicados, ordenadas). */
  const categorias = useMemo(() => {
    const day = days.find((d) => d.fecha === fecha && d.campoid === campoid);
    const list = day?.categories ?? camposDeFecha.flatMap((d) => d.categories);
    const seen = new Map<string, (typeof list)[number]>();
    list.forEach((c) => seen.set(c.id, c));
    return Array.from(seen.values())
      .filter((c) => {
        if (sistema === 'stroke') return !c.system.toUpperCase().includes('STABLE');
        if (sistema === 'stableford') return c.system.toUpperCase().includes('STABLE');
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }, [days, fecha, campoid, camposDeFecha, sistema]);

  /** Al cambiar día/campo/tipo se seleccionan todas las categorías por defecto. */
  useEffect(() => {
    setCatIds(categorias.map((c) => c.id));
  }, [categorias]);

  /** Alterna una categoría de la selección. */
  const toggleCat = (id: string) =>
    setCatIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  /** Errores de validación del formulario. */
  const errors = useMemo<string[]>(() => {
    const errs: string[] = [];
    if (!fecha) errs.push('Selecciona el día de juego.');
    if (!campoid) errs.push('Selecciona el campo.');
    if (!catIds.length) errs.push('Selecciona al menos una categoría.');
    if (headerMm < 10 || headerMm > 60) errs.push('La cabecera debe estar entre 10 y 60 mm.');
    if (marginMm < 0 || marginMm > 25) errs.push('El margen lateral debe estar entre 0 y 25 mm.');
    if (scale < 60 || scale > 130) errs.push('La escala debe estar entre 60% y 130%.');
    return errs;
  }, [fecha, campoid, catIds, headerMm, marginMm, scale]);

  const isValid = errors.length === 0;

  /** Construye la URL del reporte con filtros + maquetación. */
  const buildUrl = (preview: boolean) =>
    `/admin/tarjetas-impresion?${new URLSearchParams({
      fecha,
      campoid,
      catid: catIds.join(','),
      sistema,
      header: String(headerMm),
      margin: String(marginMm),
      scale: String(scale),
      ...(preview ? { preview: '1' } : {}),
    }).toString()}`;

  /** Abre el reporte imprimible en una pestaña nueva. */
  const generar = (preview = false) => {
    if (!isValid) return;
    window.open(buildUrl(preview), '_blank');
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Impresión de Tarjetas
        </CardTitle>
        <CardDescription>
          Genera las tarjetas de juego (Stroke Play o Stableford) por día y categoría. Se imprimen
          a tamaño carta, 2 tarjetas por hoja, con 3 cm de cabecera para el nombre del torneo,
          el campo y la fecha.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando días de juego…
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-end gap-4">
              {/* Fecha */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Fecha</Label>
                <Select
                  value={fecha}
                  onValueChange={(v) => {
                    setFecha(v);
                    const match = days.find((d) => d.fecha === v);
                    if (match) setCampoid(match.campoid);
                  }}
                >
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="Día de juego" />
                  </SelectTrigger>
                  <SelectContent>
                    {fechas.map((f) => (
                      <SelectItem key={f} value={f}>
                        {days.find((d) => d.fecha === f)?.fechaFormato || f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Campo */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Campo</Label>
                <Select value={campoid} onValueChange={setCampoid}>
                  <SelectTrigger className="w-[240px]">
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
              </div>

              {/* Tipo de juego: auto por categoría, o forzado */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Tipo de juego</Label>
                <Select
                  value={sistema}
                  onValueChange={(v) => setSistema(v as 'auto' | 'stroke' | 'stableford')}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automático (por categoría)</SelectItem>
                    <SelectItem value="stroke">Stroke Play</SelectItem>
                    <SelectItem value="stableford">Stableford</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Maquetación: cabecera, margen lateral y escala */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Cabecera (mm)</Label>
                <Input
                  type="number"
                  min={10}
                  max={60}
                  className="w-[110px]"
                  value={headerMm}
                  onChange={(e) => setHeaderMm(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Margen lateral (mm)</Label>
                <Input
                  type="number"
                  min={0}
                  max={25}
                  className="w-[130px]"
                  value={marginMm}
                  onChange={(e) => setMarginMm(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Escala (%)</Label>
                <Input
                  type="number"
                  min={60}
                  max={130}
                  className="w-[110px]"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                />
              </div>

              <Button variant="outline" onClick={() => generar(true)} disabled={!isValid}>
                <Eye className="mr-2 h-4 w-4" /> Vista previa
              </Button>
              <Button onClick={() => generar(false)} disabled={!isValid}>
                <Printer className="mr-2 h-4 w-4" /> Generar
              </Button>
            </div>


            {/* Selección de categorías */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <Label className="text-xs text-muted-foreground">Categorías</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCatIds(categorias.map((c) => c.id))}
                >
                  Todas
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCatIds([])}>
                  Ninguna
                </Button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {categorias.map((c) => (
                  <label
                    key={c.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm"
                  >
                    <Checkbox
                      checked={catIds.includes(c.id)}
                      onCheckedChange={() => toggleCat(c.id)}
                    />
                    <span className="flex-1">
                      {c.name}
                      <span className="ml-1 text-xs text-muted-foreground">({c.system})</span>
                    </span>
                  </label>
                ))}
                {!categorias.length && (
                  <p className="text-sm text-muted-foreground">
                    No hay categorías con salidas capturadas para este día.
                  </p>
                )}
              </div>
            </div>

            {/* Errores de validación */}
            {!isValid && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
                <ul className="list-inside list-disc space-y-1">
                  {errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminTarjetasPrint;
