/**
 * AdminTarjetasImpresion — /admin/tarjetas-impresion
 * -----------------------------------------------------------------------------
 * Reporte imprimible de TARJETAS de juego (Stroke Play / Stableford).
 *
 * FILTROS (por query string, los manda Admin → pestaña "Tarjetas"):
 *   ?fecha=2026-04-30&catid=6337[,6338][&campoid=27]
 *   &header=30        → alto de la cabecera superior en mm (3 cm por defecto)
 *   &margin=8         → margen lateral/inferior en mm
 *   &scale=100        → escala del contenido de la tarjeta en %
 *   &sistema=auto     → auto | stroke | stableford (filtra por tipo de juego)
 *   &preview=1        → abre automáticamente la vista previa paginada
 *
 * DISEÑO DE IMPRESIÓN (tamaño carta, 2 tarjetas por hoja)
 *   - Cada hoja se divide en dos mitades iguales (139.7 mm).
 *   - Cada mitad abre con una cabecera configurable (3 cm por defecto) con:
 *       · izquierda: logo del torneo (`torneo.logo_header`)
 *       · derecha:   nombre del torneo (renglón 1) y campo + fecha (renglón 2)
 *   - Debajo de la cabecera va la tarjeta completa del jugador.
 *   - La fecha "universal" del reporte legacy NO se repite dentro de la tarjeta.
 *
 * La vista previa rasteriza cada hoja con html2canvas (misma geometría que la
 * impresión) y el PDF se arma con jsPDF a tamaño carta, una hoja por página.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Download, Eye, Loader2, Printer } from 'lucide-react';
import { useTarjetasReport, type TarjetaCard } from '@/hooks/useTarjetasImpresion';

// ============= Constantes de hoja =============

/** Alto de media hoja carta (279.4 mm / 2). */
const HALF_SHEET_MM = 139.7;
/** Ancho de hoja carta. */
const SHEET_W_MM = 215.9;
/** Alto de hoja carta. */
const SHEET_H_MM = 279.4;

/** Renglones de la tabla de hoyos (Hoyo, Par, Yardas, Par Time, Ventaja, Handicap, Score, Puntos). */
const TABLE_ROWS = 8;
/** Alto aproximado del bloque de datos del jugador + pie de firmas, en mm. */
const CARD_CHROME_MM = 22;

/**
 * Alto máximo permitido por renglón para que la tarjeta NUNCA se desborde de
 * la media hoja carta (incluye cabecera configurable y escala aplicada).
 */
const maxRowMm = (headerMm: number, scale: number) => {
  const disponible = (HALF_SHEET_MM - headerMm) / scale - CARD_CHROME_MM;
  return Math.max(3, disponible / TABLE_ROWS);
};

/** Lee un número de la URL acotado a un rango. */
const numParam = (v: string | null, def: number, min: number, max: number) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, n));
};

// ============= Subcomponentes =============

/**
 * Cabecera superior de cada tarjeta (3 cm por defecto): logo del torneo a la
 * izquierda y, alineados a la derecha, el nombre del torneo y el campo + fecha.
 */
const CardHeader = ({
  logo,
  tournament,
  course,
  fecha,
  heightMm,
}: {
  logo: string;
  tournament: string;
  course: string;
  fecha: string;
  heightMm: number;
}) => (
  <div
    className="flex items-center justify-between gap-3 px-2"
    style={{ height: `${heightMm}mm` }}
  >
    {/* Logo del torneo (list1_logo_header) */}
    <div className="flex h-full items-center">
      {logo ? (
        <img
          src={logo}
          alt={tournament}
          className="w-auto object-contain"
          style={{ maxHeight: `${Math.max(10, heightMm - 6)}mm` }}
          loading="eager"
          crossOrigin="anonymous"
        />
      ) : null}
    </div>

    {/* Torneo / campo + fecha, ajustados a la derecha */}
    <div className="text-right leading-tight">
      <div className="text-[12pt] font-bold uppercase">{tournament}</div>
      <div className="text-[10pt] font-semibold uppercase text-foreground/80">
        {course}
        {course && fecha ? ' · ' : ''}
        {fecha}
      </div>
    </div>
  </div>
);

/** Celda de la tabla de la tarjeta con bordes finos uniformes. */
const Cell = ({
  children,
  className = '',
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <td className={`border border-foreground/60 px-0 text-center align-middle ${className}`}>
    {children}
  </td>
);

/**
 * ANCHOS DE COLUMNA (en % del ancho útil de la tarjeta).
 * Se fijan con <colgroup> + table-fixed para que el contenido NUNCA se recorte
 * al imprimir: la etiqueta tiene su propio ancho y los 18 hoyos + V1/V2/TOTAL
 * reparten el resto de forma exacta (suma = 100%).
 */
const COL_LABEL_PCT = 10.6;
const COL_TOTAL_PCT = 5.6;
const COL_HOLE_PCT = (100 - COL_LABEL_PCT - COL_TOTAL_PCT * 3) / 18;

/** <colgroup> compartido por la vista previa, la impresión y el PDF. */
const ColGroup = () => (
  <colgroup>
    <col style={{ width: `${COL_LABEL_PCT}%` }} />
    {Array.from({ length: 9 }, (_, i) => (
      <col key={`co-${i}`} style={{ width: `${COL_HOLE_PCT}%` }} />
    ))}
    <col style={{ width: `${COL_TOTAL_PCT}%` }} />
    {Array.from({ length: 9 }, (_, i) => (
      <col key={`ci-${i}`} style={{ width: `${COL_HOLE_PCT}%` }} />
    ))}
    <col style={{ width: `${COL_TOTAL_PCT}%` }} />
    <col style={{ width: `${COL_TOTAL_PCT}%` }} />
  </colgroup>
);

/**
 * Tarjeta de un jugador: encabezado de datos + tabla de 18 hoyos con las
 * columnas acumuladas V1 (ida), V2 (vuelta) y TOTAL.
 *
 * @param rows Orden de renglones configurado en Admin → Tarjetas.
 */
const Scorecard = ({
  card,
  rowMm,
  rows,
}: {
  card: TarjetaCard;
  rowMm: number;
  rows: TarjetaRowKey[];
}) => {
  const out = card.holes.slice(0, 9);
  const inn = card.holes.slice(9, 18);
  const t = card.totals;

  /** Renglón de datos: etiqueta + 9 hoyos + V1 + 9 hoyos + V2 + TOTAL. */
  const Row = ({
    label,
    value,
    outTotal,
    inTotal,
    total,
    head = false,
  }: {
    label: string;
    value: (h: TarjetaCard['holes'][number]) => React.ReactNode;
    outTotal?: React.ReactNode;
    inTotal?: React.ReactNode;
    total?: React.ReactNode;
    head?: boolean;
  }) => (
    /* El alto de cada renglón es configurable (rowMm) sin salir de 1/2 carta. */
    <tr
      className={head ? 'bg-muted/60 font-bold' : ''}
      style={{ height: `${rowMm}mm` }}
    >
      <Cell className="truncate px-1 text-left text-[6pt] font-semibold uppercase">
        {label}
      </Cell>
      {out.map((h) => (
        <Cell key={`o-${h.numero}`}>{value(h)}</Cell>
      ))}
      <Cell className={head ? '' : 'bg-muted/60 font-bold'}>{outTotal}</Cell>
      {inn.map((h) => (
        <Cell key={`i-${h.numero}`}>{value(h)}</Cell>
      ))}
      <Cell className={head ? '' : 'bg-muted/60 font-bold'}>{inTotal}</Cell>
      <Cell className={head ? '' : 'bg-muted/60 font-bold'}>{total}</Cell>
    </tr>
  );

  /** Definición de cada renglón disponible (se pinta según el orden pedido). */
  const rowDefs: Record<TarjetaRowKey, React.ReactNode> = {
    hoyo: (
      <Row
        key="hoyo"
        head
        label={TARJETA_ROW_LABELS.hoyo}
        value={(h) => h.numero}
        outTotal="V1"
        inTotal="V2"
        total="TOTAL"
      />
    ),
    par: (
      <Row key="par" label={TARJETA_ROW_LABELS.par} value={(h) => h.par ?? ''} />
    ),
    yardas: (
      <Row
        key="yardas"
        label={TARJETA_ROW_LABELS.yardas}
        value={(h) => h.yardas ?? ''}
        outTotal={t.yardasOut}
        inTotal={t.yardasIn}
        total={t.yardas}
      />
    ),
    partime: (
      <Row key="partime" label={TARJETA_ROW_LABELS.partime} value={(h) => h.parTime} />
    ),
    ventaja: (
      <Row key="ventaja" label={TARJETA_ROW_LABELS.ventaja} value={(h) => h.ventaja ?? ''} />
    ),
    /* Renglones en blanco para anotar */
    gross: <Row key="gross" label={TARJETA_ROW_LABELS.gross} value={() => ''} />,
    handicap: (
      <Row
        key="handicap"
        label={TARJETA_ROW_LABELS.handicap}
        value={(h) => (h.handicap > 0 ? h.handicap : '')}
        outTotal={t.handicapOut}
        inTotal={t.handicapIn}
        total={t.handicap}
      />
    ),
    neto: <Row key="neto" label={TARJETA_ROW_LABELS.neto} value={() => ''} />,
    puntos: <Row key="puntos" label={TARJETA_ROW_LABELS.puntos} value={() => ''} />,
  };

  return (
    <div className="border border-foreground/70">
      {/* ---------- Encabezado de datos del jugador ---------- */}
      <div className="flex items-stretch justify-between border-b border-foreground/70 text-[8pt]">
        {/* Hoyo + hora de salida y color del tee */}
        <div className="flex w-[30mm] flex-col justify-center border-r border-foreground/70 px-1 py-1 leading-tight">
          <div className="font-bold">
            H{String(card.hole ?? 1).padStart(2, '0')} {card.time}
          </div>
          <div className="uppercase text-foreground/80">{card.tee}</div>
        </div>

        {/* Número y nombre del jugador */}
        <div className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1">
          <span className="font-bold">{card.playerNumber}</span>
          <span className="truncate font-bold uppercase">{card.name}</span>
        </div>

        {/* Ventaja total */}
        <div className="flex w-[14mm] flex-col items-center justify-center border-l border-foreground/70 py-1 leading-none">
          <span className="text-[5.5pt] uppercase text-foreground/70">Vtja</span>
          <span className="text-[10pt] font-bold">{card.hcp}</span>
        </div>

        {/* Categoría + club */}
        <div className="flex w-[46mm] min-w-0 flex-col justify-center border-l border-foreground/70 px-1 py-1 text-right leading-tight">
          <div className="truncate font-bold uppercase">
            {card.shortName || card.categoryName}
          </div>
          <div className="truncate uppercase text-foreground/80">{card.club}</div>
        </div>
      </div>

      {/* ---------- Tabla de hoyos (orden configurable desde Admin) ---------- */}
      <table className="w-full table-fixed border-collapse text-[7pt] leading-none">
        <ColGroup />
        <tbody>{rows.map((key) => rowDefs[key])}</tbody>
      </table>

      {/* ---------- Pie: club sede, folio y firmas ---------- */}
      <div className="flex items-end justify-between gap-2 border-t border-foreground/70 px-2 pb-1 pt-2 text-[6.5pt] uppercase">
        <div className="truncate font-semibold">{card.categoryName}</div>
        <div className="flex-1 border-b border-foreground/60 text-center">Anotador</div>
        <div className="flex-1 border-b border-foreground/60 text-center">Firma jugador</div>
        <div className="whitespace-nowrap font-semibold">Folio {card.folio || '—'}</div>
      </div>
    </div>
  );
};

// ============= Página =============

/** Página imprimible con 2 tarjetas por hoja carta + vista previa y PDF. */
const AdminTarjetasImpresion = () => {
  const [params] = useSearchParams();

  /** Configuración de maquetación (viene de Admin y se puede fijar en la URL). */
  const headerMm = numParam(params.get('header'), 30, 10, 60);
  const marginMm = numParam(params.get('margin'), 8, 0, 25);
  const scale = numParam(params.get('scale'), 100, 60, 130) / 100;
  const sistema = (params.get('sistema') ?? 'auto').toLowerCase();
  const autoPreview = params.get('preview') === '1';

  /**
   * Alto de renglón pedido (`rowh`, mm) acotado al máximo que cabe en la media
   * hoja: así se pueden hacer más altos los renglones sin desplazar la tarjeta.
   */
  const rowMm = Math.min(
    numParam(params.get('rowh'), 5.5, 3, 12),
    maxRowMm(headerMm, scale),
  );

  /**
   * Filtros de datos. `fecha` puede traer varios días separados por coma
   * (rango). El torneo NO se manda: el backend usa siempre el torneo ACTIVO
   * del sitio (`site_config.torneoid`) para evitar inconsistencias.
   */
  const filters = useMemo(
    () => ({
      fecha: params.get('fecha') ?? '',
      catid: params.get('catid') ?? '',
      campoid: params.get('campoid') ?? undefined,
      sistema,
    }),
    [params, sistema],
  );

  const { data, isLoading, error } = useTarjetasReport(filters);



  /** Tarjetas del reporte, filtradas por tipo de juego si se pidió uno. */
  const cards = useMemo(() => {
    const all = data?.cards ?? [];
    if (sistema === 'stroke') return all.filter((c) => !c.system.includes('STABLE'));
    if (sistema === 'stableford') return all.filter((c) => c.system.includes('STABLE'));
    return all;
  }, [data, sistema]);

  /** Tarjetas agrupadas en pares: cada par es una hoja carta. */
  const sheets = useMemo(() => {
    const out: TarjetaCard[][] = [];
    for (let i = 0; i < cards.length; i += 2) out.push(cards.slice(i, i + 2));
    return out;
  }, [cards]);

  // ============= Vista previa + PDF =============

  /** Contenedor de las hojas (fuente de verdad para rasterizar). */
  const sheetsRef = useRef<HTMLDivElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPages, setPreviewPages] = useState<string[]>([]);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [busy, setBusy] = useState<'preview' | 'pdf' | null>(null);
  const autoRan = useRef(false);

  /** Rasteriza cada hoja a PNG con html2canvas (una imagen por página). */
  const renderPages = useCallback(
    async (pixelScale: number) => {
      const root = sheetsRef.current;
      if (!root) return [] as string[];
      const { default: html2canvas } = await import('html2canvas');
      const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-sheet]'));
      const pages: string[] = [];
      for (const node of nodes) {
        /*
          Se rasteriza el MISMO nodo de la hoja con su geometría exacta en px
          (215.9 × 279.4 mm) para que el PDF no reflowee: mismo CSS de
          impresión, misma cabecera superior y mismos márgenes laterales.
        */
        const canvas = await html2canvas(node, {
          scale: pixelScale,
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false,
          width: node.offsetWidth,
          height: node.offsetHeight,
          windowWidth: node.offsetWidth,
          scrollX: 0,
          scrollY: 0,
        });
        pages.push(canvas.toDataURL('image/png'));
      }
      return pages;
    },
    [],
  );

  /** Abre la vista previa paginada (misma geometría que la impresión). */
  const openPreview = useCallback(async () => {
    if (!sheets.length) return;
    setBusy('preview');
    try {
      const pages = await renderPages(1.4);
      setPreviewPages(pages);
      setPreviewIdx(0);
      setPreviewOpen(true);
    } finally {
      setBusy(null);
    }
  }, [renderPages, sheets.length]);

  /** Descarga el reporte como PDF tamaño carta (1 hoja = 1 página). */
  const downloadPdf = useCallback(async () => {
    if (!sheets.length) return;
    setBusy('pdf');
    try {
      const { jsPDF } = await import('jspdf');
      const pages = await renderPages(2.5);
      const pdf = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });
      pages.forEach((img, i) => {
        if (i > 0) pdf.addPage('letter', 'portrait');
        pdf.addImage(img, 'PNG', 0, 0, SHEET_W_MM, SHEET_H_MM, undefined, 'FAST');
      });
      pdf.save(`tarjetas-${filters.fecha || 'reporte'}.pdf`);
    } finally {
      setBusy(null);
    }
  }, [renderPages, sheets.length, filters.fecha]);

  /**
   * Prepara la vista previa en cuanto hay tarjetas del torneo activo.
   * Se hace SIEMPRE (no sólo con `?preview=1`) para garantizar que el reporte
   * se renderizó bien antes de habilitar la impresión; el diálogo sólo se abre
   * automáticamente cuando viene `?preview=1`.
   */
  useEffect(() => {
    if (autoRan.current || !sheets.length) return;
    autoRan.current = true;
    void (async () => {
      setBusy('preview');
      try {
        const pages = await renderPages(1.4);
        setPreviewPages(pages);
        setPreviewIdx(0);
        if (autoPreview) setPreviewOpen(true);
      } finally {
        setBusy(null);
      }
    })();
  }, [autoPreview, sheets.length, renderPages]);

  /** La impresión sólo se habilita cuando la vista previa ya se generó. */
  const previewReady = previewPages.length > 0 && !busy;


  /**
   * Imprime desde la vista previa: cierra el diálogo (para que el overlay del
   * modal no aparezca en la hoja) y abre el diálogo nativo de impresión con la
   * misma maquetación carta/cabecera/margen/escala del reporte.
   */
  const printFromPreview = useCallback(() => {
    setPreviewOpen(false);
    window.setTimeout(() => window.print(), 250);
  }, []);



  return (
    <div className="min-h-screen bg-background print:bg-transparent">
      {/* @page: hoja carta sin márgenes; el margen real lo aplica el layout */}
      <style>{`@media print { @page { size: letter portrait; margin: 0; } }`}</style>

      <div className="mx-auto max-w-[216mm] px-4 py-6 print:max-w-none print:px-0 print:py-0">
        {/* Barra de acciones (no se imprime) */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div>
            <h1 className="text-xl font-bold">Tarjetas de juego</h1>
            <p className="text-sm text-muted-foreground">
              {data
                ? `${cards.length} tarjetas · ${sheets.length} hojas · ${data.fechas && data.fechas.length > 1 ? `${data.fechas.length} días` : data.fechaFormato} · cabecera ${headerMm}mm · escala ${Math.round(
                    scale * 100,
                  )}%`
                : 'Cargando…'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={openPreview} disabled={!sheets.length || !!busy}>
              {busy === 'preview' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Eye className="mr-2 h-4 w-4" />
              )}
              Vista previa
            </Button>
            <Button variant="outline" onClick={downloadPdf} disabled={!sheets.length || !!busy}>
              {busy === 'pdf' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Descargar PDF
            </Button>
            {/* Imprimir sólo cuando la vista previa ya está lista */}
            <Button onClick={() => window.print()} disabled={!previewReady}>
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Printer className="mr-2 h-4 w-4" />
              )}
              {previewReady ? 'Imprimir' : 'Preparando vista previa…'}
            </Button>

          </div>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground print:hidden">
            <Loader2 className="h-4 w-4 animate-spin" /> Generando tarjetas…
          </div>
        )}

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm print:hidden">
            No se pudo generar el reporte de tarjetas.
          </div>
        )}

        {!isLoading && !error && !cards.length && (
          <div className="rounded-md border p-4 text-sm text-muted-foreground print:hidden">
            No hay tarjetas para la fecha, categorías y tipo de juego seleccionados.
          </div>
        )}

        {/* Hojas: 2 tarjetas por hoja, cada una con su cabecera configurable */}
        <div ref={sheetsRef}>
          {sheets.map((pair, idx) => (
            <div
              key={`sheet-${idx}`}
              data-sheet
              className="mb-6 bg-white print:mb-0"
              style={{
                width: `${SHEET_W_MM}mm`,
                height: `${SHEET_H_MM}mm`,
                breakAfter: idx < sheets.length - 1 ? 'page' : 'auto',
              }}
            >
              {pair.map((card) => (
                <div
                  key={`${card.groupId}-${card.playerId}`}
                  className="overflow-hidden"
                  style={{ height: `${HALF_SHEET_MM}mm`, breakInside: 'avoid' }}
                >
                  <CardHeader
                    logo={data?.logoHeader ?? ''}
                    tournament={data?.tournament ?? ''}
                    course={data?.course ?? ''}
                    /* Cada tarjeta muestra SU día de juego (soporta rangos). */
                    fecha={card.fechaFormato || data?.fechaFormato || ''}
                    heightMm={headerMm}
                  />
                  {/*
                    Escala con transform (no `zoom`): es la única forma que
                    html2canvas replica igual que la impresión, así que el PDF
                    y la vista previa comparten exactamente el mismo layout,
                    márgenes laterales y 2 tarjetas por hoja.
                  */}
                  <div
                    style={{
                      paddingLeft: `${marginMm}mm`,
                      paddingRight: `${marginMm}mm`,
                      width: `${100 / scale}%`,
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left',
                    }}
                  >
                    <Scorecard card={card} rowMm={rowMm} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Vista previa paginada ---------- */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Vista previa de impresión</DialogTitle>
            <DialogDescription>
              Hoja {previewIdx + 1} de {previewPages.length} · 2 tarjetas por hoja carta ·
              cabecera {headerMm}mm · escala {Math.round(scale * 100)}%
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[65vh] overflow-auto rounded-md border bg-white p-2">
            {previewPages[previewIdx] ? (
              <img
                src={previewPages[previewIdx]}
                alt={`Hoja ${previewIdx + 1}`}
                className="mx-auto w-full"
              />
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewIdx((i) => Math.max(0, i - 1))}
                disabled={previewIdx === 0}
              >
                <ChevronLeft className="h-4 w-4" /> Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPreviewIdx((i) => Math.min(previewPages.length - 1, i + 1))
                }
                disabled={previewIdx >= previewPages.length - 1}
              >
                Siguiente <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadPdf} disabled={!!busy}>
                <Download className="mr-2 h-4 w-4" /> Descargar PDF
              </Button>
              {/*
                Imprime con la MISMA maquetación (carta + cabecera/margen/escala):
                cierra el diálogo primero para que el overlay del modal no
                entre en el documento impreso y luego abre el diálogo nativo.
              */}
              <Button size="sm" onClick={printFromPreview}>
                <Printer className="mr-2 h-4 w-4" /> Imprimir
              </Button>

            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTarjetasImpresion;
