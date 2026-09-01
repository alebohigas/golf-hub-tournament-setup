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
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  ClipboardList,
  Clock,
  Eye,
  Loader2,
  Printer,
  Save,
  X,
} from 'lucide-react';
import { useTarjetasCatalogo, useTarjetasReport } from '@/hooks/useTarjetasImpresion';
import { Switch } from '@/components/ui/switch';
import TarjetaHeaderFooterPreview from '@/components/admin/TarjetaHeaderFooterPreview';
import {
  useSiteConfig,
  useSaveSiteConfig,
  type TarjetasPrintConfig,
} from '@/hooks/useSiteConfig';
import { getSuperAdminPassword } from '@/lib/superAdminAuth';
import {
  TARJETA_ROWS_ALL,
  TARJETA_ROWS_DEFAULT,
  TARJETA_ROW_LABELS,
  normalizeTarjetaRows,
  type TarjetaRowKey,
} from '@/lib/tarjetasRows';
import {
  TARJETA_HEADER_ALL,
  TARJETA_HEADER_DEFAULT,
  TARJETA_HEADER_LABELS,
  TARJETA_HEADER_FONTS_DEFAULT,
  clampTarjetaFont,
  normalizeTarjetaHeader,
  type TarjetaHeaderKey,
} from '@/lib/tarjetasHeader';
import {
  TARJETA_HCP_FIELDS,
  TARJETA_HCP_FIELD_DEFAULT,
  TARJETA_HCP_FIELD_LABELS,
  normalizeTarjetaHcpField,
  type TarjetaHcpField,
} from '@/lib/tarjetasHcp';
import { useToast } from '@/hooks/use-toast';
/* Orientación de la hoja carta (vertical/horizontal) y sus predeterminados. */
import {
  TARJETA_ORIENT_DEFAULTS,
  TARJETA_ORIENT_LABELS,
  normalizeTarjetaOrient,
  tarjetaHeaderMaxMm,
  type TarjetaOrient,
} from '@/lib/tarjetasSheet';


/** Panel de impresión de tarjetas. */
const AdminTarjetasPrint = () => {
  /** Catálogo del torneo ACTIVO del sitio (sin selector de torneo). */
  const { data, isLoading } = useTarjetasCatalogo();

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
  /**
   * CATEGORÍA DE REFERENCIA de la vista previa. Cada categoría puede salir por
   * otro hoyo y jugar otra mesa de salida, por lo que su ORDEN DE HOYOS y su
   * PAR son distintos: al elegirla aquí, la previsualización muestra una
   * tarjeta real de esa categoría con su propia tira HOYO / PAR.
   */
  const [refCatId, setRefCatId] = useState('');
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
   * Alto de cada renglón de la tabla de hoyos en mm (Hoyo, Par, Yardas, Par
   * Time, Ventaja, Handicap, Score, Puntos). Se acota automáticamente en el
   * reporte para no perder las 2 tarjetas por hoja carta.
   */
  const [rowMm, setRowMm] = useState(5.5);
  /**
   * Padding-bottom (mm) al final de la tarjeta, debajo del renglón SCORE
   * ANOTADOR. Configurable aquí y enviado al reporte como `pad=` para que
   * la previsualización, la impresión y el PDF sean idénticos.
   */
  const [padMm, setPadMm] = useState(3);

  /**
   * Tamaños de letra (pt) del encabezado de la tarjeta:
   *   · `fsHoyoPt` → hoyo (H01) y hora de salida.
   *   · `fsCatPt`  → nombre de la categoría.
   * Viajan al reporte como `fsh=` y `fsc=` para que la vista previa, la
   * impresión y el PDF usen exactamente el mismo tamaño de letra.
   */
  const [fsHoyoPt, setFsHoyoPt] = useState(TARJETA_HEADER_FONTS_DEFAULT.hoyoPt);
  const [fsCatPt, setFsCatPt] = useState(TARJETA_HEADER_FONTS_DEFAULT.catPt);
  /** Tamaño de letra (pt) del ID + nombre del jugador. Viaja como `fsj=`. */
  const [fsJugPt, setFsJugPt] = useState(TARJETA_HEADER_FONTS_DEFAULT.jugadorPt);

  /**
   * Campo de la BD del que se toma el **HCP. NETO** del encabezado. Viaja al
   * reporte como `hcpfield=` para garantizar que el valor impreso siempre sea
   * el neto (nunca el índice) y que la validación en pantalla lo compare
   * contra la suma de ventajas por hoyo.
   */
  const [hcpField, setHcpField] = useState<TarjetaHcpField>(
    TARJETA_HCP_FIELD_DEFAULT,
  );

  /**
   * Imprimir el logo del torneo en la cabecera de la tarjeta. Viaja al reporte
   * como `logo=1|0` para que vista previa, impresión y PDF coincidan.
   */
  const [showLogo, setShowLogo] = useState(true);

  /**
   * ORIENTACIÓN de la hoja carta: 'portrait' (vertical) u 'landscape'
   * (horizontal). En las dos se imprimen 2 tarjetas por hoja (1/2 hoja cada
   * una) con márgenes y escala predeterminados por orientación, para que los
   * brincos de página nunca se desfasen. Viaja al reporte como `orient=`.
   */
  const [orient, setOrient] = useState<TarjetaOrient>('portrait');

  /**
   * Cambia la orientación y aplica de golpe su maquetación PREDETERMINADA
   * (cabecera, margen, escala, alto de renglón y padding inferior), que es la
   * que garantiza 2 tarjetas por hoja sin desfases.
   */
  const cambiarOrientacion = (value: TarjetaOrient) => {
    setOrient(value);
    const d = TARJETA_ORIENT_DEFAULTS[value];
    setHeaderMm(d.headerMm);
    setMarginMm(d.marginMm);
    setScale(d.scale);
    setRowMm(d.rowMm);
    setPadMm(d.padMm);
  };

  /**
   * Orden (y visibilidad) de los renglones de la tarjeta. Se manda al reporte
   * como `rows=hoyo,yardas,...` para no depender de un orden fijo en el código.
   */
  const [rowOrder, setRowOrder] = useState<TarjetaRowKey[]>([...TARJETA_ROWS_DEFAULT]);

  /**
   * Campos (y orden) del ENCABEZADO de 3 renglones de la tarjeta. Se manda al
   * reporte como `hfields=hoyohora,jugador,...`.
   */
  const [headerOrder, setHeaderOrder] = useState<TarjetaHeaderKey[]>([
    ...TARJETA_HEADER_DEFAULT,
  ]);

  /** Activa/desactiva un campo del encabezado conservando el orden base. */
  const toggleHeaderField = (key: TarjetaHeaderKey) =>
    setHeaderOrder((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : TARJETA_HEADER_ALL.filter((k) => k === key || prev.includes(k)),
    );

  /** Mueve un campo del encabezado una posición a la izquierda/derecha. */
  const moveHeaderField = (key: TarjetaHeaderKey, delta: -1 | 1) =>
    setHeaderOrder((prev) => {
      const i = prev.indexOf(key);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  /** Activa/desactiva un renglón conservando su posición relativa por defecto. */
  const toggleRow = (key: TarjetaRowKey) =>
    setRowOrder((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : TARJETA_ROWS_ALL.filter((k) => k === key || prev.includes(k)),
    );

  /** Mueve un renglón una posición arriba (-1) o abajo (+1). */
  const moveRow = (key: TarjetaRowKey, delta: -1 | 1) =>
    setRowOrder((prev) => {
      const i = prev.indexOf(key);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

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
    if (typeof cfg.rowMm === 'number') setRowMm(cfg.rowMm);
    if (typeof cfg.padMm === 'number') setPadMm(cfg.padMm);
    if (typeof cfg.fsHoyoPt === 'number')
      setFsHoyoPt(clampTarjetaFont(cfg.fsHoyoPt, TARJETA_HEADER_FONTS_DEFAULT.hoyoPt));
    if (typeof cfg.fsCatPt === 'number')
      setFsCatPt(clampTarjetaFont(cfg.fsCatPt, TARJETA_HEADER_FONTS_DEFAULT.catPt));
    if (typeof cfg.fsJugPt === 'number')
      setFsJugPt(clampTarjetaFont(cfg.fsJugPt, TARJETA_HEADER_FONTS_DEFAULT.jugadorPt));
    if (cfg.hcpField) setHcpField(normalizeTarjetaHcpField(cfg.hcpField));
    if (typeof cfg.showLogo === 'boolean') setShowLogo(cfg.showLogo);
    if (cfg.orient) setOrient(normalizeTarjetaOrient(cfg.orient));
    if (cfg.rowOrder) setRowOrder(normalizeTarjetaRows(cfg.rowOrder));
    if (cfg.headerOrder) setHeaderOrder(normalizeTarjetaHeader(cfg.headerOrder));
  }, [siteConfig?.tarjetas_config]);

  /** Guarda la maquetación en la base de datos. */
  const guardarConfig = () => {
    const payload: TarjetasPrintConfig = {
      sistema,
      headerMm,
      marginMm,
      scale,
      rowMm,
      padMm,
      rowOrder,
      headerOrder,
      fsHoyoPt,
      fsCatPt,
      fsJugPt,
      hcpField,
      showLogo,
      orient,
    };
    saveSiteConfig.mutate(
      { password: getSuperAdminPassword(), tarjetas_config: payload },
      {
        onSuccess: () =>
          toast({
            title: 'Maquetación guardada',
            description: `Cabecera ${headerMm} mm · margen ${marginMm} mm · escala ${scale}% · renglón ${rowMm} mm · padding inferior ${padMm} mm.`,
          }),
        onError: (err) =>
          toast({ title: 'Error al guardar', description: err.message, variant: 'destructive' }),
      },
    );
  };




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

  /**
   * La categoría de referencia siempre debe ser una de las seleccionadas: si
   * deja de existir (cambio de día, campo o tipo de juego) se toma la primera.
   */
  useEffect(() => {
    setRefCatId((prev) => (prev && catIds.includes(prev) ? prev : catIds[0] ?? ''));
  }, [catIds]);

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
    /* En horizontal cada tarjeta sólo tiene 107.95 mm: la cabecera se topa a 34 mm. */
    const headerMax = tarjetaHeaderMaxMm(orient === 'landscape');
    if (headerMm < 10 || headerMm > headerMax)
      errs.push(`La cabecera debe estar entre 10 y ${headerMax} mm.`);
    if (marginMm < 0 || marginMm > 25) errs.push('El margen lateral debe estar entre 0 y 25 mm.');
    if (scale < 60 || scale > 130) errs.push('La escala debe estar entre 60% y 130%.');
    if (rowMm < 2.6 || rowMm > 12) errs.push('El alto de renglón debe estar entre 2.6 y 12 mm.');
    if (padMm < 0 || padMm > 15)
      errs.push('El padding inferior debe estar entre 0 y 15 mm.');
    if (!rowOrder.length) errs.push('Selecciona al menos un renglón de la tarjeta.');
    if (!headerOrder.length) errs.push('Selecciona al menos un campo del encabezado.');
    return errs;
  }, [fecha, campoid, catIds, headerMm, marginMm, scale, rowMm, padMm, rowOrder, headerOrder, orient]);

  const isValid = errors.length === 0;

  /** Construye la URL del reporte con filtros + maquetación. */
  const buildUrl = (preview: boolean) =>
    `/admin/tarjetas-impresion?${new URLSearchParams({
      fecha: fechasRango.join(',') || fecha,
      campoid,
      // El reporte siempre usa el torneo activo del sitio.
      catid: catIds.join(','),
      sistema,
      header: String(headerMm),
      margin: String(marginMm),
      scale: String(scale),
      rowh: String(rowMm),
      pad: String(padMm),
      fsh: String(fsHoyoPt),
      fsc: String(fsCatPt),
      fsj: String(fsJugPt),
      hcpfield: hcpField,
      logo: showLogo ? '1' : '0',
      /* Orientación de la hoja: 'portrait' (vertical) o 'landscape'. */
      orient,
      rows: rowOrder.join(','),
      hfields: headerOrder.join(','),
      ...(preview ? { preview: '1' } : {}),
    }).toString()}`;

  /**
   * Datos REALES de la categoría de referencia (un solo día y una sola
   * categoría) para la vista previa: jugador, handicap neto, marcas de salida y
   * los hoyos con su par en el orden de juego de ESA categoría.
   */
  const { data: refReport } = useTarjetasReport({
    fecha,
    catid: refCatId,
    campoid: campoid || undefined,
    sistema,
    hcpfield: hcpField,
  });

  /** Primera tarjeta de la categoría de referencia (o `null` si no hay datos). */
  const refCard = refReport?.cards?.[0] ?? null;

  /** Nombre de la categoría de referencia (informativo en la vista previa). */
  const refCatName = useMemo(
    () => categorias.find((c) => c.id === refCatId)?.name ?? '',
    [categorias, refCatId],
  );

  /** URL de la VISTA POR HORA DE SALIDA (mismos filtros y maquetación). */
  const buildHorasUrl = () =>
    buildUrl(false).replace('/admin/tarjetas-impresion?', '/admin/tarjetas-horas?');

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

              {/*
                ORIENTACIÓN de la hoja carta. Al cambiarla se aplican los
                márgenes, escala, cabecera y alto de renglón PREDETERMINADOS de
                esa orientación, que son los que garantizan 2 tarjetas por hoja
                sin desfases en los brincos de página. Viaja como `orient=`.
              */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Orientación de la hoja</Label>
                <Select
                  value={orient}
                  onValueChange={(v) => cambiarOrientacion(normalizeTarjetaOrient(v))}
                >
                  <SelectTrigger className="w-[290px]">
                    <SelectValue placeholder="Orientación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">{TARJETA_ORIENT_LABELS.portrait}</SelectItem>
                    <SelectItem value="landscape">{TARJETA_ORIENT_LABELS.landscape}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  {orient === 'landscape'
                    ? 'Carta acostada 279.4 × 215.9 mm · cada tarjeta 1/2 hoja (107.95 mm).'
                    : 'Carta vertical 215.9 × 279.4 mm · cada tarjeta 1/2 hoja (139.7 mm).'}
                </p>
              </div>

              {/* Maquetación: cabecera, margen lateral y escala */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Cabecera (mm)</Label>
                <Input
                  type="number"
                  min={10}
                  /* En horizontal la cabecera no puede pasar de 34 mm. */
                  max={tarjetaHeaderMaxMm(orient === 'landscape')}
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

              {/* Alto de renglón: el reporte lo acota para no desbordar 1/2 carta */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Alto de renglón (mm)</Label>
                <Input
                  type="number"
                  step={0.5}
                  min={2.6}
                  max={12}
                  className="w-[130px]"
                  value={rowMm}
                  onChange={(e) => setRowMm(Number(e.target.value))}
                />
              </div>


              {/*
                Padding inferior (mm) debajo del renglón SCORE ANOTADOR.
                Viaja en la URL como `pad=` y el reporte lo descuenta del
                espacio disponible para no salirse de la media hoja carta.
              */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Padding inferior (mm)
                </Label>
                <Input
                  type="number"
                  step={0.5}
                  min={0}
                  max={15}
                  className="w-[130px]"
                  value={padMm}
                  onChange={(e) => setPadMm(Number(e.target.value))}
                />
              </div>

              {/*
                Tamaño de letra (pt) del hoyo + hora de salida en el encabezado.
                Viaja en la URL como `fsh=`.
              */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Letra hoyo y hora (pt)
                </Label>
                <Input
                  type="number"
                  step={0.5}
                  min={6}
                  max={24}
                  className="w-[140px]"
                  value={fsHoyoPt}
                  onChange={(e) => setFsHoyoPt(Number(e.target.value))}
                />
              </div>

              {/*
                Tamaño de letra (pt) del nombre de la categoría. Viaja como `fsc=`.
              */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Letra categoría (pt)
                </Label>
                <Input
                  type="number"
                  step={0.5}
                  min={6}
                  max={24}
                  className="w-[140px]"
                  value={fsCatPt}
                  onChange={(e) => setFsCatPt(Number(e.target.value))}
                />
              </div>

              {/*
                Tamaño de letra (pt) del ID + nombre del jugador. Viaja como `fsj=`.
              */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Letra jugador (pt)
                </Label>
                <Input
                  type="number"
                  step={0.5}
                  min={6}
                  max={24}
                  className="w-[140px]"
                  value={fsJugPt}
                  onChange={(e) => setFsJugPt(Number(e.target.value))}
                />
              </div>

              {/*
                Logo del torneo en la cabecera de la tarjeta: se puede imprimir
                o no. Viaja en la URL como `logo=1|0`.
              */}
              <div className="basis-full">
                <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                  <div>
                    <Label className="text-sm">Imprimir logo del torneo</Label>
                    <p className="text-[11px] text-muted-foreground">
                      Si se desactiva, la cabecera imprime sólo el nombre del
                      torneo, campo y fecha (sin imagen).
                    </p>
                  </div>
                  <Switch checked={showLogo} onCheckedChange={setShowLogo} />
                </div>
              </div>

              {/*
                Campo de la BD para el HCP. NETO. Viaja como `hcpfield=` y el
                reporte marca en pantalla cualquier discrepancia contra el
                neto calculado por ventajas por hoyo.
              */}
              <div className="basis-full space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Campo de HCP. NETO (BD)
                </Label>
                <Select
                  value={hcpField}
                  onValueChange={(v) => setHcpField(normalizeTarjetaHcpField(v))}
                >
                  <SelectTrigger className="w-full max-w-[420px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TARJETA_HCP_FIELDS.map((k) => (
                      <SelectItem key={k} value={k}>
                        {TARJETA_HCP_FIELD_LABELS[k]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Nunca se usa el índice (indexjgo). Con “Mejor coincidencia” se
                  validan hcpneto, handicapneto y vtjajug contra el neto de
                  ventajas por hoyo y se imprime el más cercano. La vista previa
                  avisa si el valor no coincide.
                </p>
                {/*
                  Resumen de la regla activa: qué campo se seleccionó y cómo se
                  resuelve, para no depender de abrir el reporte.
                */}
                <div className="rounded-md border bg-muted/40 p-2 text-[11px] leading-relaxed">
                  <p>
                    <strong>Campo seleccionado:</strong>{' '}
                    {hcpField === 'auto'
                      ? 'Automático (primera columna neta disponible: hcpneto → handicapneto → vtjajug → ventajas)'
                      : hcpField === 'match'
                        ? 'Mejor coincidencia entre hcpneto, handicapneto y vtjajug'
                        : hcpField === 'ventajas'
                          ? 'Suma de ventajas por hoyo'
                          : `Columna ${hcpField}`}
                  </p>
                  <p>
                    <strong>Regla aplicada:</strong>{' '}
                    {hcpField === 'match'
                      ? 'Se compara cada columna neta contra el neto calculado con los golpes de ventaja por hoyo (según la mesa de salida del jugador) y se imprime la de menor diferencia; en empate gana el orden hcpneto → handicapneto → vtjajug; si ninguna existe se usa la suma de ventajas.'
                      : hcpField === 'auto'
                        ? 'Se toma la primera columna neta con valor; si ninguna tiene valor se usa la suma de ventajas por hoyo.'
                        : hcpField === 'ventajas'
                          ? 'Siempre se usa la suma de los golpes de ventaja por hoyo del jugador (mesa de salida registrada).'
                          : 'Siempre se usa la columna elegida; si viene vacía se usa la suma de ventajas por hoyo.'}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    El reporte imprimible muestra, por tarjeta, el campo
                    finalmente usado y su detalle en el <strong>modo
                    auditoría</strong>.
                  </p>
                </div>

              </div>

              {/*
                Orden de renglones de la tarjeta: se guarda en la base y viaja
                en la URL del reporte, así la vista previa, la impresión y el
                PDF usan exactamente la misma maqueta.
              */}
              <div className="basis-full space-y-2 rounded-md border p-3">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs text-muted-foreground">
                    Orden de renglones de la tarjeta
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRowOrder([...TARJETA_ROWS_DEFAULT])}
                  >
                    Restablecer orden
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {rowOrder.map((key, idx) => (
                    <div
                      key={key}
                      className="flex items-center gap-1 rounded-md border bg-muted/40 px-2 py-1 text-xs"
                    >
                      <span className="font-semibold">{idx + 1}.</span>
                      <span className="uppercase">{TARJETA_ROW_LABELS[key]}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={idx === 0}
                        onClick={() => moveRow(key, -1)}
                        aria-label={`Subir ${TARJETA_ROW_LABELS[key]}`}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={idx === rowOrder.length - 1}
                        onClick={() => moveRow(key, 1)}
                        aria-label={`Bajar ${TARJETA_ROW_LABELS[key]}`}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleRow(key)}
                        aria-label={`Quitar ${TARJETA_ROW_LABELS[key]}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Renglones disponibles que no se están imprimiendo */}
                {TARJETA_ROWS_ALL.some((k) => !rowOrder.includes(k)) && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs text-muted-foreground">Agregar:</span>
                    {TARJETA_ROWS_ALL.filter((k) => !rowOrder.includes(k)).map((key) => (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => toggleRow(key)}
                      >
                        + {TARJETA_ROW_LABELS[key]}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/*
                Encabezado de la tarjeta (3 renglones): qué campos se muestran
                y en qué orden (izquierda → derecha). Se guarda en la base y
                viaja en la URL como `hfields=…`.
              */}
              <div className="basis-full space-y-2 rounded-md border p-3">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs text-muted-foreground">
                    Encabezado de la tarjeta (3 renglones)
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setHeaderOrder([...TARJETA_HEADER_DEFAULT])}
                  >
                    Restablecer encabezado
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {headerOrder.map((key, idx) => (
                    <div
                      key={key}
                      className="flex items-center gap-1 rounded-md border bg-muted/40 px-2 py-1 text-xs"
                    >
                      <span className="font-semibold">{idx + 1}.</span>
                      <span>{TARJETA_HEADER_LABELS[key]}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={idx === 0}
                        onClick={() => moveHeaderField(key, -1)}
                        aria-label={`Mover a la izquierda ${TARJETA_HEADER_LABELS[key]}`}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={idx === headerOrder.length - 1}
                        onClick={() => moveHeaderField(key, 1)}
                        aria-label={`Mover a la derecha ${TARJETA_HEADER_LABELS[key]}`}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleHeaderField(key)}
                        aria-label={`Quitar ${TARJETA_HEADER_LABELS[key]}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Campos de encabezado disponibles que no se están usando */}
                {TARJETA_HEADER_ALL.some((k) => !headerOrder.includes(k)) && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs text-muted-foreground">Agregar:</span>
                    {TARJETA_HEADER_ALL.filter((k) => !headerOrder.includes(k)).map((key) => (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => toggleHeaderField(key)}
                      >
                        + {TARJETA_HEADER_LABELS[key]}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/*
                Previsualización EN VIVO del encabezado y del pie de firmas con
                la configuración actual (misma maqueta que impresión y PDF).
              */}
              <div className="basis-full space-y-2 rounded-md border p-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Label className="text-xs text-muted-foreground">
                    Previsualización del encabezado y firmas
                  </Label>
                  {/*
                    Categoría de referencia: define de qué categoría se toman
                    los datos reales, el ORDEN DE HOYOS y el PAR de la vista
                    previa (cada categoría juega su propia mesa de salida).
                  */}
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">
                      Categoría de referencia
                    </Label>
                    <Select
                      value={refCatId}
                      onValueChange={setRefCatId}
                      disabled={!catIds.length}
                    >
                      <SelectTrigger className="h-8 w-[260px] text-xs">
                        <SelectValue placeholder="Elige una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias
                          .filter((c) => catIds.includes(c.id))
                          .map((c) => (
                            <SelectItem key={c.id} value={c.id} className="text-xs">
                              {c.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <TarjetaHeaderFooterPreview
                  headerOrder={headerOrder}
                  rowMm={rowMm}
                  padMm={padMm}
                  marginMm={marginMm}
                  sistema={sistema}
                  headerFonts={{ hoyoPt: fsHoyoPt, catPt: fsCatPt, jugadorPt: fsJugPt }}
                  realCard={refCard}
                  realHoles={refCard?.holes ?? null}
                  refCategoryName={refCatName}
                />
              </div>


              <Button variant="outline" onClick={() => generar(true)} disabled={!isValid}>
                <Eye className="mr-2 h-4 w-4" /> Vista previa
              </Button>
              <Button onClick={() => generar(false)} disabled={!isValid}>
                <Printer className="mr-2 h-4 w-4" /> Generar
              </Button>
              {/*
                Vista por HORA DE SALIDA: lista quiénes juegan en cada hora con
                el mismo diseño del encabezado de la tarjeta, sin abrir la
                tarjeta completa de cada jugador.
              */}
              <Button
                variant="outline"
                onClick={() => window.open(buildHorasUrl(), '_blank')}
                disabled={!isValid}
              >
                <Clock className="mr-2 h-4 w-4" /> Por hora de salida
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
