/**
 * AdminSalidasImpresion — Reporte imprimible de SALIDAS por día
 * -----------------------------------------------------------------------------
 * Ruta: /admin/salidas-impresion?fecha=&campoid=&hi=&hf=&hri=&hrf=
 * Réplica del reporte legacy `impresion_salidas.php`, pero con el diseño del
 * sitio del torneo (tokens semánticos, tipografía y colores del tema).
 *
 * Estructura visual: rejilla de 2 columnas con un bloque por grupo de salida.
 * Cada bloque tiene un encabezado gris (Hoyo / Hora / Tee) y un renglón por
 * jugador con el logo de su club.
 *
 * Impresión: el botón "Imprimir" llama a window.print(). Las clases
 * `print:` ocultan la barra de acciones y fuerzan fondo blanco.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Loader2, FileDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
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
import {
  useSalidasImpresionReport,
  type SalidasImpresionGroup,
  type SalidasImpresionFilters,
} from '@/hooks/useSalidasImpresion';

/* ===========================================================================
 * Densidad de impresión y tamaño de papel
 * ---------------------------------------------------------------------------
 * `DENSITY_LEVELS` va de la más holgada a la más compacta. Cada nivel expone
 * variables CSS que consumen `PlayerRow` y `GroupBlock`, de modo que cambiar
 * de nivel reajusta fuente, interlineado y alto de renglón sin tocar el
 * layout (los bloques nunca se parten: ver reglas @media print en index.css).
 *
 * `PAPER_SIZES` define el alto útil por hoja (mm menos 12mm de margen arriba
 * y abajo) para: (a) fijar @page en la impresión normal, (b) elegir el formato
 * de jsPDF y (c) calcular en el modo "Automática" el nivel más holgado cuyo
 * bloque más alto sí cabe completo en una página.
 * =========================================================================== */

/** Nivel de densidad tipográfica del reporte. */
type DensityKey = 'comoda' | 'normal' | 'compacta' | 'ultra';

/** Variables CSS por nivel de densidad. */
const DENSITY_LEVELS: Record<
  DensityKey,
  {
    label: string;
    vars: Record<string, string>;
  }
> = {
  comoda: {
    label: 'Cómoda',
    vars: {
      '--sal-name-size': '13.5px',
      '--sal-name-line': '1.6',
      '--sal-row-pad': '5px',
      '--sal-row-min': '2.35rem',
      '--sal-logo-h': '1.6rem',
      '--sal-head-size': '12.5px',
      '--sal-time-size': '13.5px',
      '--sal-gap': '0.85rem',
    },
  },
  normal: {
    label: 'Normal',
    vars: {
      '--sal-name-size': '13px',
      '--sal-name-line': '1.5',
      '--sal-row-pad': '3px',
      '--sal-row-min': '2.1rem',
      '--sal-logo-h': '1.5rem',
      '--sal-head-size': '12px',
      '--sal-time-size': '13px',
      '--sal-gap': '0.75rem',
    },
  },
  compacta: {
    label: 'Compacta',
    vars: {
      '--sal-name-size': '11.5px',
      '--sal-name-line': '1.35',
      '--sal-row-pad': '1.5px',
      '--sal-row-min': '1.7rem',
      '--sal-logo-h': '1.25rem',
      '--sal-head-size': '11px',
      '--sal-time-size': '11.5px',
      '--sal-gap': '0.5rem',
    },
  },
  ultra: {
    label: 'Muy compacta',
    vars: {
      '--sal-name-size': '10.5px',
      '--sal-name-line': '1.25',
      '--sal-row-pad': '1px',
      '--sal-row-min': '1.4rem',
      '--sal-logo-h': '1.05rem',
      '--sal-head-size': '10px',
      '--sal-time-size': '10.5px',
      '--sal-gap': '0.4rem',
    },
  },
};

/** Orden de prueba en modo automático: de la más holgada a la más compacta. */
const DENSITY_ORDER: DensityKey[] = ['comoda', 'normal', 'compacta', 'ultra'];

/** Tamaños de papel soportados (alto útil en px CSS a 96dpi, margen 12mm). */
const PAPER_SIZES = {
  letter: {
    label: 'Carta (8.5 × 11 in)',
    css: 'letter',
    jsPdf: 'letter' as const,
    /** (279.4mm - 24mm) * 3.7795 px/mm */
    usableHeightPx: Math.floor((279.4 - 24) * 3.7795),
  },
  a4: {
    label: 'A4 (210 × 297 mm)',
    css: 'A4',
    jsPdf: 'a4' as const,
    /** (297mm - 24mm) * 3.7795 px/mm */
    usableHeightPx: Math.floor((297 - 24) * 3.7795),
  },
};

/** Clave de tamaño de papel. */
type PaperKey = keyof typeof PAPER_SIZES;

/** Renglón de jugador con logo de club.
 *  Nota: se usa `leading-normal` + padding vertical y `min-h` en lugar de
 *  `truncate` puro, porque html2canvas recorta descendentes (g, j, y) cuando
 *  el contenedor tiene overflow-hidden con altura ajustada al texto.
 *  Las medidas provienen de las variables CSS de densidad. */
const PlayerRow = ({ name, clubLogo }: { name: string; clubLogo: string }) => (
  <div
    className="flex items-center gap-3 border-b border-border px-2 last:border-b-0"
    style={{
      minHeight: 'var(--sal-row-min)',
      paddingTop: 'var(--sal-row-pad)',
      paddingBottom: 'var(--sal-row-pad)',
    }}
  >
    <span
      className="flex w-10 shrink-0 items-center justify-center"
      style={{ height: 'var(--sal-logo-h)' }}
    >
      {clubLogo ? (
        <img
          src={clubLogo}
          alt=""
          className="max-w-10 object-contain"
          style={{ height: 'var(--sal-logo-h)' }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
          }}
        />
      ) : null}
    </span>
    <span
      className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-semibold tracking-[0.01em] text-foreground antialiased"
      style={{
        fontSize: 'var(--sal-name-size)',
        lineHeight: 'var(--sal-name-line)',
        paddingTop: 'var(--sal-row-pad)',
        paddingBottom: 'var(--sal-row-pad)',
      }}
      title={name}
    >
      {name}
    </span>
  </div>
);


/** Bloque de un grupo de salida (encabezado + jugadores).
 *  Encabezado en 2 celdas de ancho fijo para evitar saltos de layout:
 *  Categoría (nombre completo, izquierda) · Hora/Tee (ancho automático).
 *  `data-group-block` lo usa la exportación a PDF para no partir el bloque
 *  a la mitad al calcular los saltos de página. */
const GroupBlock = ({ group }: { group: SalidasImpresionGroup }) => (
  <div
    data-group-block
    className="break-inside-avoid rounded-sm border border-border bg-card"
  >
    {/* Encabezado del grupo: nombre completo de la categoría + hora/tee.
        Línea inferior para distinguir el encabezado en impresiones en blanco y negro. */}
    <div className="border-b-2 border-foreground/40 bg-muted px-2 py-[4px]">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <span
          className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap py-[1px] text-left font-bold uppercase leading-[1.4] tracking-[0.02em] text-primary antialiased"
          style={{ fontSize: 'var(--sal-head-size)' }}
          title={group.categoryName}
        >
          Categoría: {group.categoryName || group.shortName}
        </span>
        <span
          className="whitespace-nowrap py-[1px] text-left font-bold leading-[1.4] tabular-nums text-foreground antialiased"
          style={{ fontSize: 'var(--sal-time-size)' }}
        >
          {group.time}
          {group.tee ? ` / ${group.tee}` : ''}
        </span>
      </div>
    </div>


    <div>
      {group.players.map((p, i) => (
        <PlayerRow key={`${group.id}-${i}`} {...p} />
      ))}
    </div>
  </div>
);


/** Página imprimible de salidas. */
const AdminSalidasImpresion = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  /** Marca de tiempo de generación del reporte (se fija al renderizar). */
  const generatedAt = useMemo(
    () =>
      new Date().toLocaleString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    []
  );

  /** Filtros tomados del query string de la URL. */
  const filters = useMemo<SalidasImpresionFilters>(
    () => ({
      fecha: params.get('fecha') ?? '',
      campoid: params.get('campoid') ?? '',
      hi: params.get('hi') ?? '1',
      hf: params.get('hf') ?? '18',
      hri: params.get('hri') ?? '00:00',
      hrf: params.get('hrf') ?? '23:59',
    }),
    [params]
  );

  /**
   * Validación de los filtros recibidos por URL:
   *  - hoyos enteros 1–18 y hoyo inicial <= hoyo final
   *  - horas HH:MM (24h) y hora inicial <= hora final
   * Si falla, se bloquean Imprimir y Exportar PDF.
   */
  const filterErrors = useMemo<string[]>(() => {
    const errs: string[] = [];
    const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
    const toMin = (t: string) => {
      const m = TIME_RE.exec((t ?? '').trim());
      return m ? Number(m[1]) * 60 + Number(m[2]) : -1;
    };
    const nHi = Number(filters.hi);
    const nHf = Number(filters.hf);
    if (!Number.isInteger(nHi) || nHi < 1 || nHi > 18)
      errs.push('El hoyo inicial debe ser un entero entre 1 y 18.');
    if (!Number.isInteger(nHf) || nHf < 1 || nHf > 18)
      errs.push('El hoyo final debe ser un entero entre 1 y 18.');
    if (Number.isInteger(nHi) && Number.isInteger(nHf) && nHi > nHf)
      errs.push('El hoyo inicial debe ser menor o igual al hoyo final.');
    const mIni = toMin(filters.hri);
    const mFin = toMin(filters.hrf);
    if (mIni < 0) errs.push('La hora inicial no tiene formato válido (HH:MM).');
    if (mFin < 0) errs.push('La hora final no tiene formato válido (HH:MM).');
    if (mIni >= 0 && mFin >= 0 && mIni > mFin)
      errs.push('La hora inicial debe ser anterior o igual a la hora final.');
    return errs;
  }, [filters]);

  /** Sólo se consulta y se permite imprimir cuando los filtros son válidos. */
  const filtersValid = filterErrors.length === 0;

  const { data, isLoading, isError } = useSalidasImpresionReport(filters, filtersValid);


  /** Nodo del reporte (encabezado + rejilla) usado para exportar a PDF. */
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  /** Acción pendiente de confirmar en la vista previa ('print' | 'pdf' | null). */
  const [confirmAction, setConfirmAction] = useState<'print' | 'pdf' | null>(null);

  /** Tamaño de papel del reporte (afecta @page y el formato del PDF). */
  const [paper, setPaper] = useState<PaperKey>('letter');

  /** Densidad elegida por el usuario: 'auto' o un nivel fijo. */
  const [density, setDensity] = useState<'auto' | DensityKey>('auto');

  /** Nivel realmente aplicado (en 'auto' lo calcula la medición de bloques). */
  const [autoDensity, setAutoDensity] = useState<DensityKey>('comoda');
  const activeDensity: DensityKey = density === 'auto' ? autoDensity : density;

  /**
   * Modo automático: mide el bloque de salida más alto ya renderizado y, si no
   * cabe completo en una hoja del papel elegido, baja un nivel de densidad.
   * Converge en pocos renders (cómoda → normal → compacta → muy compacta) y
   * garantiza que ningún bloque tenga que partirse entre páginas.
   */
  useEffect(() => {
    if (density !== 'auto') return;
    const root = reportRef.current;
    if (!root) return;
    const blocks = Array.from(
      root.querySelectorAll<HTMLElement>('[data-group-block]')
    );
    if (!blocks.length) return;
    const tallest = Math.max(...blocks.map((el) => el.getBoundingClientRect().height));
    const limit = PAPER_SIZES[paper].usableHeightPx;
    const idx = DENSITY_ORDER.indexOf(autoDensity);
    if (tallest > limit && idx < DENSITY_ORDER.length - 1) {
      setAutoDensity(DENSITY_ORDER[idx + 1]);
    }
  }, [density, paper, autoDensity, data]);

  /** Al cambiar de papel o volver a 'auto' se reinicia el tanteo de densidad. */
  useEffect(() => {
    if (density === 'auto') setAutoDensity('comoda');
  }, [density, paper, data]);


  /** Resumen para la vista previa: categorías presentes y conteos. */
  const preview = useMemo(() => {
    const groups = data?.groups ?? [];
    const cats = new Map<string, number>();
    groups.forEach((g) => {
      const label = g.shortName || g.categoryName || '(sin categoría)';
      cats.set(label, (cats.get(label) ?? 0) + 1);
    });
    return {
      totalGroups: groups.length,
      totalPlayers: groups.reduce((n, g) => n + g.players.length, 0),
      categories: Array.from(cats.entries()).map(([label, count]) => ({ label, count })),
      missingCategory: groups.filter((g) => !g.shortName && !g.categoryName).length,
    };
  }, [data]);

  /** Nombres completos de las categorías incluidas, para el pie del reporte. */
  const footerCategories = useMemo(
    () =>
      Array.from(
        new Set(
          (data?.groups ?? [])
            .map((g) => g.categoryName || g.shortName)
            .filter((v): v is string => Boolean(v))
        )
      ),
    [data]
  );



  /** Ejecuta la acción confirmada en la vista previa. */
  const runConfirmed = () => {
    const action = confirmAction;
    setConfirmAction(null);
    if (action === 'print') {
      // Espera al cierre del diálogo para no capturarlo en la impresión.
      setTimeout(() => window.print(), 150);
    } else if (action === 'pdf') {
      setTimeout(() => void exportPdf(), 150);
    }
  };


  /**
   * Exporta el reporte a PDF conservando el diseño de la página del torneo.
   * Se renderiza el nodo a canvas (html2canvas) y se pagina en hojas carta
   * verticales con jsPDF, cortando la imagen por alto de página.
   */
  const exportPdf = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const rootRect = reportRef.current.getBoundingClientRect();
      const scale = 3;
      const canvas = await html2canvas(reportRef.current, {
        scale,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      /**
       * Zonas "prohibidas" de corte: cada bloque de salida (encabezado +
       * jugadores) expresado en píxeles del canvas. Un salto de página nunca
       * debe caer dentro de una de estas zonas, para que ningún nombre quede
       * cortado ni un bloque se parta a la mitad.
       */
      const blocks = Array.from(
        reportRef.current.querySelectorAll<HTMLElement>(
          '[data-group-block], .salidas-print-footer'
        )
      ).map((el) => {
        const r = el.getBoundingClientRect();
        return {
          top: Math.max(0, Math.round((r.top - rootRect.top) * scale)),
          bottom: Math.round((r.bottom - rootRect.top) * scale),
        };
      });


      const pdf = new jsPDF({
        unit: 'pt',
        format: PAPER_SIZES[paper].jsPdf,
        orientation: 'portrait',
      });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const usableW = pageW - margin * 2;
      const usableH = pageH - margin * 2;
      /** Alto máximo en píxeles del canvas que cabe en una hoja. */
      const maxSliceH = Math.floor((usableH * canvas.width) / usableW);

      /**
       * Calcula el corte seguro para una página: parte del corte máximo y lo
       * sube hasta el inicio del primer bloque que quedaría partido. Si el
       * bloque es más alto que una hoja completa, se respeta el corte máximo
       * (caso extremo inevitable).
       */
      const safeCut = (offset: number): number => {
        let cut = Math.min(offset + maxSliceH, canvas.height);
        if (cut >= canvas.height) return canvas.height;
        for (const b of blocks) {
          if (b.top > offset && b.top < cut && b.bottom > cut) cut = b.top;
        }
        return cut > offset ? cut : Math.min(offset + maxSliceH, canvas.height);
      };

      let page = 0;
      for (let offset = 0; offset < canvas.height; page++) {
        const cut = safeCut(offset);
        const h = cut - offset;
        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = h;
        const ctx = slice.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(canvas, 0, offset, canvas.width, h, 0, 0, canvas.width, h);
        if (page > 0) pdf.addPage();
        pdf.addImage(
          slice.toDataURL('image/jpeg', 0.95),
          'JPEG',
          margin,
          margin,
          usableW,
          (h * usableW) / canvas.width
        );
        offset = cut;
      }

      /* Numeración de páginas: "Página X de Y" centrada al pie de cada hoja. */
      const totalPages = pdf.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        pdf.setFontSize(9);
        pdf.setTextColor(90);
        pdf.text(`Página ${p} de ${totalPages}`, pageW / 2, pageH - 12, {
          align: 'center',
        });
      }

      pdf.save(`salidas-${filters.fecha || 'reporte'}.pdf`);

    } catch {
      toast({
        title: 'No se pudo generar el PDF',
        description: 'Intenta de nuevo o usa Imprimir y elige "Guardar como PDF".',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background print:bg-transparent">
      <div className="mx-auto max-w-5xl px-4 py-6 print:max-w-none print:px-0 print:py-0">
        {/* Barra de acciones (no se imprime) */}
        <div className="mb-6 flex items-center justify-between gap-2 print:hidden">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="bg-primary/10 hover:bg-primary/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Admin
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="bg-primary/10 hover:bg-primary/20"
              onClick={() => setConfirmAction('pdf')}
              disabled={
                !filtersValid || exporting || isLoading || (data?.groups.length ?? 0) === 0
              }
            >
              {exporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="mr-2 h-4 w-4" />
              )}
              Exportar PDF
            </Button>
            <Button
              onClick={() => setConfirmAction('print')}
              disabled={!filtersValid || isLoading || (data?.groups.length ?? 0) === 0}
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>

          </div>
        </div>

        {/* Filtros inválidos: se bloquea el reporte */}
        {!filtersValid && (
          <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 p-4 print:hidden">
            <p className="mb-2 font-semibold text-destructive">
              No se puede generar el reporte: revisa los filtros.
            </p>
            <ul className="list-inside list-disc text-sm text-destructive">
              {filterErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Contenedor exportable: encabezado + rejilla de grupos */}
        <div ref={reportRef} className="bg-background p-1 print:p-0">




        {/* Encabezado del reporte */}
        <header className="mb-4 border-b-2 border-primary pb-2">
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground">
            {data?.tournament || 'Salidas'}
          </h1>
          <p className="text-sm font-bold uppercase text-muted-foreground">
            {data?.course || data?.club}
            {data?.fechaFormato ? (
              <span className="text-primary"> / {data.fechaFormato}</span>
            ) : null}
          </p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            Hoyos {filters.hi}–{filters.hf} · Horario {filters.hri}–{filters.hrf}
          </p>
          <p className="text-[10px] text-muted-foreground">
            Generado: {generatedAt}
          </p>
        </header>

        {/* Cuerpo */}
        {isLoading && (
          <div className="flex items-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Generando reporte…
          </div>
        )}
        {isError && (
          <p className="py-12 text-destructive">
            No se pudo generar el reporte. Verifica los filtros seleccionados.
          </p>
        )}
        {!isLoading && !isError && (data?.groups.length ?? 0) === 0 && (
          <p className="py-12 text-muted-foreground">
            No hay salidas para los filtros seleccionados.
          </p>
        )}

        {/* `salidas-print-grid`: en pantalla es grid; en impresión se convierte
            en layout multi-columna (ver index.css) para que ningún bloque de
            salida se parta entre páginas. */}
        <div className="salidas-print-grid grid grid-cols-1 gap-3 md:grid-cols-2">

          {data?.groups.map((g) => (
            <GroupBlock key={g.id} group={g} />
          ))}
        </div>

        {/* Pie del reporte: torneo, fecha, categorías, rango de hoyos/horario y timestamp */}
        <footer className="salidas-print-footer mt-6 break-inside-avoid border-t-2 border-primary pt-2 text-[10px] leading-[1.6] text-muted-foreground">
          <p className="text-[11px] font-bold uppercase tracking-[0.02em] text-foreground">
            {data?.tournament || 'Salidas'}
            {data?.fechaFormato ? ` — ${data.fechaFormato}` : ''}
          </p>
          <p className="font-semibold text-foreground">
            Categoría(s): {footerCategories.length ? footerCategories.join(' · ') : '—'}
          </p>
          <p>
            Hoyos {filters.hi}–{filters.hf} · Horario {filters.hri}–{filters.hrf} · Generado: {generatedAt}
          </p>
        </footer>

        </div>
      </div>

      {/* Vista previa de confirmación antes de imprimir / exportar PDF */}
      <Dialog open={confirmAction !== null} onOpenChange={(o) => !o && setConfirmAction(null)}>
        <DialogContent className="print:hidden">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'pdf' ? 'Confirmar exportación a PDF' : 'Confirmar impresión'}
            </DialogTitle>
            <DialogDescription>
              Revisa el rango de hoyos, el horario, la categoría y el primer/último encabezado antes de continuar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Rango de hoyos</p>
                <p className="font-semibold">
                  {filters.hi} – {filters.hf}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rango de horas</p>
                <p className="font-semibold">
                  {filters.hri} – {filters.hrf}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Grupos</p>
                <p className="font-semibold">{preview.totalGroups}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Jugadores</p>
                <p className="font-semibold">{preview.totalPlayers}</p>
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs text-muted-foreground">Categorías incluidas</p>
              <div className="flex flex-wrap gap-1.5">
                {preview.categories.map((c) => (
                  <span
                    key={c.label}
                    className="rounded-sm bg-primary/10 px-2 py-0.5 text-xs font-bold uppercase text-primary"
                  >
                    {c.label} · {c.count}
                  </span>
                ))}
              </div>
              {preview.missingCategory > 0 && (
                <p className="mt-2 text-xs text-destructive">
                  {preview.missingCategory} grupo(s) sin categoría asignada.
                </p>
              )}
            </div>

            {/* Muestra del primer y último encabezado tal como se imprimirá */}
            {data && data.groups.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Vista previa de salidas</p>
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">
                    Primer grupo · {data.groups[0].time}
                    {data.groups[0].tee ? ` / ${data.groups[0].tee}` : ''}
                  </p>
                  <GroupBlock group={data.groups[0]} />
                </div>
                {data.groups.length > 1 && (
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">
                      Último grupo · {data.groups[data.groups.length - 1].time}
                      {data.groups[data.groups.length - 1].tee
                        ? ` / ${data.groups[data.groups.length - 1].tee}`
                        : ''}
                    </p>
                    <GroupBlock group={data.groups[data.groups.length - 1]} />
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              className="bg-primary/10 hover:bg-primary/20"
              onClick={() => setConfirmAction(null)}
            >
              Cancelar
            </Button>
            <Button onClick={runConfirmed}>
              {confirmAction === 'pdf' ? 'Exportar PDF' : 'Imprimir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

  );

};

export default AdminSalidasImpresion;
