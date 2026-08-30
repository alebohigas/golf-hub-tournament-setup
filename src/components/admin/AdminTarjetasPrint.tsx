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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  AlertCircle,
  ChevronsUpDown,
  ClipboardList,
  Eye,
  Loader2,
  Printer,
  Save,
  X,
} from 'lucide-react';
import { useTarjetasCatalogo, useTarjetasTorneos } from '@/hooks/useTarjetasImpresion';
import {
  useSiteConfig,
  useSaveSiteConfig,
  type TarjetasPrintConfig,
} from '@/hooks/useSiteConfig';
import { getSuperAdminPassword } from '@/lib/superAdminAuth';
import { useToast } from '@/hooks/use-toast';


/** Panel de impresión de tarjetas. */
const AdminTarjetasPrint = () => {
  /** Torneo elegido ('' = torneo activo del dominio). */
  const [torneoid, setTorneoid] = useState('');
  const { data: torneosData } = useTarjetasTorneos();
  const torneos = torneosData?.tournaments ?? [];
  const { data, isLoading } = useTarjetasCatalogo(torneoid || undefined);
  const days = data?.days ?? [];
  const { data: siteConfig } = useSiteConfig();
  const saveSiteConfig = useSaveSiteConfig();
  const { toast } = useToast();

  // ============= Estado del formulario =============
  const [fecha, setFecha] = useState('');
  /** Fecha final del rango ('' = un solo día). */
  const [fechaFin, setFechaFin] = useState('');
  const [campoid, setCampoid] = useState('');
  /** IDs de categorías seleccionadas. */
  const [catIds, setCatIds] = useState<string[]>([]);
  /** Estado abierto/cerrado del multiselector de categorías. */
  const [catsOpen, setCatsOpen] = useState(false);
  /** Tipo de juego a imprimir: auto (por categoría), stroke o stableford. */
  const [sistema, setSistema] = useState<'auto' | 'stroke' | 'stableford'>('auto');
  /** Alto de la cabecera superior en mm (3 cm por defecto). */
  const [headerMm, setHeaderMm] = useState(30);
  /** Margen lateral de la tarjeta en mm. */
  const [marginMm, setMarginMm] = useState(8);
  /** Escala del contenido de la tarjeta en % (mantiene el acomodo estable). */
  const [scale, setScale] = useState(100);

  /**
   * Hidrata la maquetación desde la base (`site_config.tarjetas_config`).
   * Ya no se usa localStorage: la configuración es la misma en cualquier
   * navegador o dispositivo.
   */
  useEffect(() => {
    const cfg = siteConfig?.tarjetas_config;
    if (!cfg) return;
    if (cfg.sistema) setSistema(cfg.sistema);
    if (typeof cfg.headerMm === 'number') setHeaderMm(cfg.headerMm);
    if (typeof cfg.marginMm === 'number') setMarginMm(cfg.marginMm);
    if (typeof cfg.scale === 'number') setScale(cfg.scale);
  }, [siteConfig?.tarjetas_config]);

  /** Guarda la maquetación en la base de datos. */
  const guardarConfig = () => {
    const payload: TarjetasPrintConfig = { sistema, headerMm, marginMm, scale };
    saveSiteConfig.mutate(
      { password: getSuperAdminPassword(), tarjetas_config: payload },
      {
        onSuccess: () =>
          toast({
            title: 'Maquetación guardada',
            description: `Cabecera ${headerMm} mm · margen ${marginMm} mm · escala ${scale}%.`,
          }),
        onError: (err) =>
          toast({ title: 'Error al guardar', description: err.message, variant: 'destructive' }),
      },
    );
  };


  /** Al cambiar de torneo se limpian fecha/campo para recargar el catálogo. */
  useEffect(() => {
    setFecha('');
    setFechaFin('');
    setCampoid('');
  }, [torneoid]);

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

  /**
   * Al cambiar día/campo/tipo se conserva la selección que siga siendo válida;
   * si no queda ninguna (o es la primera carga) se marcan todas.
   */
  useEffect(() => {
    setCatIds((prev) => {
      const validos = categorias.map((c) => c.id);
      const conservados = prev.filter((id) => validos.includes(id));
      return conservados.length ? conservados : validos;
    });
  }, [categorias]);

  /** Texto del botón multiselector: "Todas", "N de M" o el nombre único. */
  const catsLabel = useMemo(() => {
    if (!categorias.length) return 'Sin categorías';
    if (catIds.length === categorias.length) return `Todas las categorías (${categorias.length})`;
    if (!catIds.length) return 'Ninguna categoría';
    if (catIds.length === 1) {
      return categorias.find((c) => c.id === catIds[0])?.name ?? '1 categoría';
    }
    return `${catIds.length} de ${categorias.length} categorías`;
  }, [categorias, catIds]);

  /** Alterna una categoría de la selección. */
  const toggleCat = (id: string) =>
    setCatIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  /**
   * Días incluidos en el reporte: la fecha inicial y, si se eligió una fecha
   * final, todos los días del catálogo entre ambas (inclusive).
   */
  const fechasRango = useMemo(() => {
    if (!fecha) return [] as string[];
    if (!fechaFin || fechaFin === fecha) return [fecha];
    const [a, b] = fecha <= fechaFin ? [fecha, fechaFin] : [fechaFin, fecha];
    return fechas.filter((f) => f >= a && f <= b);
  }, [fecha, fechaFin, fechas]);

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
      fecha: fechasRango.join(',') || fecha,
      campoid,
      ...(torneoid ? { torneoid } : {}),
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
              {/* Torneo: activo del dominio o cualquier otro con calendario */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Torneo</Label>
                <Select
                  value={torneoid || 'activo'}
                  onValueChange={(v) => setTorneoid(v === 'activo' ? '' : v)}
                >
                  <SelectTrigger className="w-[260px]">
                    <SelectValue placeholder="Torneo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Torneo activo del sitio</SelectItem>
                    {torneos.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.year ? `${t.year} · ` : ''}
                        {t.name || `Torneo ${t.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

              {/* Fecha final del rango (opcional) */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Hasta (opcional)</Label>
                <Select
                  value={fechaFin || 'uno'}
                  onValueChange={(v) => setFechaFin(v === 'uno' ? '' : v)}
                >
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="Un solo día" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uno">Solo ese día</SelectItem>
                    {fechas
                      .filter((f) => f >= fecha)
                      .map((f) => (
                        <SelectItem key={`fin-${f}`} value={f}>
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
              <Button
                variant="secondary"
                onClick={guardarConfig}
                disabled={!isValid || saveSiteConfig.isPending}
              >
                <Save className="mr-2 h-4 w-4" /> Guardar maquetación
              </Button>
            </div>


            {/*
              Multiselector de categorías: lista con búsqueda dentro de un
              Popover. Solo aparecen las categorías compatibles con el tipo de
              juego elegido (todas cuando el tipo es "Automático").
            */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <Label className="text-xs text-muted-foreground">Categorías</Label>
                <Popover open={catsOpen} onOpenChange={setCatsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[320px] justify-between"
                      disabled={!categorias.length}
                    >
                      <span className="truncate">{catsLabel}</span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[320px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar categoría…" />
                      <CommandList className="max-h-72">
                        <CommandEmpty>Sin coincidencias.</CommandEmpty>
                        <CommandGroup>
                          {categorias.map((c) => (
                            <CommandItem
                              key={c.id}
                              value={`${c.name} ${c.system}`}
                              onSelect={() => toggleCat(c.id)}
                              className="gap-2"
                            >
                              <Checkbox
                                checked={catIds.includes(c.id)}
                                className="pointer-events-none"
                              />
                              <span className="flex-1 truncate">{c.name}</span>
                              <span className="text-xs text-muted-foreground">{c.system}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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

              {/* Resumen de lo seleccionado (clic en la X para quitar) */}
              <div className="flex flex-wrap gap-2">
                {categorias
                  .filter((c) => catIds.includes(c.id))
                  .map((c) => (
                    <Badge
                      key={`sel-${c.id}`}
                      variant="secondary"
                      className="cursor-pointer gap-1"
                      onClick={() => toggleCat(c.id)}
                    >
                      {c.name}
                      <X className="h-3 w-3" />
                    </Badge>
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
