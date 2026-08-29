/**
 * AdminTimeLine — Reporte imprimible TIME LINE (horarios estimados por hoyo)
 * -----------------------------------------------------------------------------
 * Ruta: /admin/time-line?fecha=&campoid=&hi=&hf=&hri=&hrf=
 * Réplica del reporte legacy `reportes/Print_time_line_horario.php`, con el
 * diseño del sitio del torneo. Diferencias solicitadas respecto al legacy:
 *   - Se elimina la primera columna (id de grupo / letra de categoría).
 *   - La categoría se muestra al lado de la HORA de salida.
 *
 * Cada grupo se imprime como un bloque-tabla de 3 renglones de cabecera
 * (fecha + números de hoyo, campo + pares, hora/categoría + línea de tiempo)
 * seguido del listado de jugadores del grupo.
 *
 * Impresión: horizontal (landscape) por el ancho de 18 columnas. El PDF se
 * genera con html2canvas + jsPDF cortando páginas sin partir bloques.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  FileDown,
  Loader2,
  Printer,
  Eye,
  EyeOff,
  ScanSearch,
  Wand2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  useTimeLineReport,
  type TimeLineFilters,
  type TimeLineGroup,
  type TimeLineHole,
} from '@/hooks/useTimeLine';

/**
 * Tamaños de papel soportados (formato jsPDF y valor para @page).
 * `widthPx` / `heightPx` son las medidas ÚTILES en px @96 dpi con la hoja en
 * horizontal y márgenes de 10 mm (≈38 px por lado). Se usan para renderizar el
 * reporte SIEMPRE con el mismo ancho físico, independientemente del tamaño de
 * pantalla, de modo que los saltos de línea del encabezado sean idénticos en
 * pantalla, impresión y PDF.
 */
const PAPER_SIZES = {
  letter: {
    label: 'Carta (11 × 8.5 in)',
    css: 'letter',
    jsPdf: 'letter' as const,
    widthPx: 980,
    heightPx: 740,
  },
  a4: {
    label: 'A4 (297 × 210 mm)',
    css: 'A4',
    jsPdf: 'a4' as const,
    widthPx: 1047,
    heightPx: 718,
  },
};

/** Clave de tamaño de papel. */
type PaperKey = keyof typeof PAPER_SIZES;

/**
 * Banda reservada al pie de CADA hoja (px @96 dpi) para la numeración
 * "Página X de Y". El contenido nunca invade esta franja: los cortes de página
 * (impresión y PDF) se calculan con `pageH - FOOTER_RESERVE_PX`, de modo que el
 * rótulo queda siempre al final de la hoja sin empalmarse con el reporte.
 */
const FOOTER_RESERVE_PX = 26;


/* ===========================================================================
 * Densidad tipográfica del reporte TIME LINE
 * ---------------------------------------------------------------------------
 * Cada nivel expone variables CSS que consumen las celdas y los renglones de
 * jugador. En modo "automática" se mide el bloque más alto ya renderizado y se
 * baja un nivel mientras no quepa completo en una hoja: así NINGÚN bloque se
 * parte entre páginas (además de `break-inside: avoid`).
 * =========================================================================== */

/** Nivel de densidad del reporte. */
type DensityKey = 'comoda' | 'normal' | 'compacta' | 'ultra';

/** Variables CSS por nivel de densidad. */
const DENSITY_LEVELS: Record<DensityKey, { label: string; vars: Record<string, string> }> = {
  comoda: {
    label: 'Cómoda',
    vars: {
      '--tl-name-size': '13px',
      '--tl-row-pad': '5px',
      '--tl-hole-size': '10.5px',
      '--tl-time-size': '16px',
      '--tl-head-size': '11.5px',
      '--tl-id-size': '9.5px',
      '--tl-gap': '0.85rem',
    },
  },
  normal: {
    label: 'Normal',
    vars: {
      '--tl-name-size': '12px',
      '--tl-row-pad': '3px',
      '--tl-hole-size': '10px',
      '--tl-time-size': '15px',
      '--tl-head-size': '11px',
      '--tl-id-size': '9px',
      '--tl-gap': '0.75rem',
    },
  },
  compacta: {
    label: 'Compacta',
    vars: {
      '--tl-name-size': '11px',
      '--tl-row-pad': '1.5px',
      '--tl-hole-size': '9.5px',
      '--tl-time-size': '13px',
      '--tl-head-size': '10px',
      '--tl-id-size': '8.5px',
      '--tl-gap': '0.5rem',
    },
  },
  ultra: {
    label: 'Muy compacta',
    vars: {
      '--tl-name-size': '10px',
      '--tl-row-pad': '1px',
      '--tl-hole-size': '9px',
      '--tl-time-size': '11.5px',
      '--tl-head-size': '9.5px',
      '--tl-id-size': '8px',
      '--tl-gap': '0.4rem',
    },
  },
};

/** Orden de tanteo en modo automático: de la más holgada a la más compacta. */
const DENSITY_ORDER: DensityKey[] = ['comoda', 'normal', 'compacta', 'ultra'];

/**
 * Celda de la rejilla de hoyos (números, pares y horas).
 * `divider` dibuja la línea vertical más marcada cada 3 hoyos.
 */
const HoleCell = ({
  children,
  bold = false,
  divider = false,
  pad = true,
}: {
  children?: React.ReactNode;
  bold?: boolean;
  divider?: boolean;
  /** `false` en renglones de jugador: la altura la marca la celda del nombre. */
  pad?: boolean;
}) => (
  <td
    style={{ fontSize: 'var(--tl-hole-size)' }}
    className={`border border-border px-1 text-center align-middle leading-[1.6] tabular-nums ${
      pad ? 'py-[3px]' : 'py-0'
    } ${bold ? 'font-bold text-foreground' : 'text-foreground'} ${
      /* Línea vertical cada 3 hoyos: marcada pero suave (no negra). */
      divider ? 'tl-divider border-r-2 border-r-foreground/25' : ''
    }`}
  >
    {children}
  </td>
);


/**
 * Bloque TIME LINE de un grupo de salida.
 * `data-group-block` lo usa la exportación a PDF para no partir el bloque.
 * Cada jugador ocupa EXACTAMENTE un renglón (nombre recortado con elipsis) y
 * los renglones están delimitados por líneas horizontales.
 */
const TimeLineBlock = ({
  group,
  holes,
  dateLabel,
  courseName,
}: {
  group: TimeLineGroup;
  holes: TimeLineHole[];
  dateLabel: string;
  courseName: string;
}) => {
  /** ¿Esta columna cierra un tramo de 3 hoyos? */
  const isDivider = (i: number) => (i + 1) % 3 === 0 && i + 1 < holes.length;

  return (
    <div data-group-block data-players={group.players.length} className="break-inside-avoid">
      <table className="w-full table-fixed border-collapse border border-border">
        <tbody>
          {/* Fecha del día de juego + numeración de hoyos */}
          <tr className="bg-muted">
            <td
              style={{ fontSize: 'var(--tl-head-size)' }}
              className="w-[240px] border border-border px-2 py-[3px] text-center font-bold uppercase leading-[1.6] text-foreground"
            >
              {dateLabel}
            </td>
            {holes.map((h, i) => (
              <HoleCell key={`n-${h.numero}`} bold divider={isDivider(i)}>
                {String(h.numero).padStart(2, '0')}
              </HoleCell>
            ))}
          </tr>

          {/* Nombre del campo + par de cada hoyo */}
          <tr>
            <td
              style={{ fontSize: 'var(--tl-head-size)' }}
              className="border border-border px-2 py-[3px] text-center font-bold uppercase leading-[1.6] text-primary"
            >
              {courseName}
            </td>
            {holes.map((h, i) => (
              <HoleCell key={`p-${h.numero}`} divider={isDivider(i)}>
                {h.par}
              </HoleCell>
            ))}
          </tr>

          {/* Hora de salida + categoría (mismo tamaño de letra) + línea de tiempo */}
          <tr>
            <td className="border-b-2 border-border border-b-foreground/40 px-2 py-[4px] text-center leading-[1.7]">
              <span
                style={{ fontSize: 'var(--tl-time-size)' }}
                className="font-extrabold tabular-nums text-foreground"
              >
                {group.time}
              </span>
              <span
                style={{ fontSize: 'var(--tl-time-size)' }}
                className="ml-2 font-bold uppercase text-primary"
              >
                {group.categoryName || group.shortName}
              </span>
            </td>
            {holes.map((h, i) => (
              <HoleCell key={`t-${h.numero}`} divider={isDivider(i)}>
                {group.times?.[String(h.numero)] ?? ''}
              </HoleCell>
            ))}
          </tr>

          {/* Jugadores del grupo: UN renglón de tabla por jugador, de modo que
              la línea horizontal que lo delimita cruza todo el bloque (nombre
              + columnas de hoyos) con un trazo claro, y las líneas verticales
              (marcada cada 3 hoyos) llegan hasta el pie del bloque. */}
          {group.players.map((p, i) => (
            <tr key={`${group.id}-${i}`}>
              <td
                style={{
                  paddingTop: 'var(--tl-row-pad)',
                  paddingBottom: 'var(--tl-row-pad)',
                }}
                className="border border-border px-1 align-middle"
              >
                <div className="flex items-center gap-2">
                  {p.id ? (
                    <span
                      style={{ fontSize: 'var(--tl-id-size)' }}
                      className="w-[46px] shrink-0 border-r border-border pr-1 text-right tabular-nums text-muted-foreground"
                    >
                      {p.id}
                    </span>
                  ) : null}
                  {/* Nombre en UN solo renglón. Se usa overflow-hidden con
                      line-height amplio y padding vertical mínimo para que el
                      recorte del texto largo NO corte los ascendentes ni los
                      descendentes al rasterizar el PDF (html2canvas). */}
                  <span
                    style={{ fontSize: 'var(--tl-name-size)', lineHeight: 1.9 }}
                    title={p.name}
                    className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap py-[1px] font-semibold text-foreground"
                  >
                    {p.name}
                  </span>

                </div>
              </td>
              {holes.map((h, hi) => (
                <HoleCell key={`f-${i}-${h.numero}`} divider={isDivider(hi)} pad={false} />
              ))}
            </tr>
          ))}

        </tbody>
      </table>
    </div>
  );
};


/** Página imprimible del reporte TIME LINE. */
const AdminTimeLine = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  /** Marca de tiempo de generación (se fija al renderizar). */
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

  /** Filtros tomados del query string. */
  const filters = useMemo<TimeLineFilters>(
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

  /** Validación de los filtros recibidos por URL (hoyos 1–18, horas HH:MM). */
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

  const filtersValid = filterErrors.length === 0;
  const { data, isLoading, isError } = useTimeLineReport(filters, filtersValid);

  /** Conteos del encabezado: grupos y jugadores incluidos. */
  const totals = useMemo(() => {
    const groups = data?.groups ?? [];
    return {
      groups: groups.length,
      players: groups.reduce((n, g) => n + g.players.length, 0),
    };
  }, [data]);

  /**
   * Tamaño de papel (afecta @page y el formato del PDF).
   * Se puede preseleccionar por URL (`?paper=letter|a4`) para que la descarga
   * directa desde la vista previa de Admin use la misma configuración.
   */
  const [paper, setPaper] = useState<PaperKey>(() =>
    params.get('paper') === 'a4' ? 'a4' : 'letter'
  );

  /** Milímetros por píxel CSS @96 dpi (para traducir márgenes a px). */
  const MM_PX = 3.7795;

  /** Margen de la hoja en mm (afecta @page, el PDF y el alto útil). */
  const [marginMm, setMarginMm] = useState(10);

  /**
   * Geometría útil de la hoja con el margen elegido. Las medidas base de
   * PAPER_SIZES asumen 10 mm por lado, así que se compensa la diferencia.
   */
  const pageW = useMemo(
    () => Math.round(PAPER_SIZES[paper].widthPx + (10 - marginMm) * 2 * MM_PX),
    [paper, marginMm]
  );
  const pageH = useMemo(
    () => Math.round(PAPER_SIZES[paper].heightPx + (10 - marginMm) * 2 * MM_PX),
    [paper, marginMm]
  );

  /** Densidad elegida por el usuario: 'auto' o un nivel fijo. */
  const [density, setDensity] = useState<'auto' | DensityKey>(() => {
    const d = params.get('density');
    return d && (DENSITY_ORDER as string[]).includes(d) ? (d as DensityKey) : 'auto';
  });

  /** Nivel realmente aplicado (en 'auto' lo calcula la medición de bloques). */
  const [autoDensity, setAutoDensity] = useState<DensityKey>('comoda');
  const activeDensity: DensityKey = density === 'auto' ? autoDensity : density;

  /**
   * Alto de renglón manual (padding vertical de cada renglón de jugador, px).
   * `null` = usar el valor de la densidad activa. Se reinicia al cambiar de
   * densidad para que el control siempre parta del valor real aplicado.
   */
  const [rowPad, setRowPad] = useState<number | null>(null);

  /** Nodo exportable del reporte. */
  const reportRef = useRef<HTMLDivElement>(null);
  /** Encabezado del reporte (se verifica que sus 4 renglones no se partan). */
  const headerRef = useRef<HTMLElement>(null);
  const [exporting, setExporting] = useState(false);

  /**
   * Aviso cuando ni el nivel más compacto logra que el bloque más alto quepa
   * completo en una hoja (grupo con demasiados jugadores).
   */
  const [densityOverflow, setDensityOverflow] = useState(false);

  /**
   * Modo automático: mide el bloque más alto ya renderizado y, si no cabe
   * completo en una hoja del papel elegido, baja un nivel de densidad. El
   * espacio disponible descuenta el encabezado del reporte y un margen de
   * seguridad, porque el primer bloque comparte hoja con el encabezado; así se
   * cubren también los casos límite (bloque que cabe "justo").
   * Converge en pocos renders (cómoda → normal → compacta → muy compacta) y se
   * revisa de nuevo al redimensionar y al terminar de cargar las fuentes.
   */
  const measureDensity = useCallback(() => {
    const root = reportRef.current;
    if (!root) return;
    const blocks = Array.from(root.querySelectorAll<HTMLElement>('[data-group-block]'));
    if (!blocks.length) return;
    const tallest = Math.max(...blocks.map((el) => el.getBoundingClientRect().height));
    const headerH = headerRef.current?.getBoundingClientRect().height ?? 0;
    /** 10px de holgura absorbe redondeos de impresión y el rótulo de página. */
    const available = pageH - headerH - 10;
    const fits = tallest <= available;
    if (density !== 'auto') {
      setDensityOverflow(!fits);
      return;
    }
    const idx = DENSITY_ORDER.indexOf(autoDensity);
    if (!fits && idx < DENSITY_ORDER.length - 1) {
      setAutoDensity(DENSITY_ORDER[idx + 1]);
      setDensityOverflow(false);
    } else {
      setDensityOverflow(!fits);
    }
  }, [density, pageH, autoDensity]);

  /** Mide tras cada render relevante, al redimensionar y al cargar fuentes. */
  useEffect(() => {
    const run = () => requestAnimationFrame(measureDensity);
    run();
    window.addEventListener('resize', run);
    void (document as Document & { fonts?: FontFaceSet }).fonts?.ready.then(run);
    return () => window.removeEventListener('resize', run);
  }, [measureDensity, data, activeDensity]);

  /** Al cambiar de papel o volver a 'auto' se reinicia el tanteo de densidad. */
  useEffect(() => {
    if (density === 'auto') setAutoDensity('comoda');
    setDensityOverflow(false);
  }, [density, paper, data]);


  /**
   * Cortes de página para la IMPRESIÓN NORMAL del navegador (px relativos al
   * nodo del reporte). Se calculan igual que el PDF: se sube el corte al inicio
   * de cualquier bloque que quedaría partido. Sirven para rotular "Página X de Y".
   */
  const [printPages, setPrintPages] = useState<number[]>([]);

  /**
   * Geometría de cada bloque de salida (px relativos al nodo del reporte).
   * Alimenta la VISTA PREVIA DE CORTES en pantalla: permite dibujar los límites
   * de bloque y detectar empalmes de layout en tiempo real.
   */
  const [blockZones, setBlockZones] = useState<
    { top: number; bottom: number; players: number }[]
  >([]);
  /** Alto total medido del reporte (para acotar las guías de la vista previa). */
  const [reportHeight, setReportHeight] = useState(0);
  /** Interruptor de la vista previa de cortes y límites (sólo pantalla). */
  const [showGuides, setShowGuides] = useState(true);

  /** Recalcula los cortes de página del reporte impreso. */
  const computePrintPages = useCallback(() => {
    const root = reportRef.current;
    if (!root) return;
    const rootRect = root.getBoundingClientRect();
    const total = rootRect.height;
    const limit = pageH;
    const zones = Array.from(root.querySelectorAll<HTMLElement>('[data-group-block]')).map(
      (el) => {
        const r = el.getBoundingClientRect();
        return {
          top: r.top - rootRect.top,
          bottom: r.bottom - rootRect.top,
          players: Number(el.dataset.players || 0),
        };
      }
    );
    const cuts: number[] = [];
    let offset = 0;
    let guard = 0;
    while (offset < total && guard++ < 200) {
      let cut = Math.min(offset + limit, total);
      if (cut < total) {
        for (const z of zones) {
          if (z.top > offset && z.top < cut && z.bottom > cut) cut = z.top;
        }
        if (cut <= offset) cut = Math.min(offset + limit, total);
      }
      cuts.push(cut);
      offset = cut;
    }
    setPrintPages(cuts);
    setBlockZones(zones);
    setReportHeight(total);
  }, [pageH]);

  /** Mantiene la paginación impresa al día ante cambios de datos/papel/densidad. */
  useEffect(() => {
    const id = window.setTimeout(computePrintPages, 150);
    return () => window.clearTimeout(id);
  }, [computePrintPages, data, activeDensity]);

  /** Remide las guías al redimensionar la ventana (la vista previa es en vivo). */
  useEffect(() => {
    const run = () => requestAnimationFrame(computePrintPages);
    window.addEventListener('resize', run);
    return () => window.removeEventListener('resize', run);
  }, [computePrintPages]);

  /**
   * Empalmes detectados: bloques que cruzan el pie físico de alguna hoja, es
   * decir que se partirían al imprimir. Con `break-inside: avoid` sólo ocurre
   * cuando el bloque es más alto que una hoja completa.
   */
  const overlaps = useMemo(() => {
    const limit = pageH;
    return blockZones.reduce((n, z) => {
      const pageStart = printPages.findIndex((cut) => z.top < cut);
      if (pageStart < 0) return n;
      const start = pageStart === 0 ? 0 : printPages[pageStart - 1];
      return z.bottom > start + limit ? n + 1 : n;
    }, 0);
  }, [blockZones, printPages, pageH]);



  /**
   * Renglones del encabezado que se están partiendo en más de una línea.
   * El encabezado debe verse SIEMPRE con exactamente 4 renglones (torneo,
   * sede/fecha, hoyos-horario-conteos y marca de generación). Como el reporte
   * se renderiza con el ancho útil fijo del papel, un salto extra sólo puede
   * venir de un texto demasiado largo; se avisa en pantalla (nunca al imprimir)
   * para poder corregirlo antes de imprimir o exportar.
   */
  const [headerWraps, setHeaderWraps] = useState<string[]>([]);

  /** Mide cada renglón del encabezado y detecta líneas envueltas. */
  const verifyHeaderLines = useCallback(() => {
    const root = headerRef.current;
    if (!root) return;
    const wrapped: string[] = [];
    root.querySelectorAll<HTMLElement>('[data-header-line]').forEach((el) => {
      const lh = parseFloat(getComputedStyle(el).lineHeight || '0');
      if (!lh) return;
      // 1.5 líneas de tolerancia evita falsos positivos por redondeo.
      if (el.getBoundingClientRect().height > lh * 1.5) {
        wrapped.push(el.dataset.headerLine || '');
      }
    });
    setHeaderWraps(wrapped);
  }, []);

  /** Verifica al cargar datos, al cambiar de papel y al redimensionar. */
  useEffect(() => {
    const run = () => requestAnimationFrame(verifyHeaderLines);
    run();
    window.addEventListener('resize', run);
    return () => window.removeEventListener('resize', run);
  }, [verifyHeaderLines, data, paper, totals.groups, totals.players]);

  /** Recalcula la paginación y revalida el encabezado antes de imprimir. */
  const beforePrint = useCallback(() => {
    /* Los bloques usan `break-inside: avoid` (ver index.css); aquí sólo se
       recalculan los rótulos "Página X de Y" y se revalida el encabezado. */
    computePrintPages();
    verifyHeaderLines();
  }, [computePrintPages, verifyHeaderLines]);


  useEffect(() => {
    window.addEventListener('beforeprint', beforePrint);
    return () => window.removeEventListener('beforeprint', beforePrint);
  }, [beforePrint]);

  /**
   * Resumen por página: jugadores y grupos que caen en cada hoja según los
   * cortes calculados. Alimenta la vista previa (total de páginas, jugadores
   * por página y densidad aplicada).
   */
  const pageStats = useMemo(() => {
    return printPages.map((cut, i) => {
      const start = i === 0 ? 0 : printPages[i - 1];
      const inPage = blockZones.filter((z) => z.top >= start - 0.5 && z.top < cut - 0.5);
      return {
        page: i + 1,
        groups: inPage.length,
        players: inPage.reduce((n, z) => n + z.players, 0),
      };
    });
  }, [printPages, blockZones]);

  /* ===================== Autoajustar ===================== */

  /** Ciclos de autoajuste pendientes (cada uno reduce un poco el layout). */
  const [autoFitting, setAutoFitting] = useState(false);

  /**
   * Autoajustar: vuelve a densidad automática y, si aún hay empalmes, va
   * reduciendo el alto de renglón hasta que la vista previa no detecte ninguno.
   */
  const autoFit = () => {
    setDensity('auto');
    setAutoDensity('comoda');
    setRowPad(null);
    setAutoFitting(true);
  };

  /** Bucle de autoajuste: reduce el alto de renglón mientras existan empalmes. */
  useEffect(() => {
    if (!autoFitting) return;
    const id = window.setTimeout(() => {
      if (overlaps === 0 && !densityOverflow) {
        setAutoFitting(false);
        return;
      }
      const current = rowPad ?? parseFloat(DENSITY_LEVELS[activeDensity].vars['--tl-row-pad']);
      if (activeDensity !== 'ultra') return; // deja que la densidad baje primero
      if (current > 0) setRowPad(Math.max(0, Number((current - 0.5).toFixed(1))));
      else setAutoFitting(false);
    }, 250);
    return () => window.clearTimeout(id);
  }, [autoFitting, overlaps, densityOverflow, rowPad, activeDensity]);

  /* ===================== Vista previa / PDF ===================== */

  /** Diálogo de vista previa del PDF. */
  const [previewOpen, setPreviewOpen] = useState(false);
  /** Imágenes (una por página) de la vista previa del PDF. */
  const [previewImgs, setPreviewImgs] = useState<string[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  /** Rango de páginas a exportar (1-based, inclusive). */
  const [rangeFrom, setRangeFrom] = useState(1);
  const [rangeTo, setRangeTo] = useState(1);

  /**
   * Rasteriza el reporte y lo corta en páginas SIN partir bloques.
   * Devuelve las rebanadas como data URLs y el ancho del lienzo, de modo que
   * la vista previa y el PDF final usen exactamente la misma paginación.
   */
  const renderSlices = useCallback(
    async (scale: number): Promise<{ slices: { url: string; h: number }[]; width: number }> => {
      const root = reportRef.current!;
      const { default: html2canvas } = await import('html2canvas');
      const rootRect = root.getBoundingClientRect();
      const canvas = await html2canvas(root, {
        scale,
        useCORS: true,
        backgroundColor: '#ffffff',
        /* Las guías de pantalla nunca se exportan. */
        ignoreElements: (el) => el instanceof HTMLElement && el.dataset.guides === 'true',
      });
      const blocks = Array.from(root.querySelectorAll<HTMLElement>('[data-group-block]')).map(
        (el) => {
          const r = el.getBoundingClientRect();
          return {
            top: Math.max(0, Math.round((r.top - rootRect.top) * scale)),
            bottom: Math.round((r.bottom - rootRect.top) * scale),
          };
        }
      );
      const limit = Math.floor(pageH * scale);
      const safeCut = (offset: number): number => {
        let cut = Math.min(offset + limit, canvas.height);
        if (cut >= canvas.height) return canvas.height;
        for (const b of blocks) {
          if (b.top > offset && b.top < cut && b.bottom > cut) cut = b.top;
        }
        return cut > offset ? cut : Math.min(offset + limit, canvas.height);
      };
      const slices: { url: string; h: number }[] = [];
      for (let offset = 0; offset < canvas.height; ) {
        const cut = safeCut(offset);
        const h = cut - offset;
        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = h;
        const ctx = slice.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(canvas, 0, offset, canvas.width, h, 0, 0, canvas.width, h);
        slices.push({ url: slice.toDataURL('image/jpeg', 0.92), h });
        offset = cut;
      }
      return { slices, width: canvas.width };
    },
    [pageH]
  );

  /** Abre la vista previa del PDF (rasterizada, hoja por hoja). */
  const openPreview = async () => {
    if (!reportRef.current) return;
    setPreviewOpen(true);
    setPreviewLoading(true);
    try {
      const { slices } = await renderSlices(1.4);
      setPreviewImgs(slices.map((s) => s.url));
      setRangeFrom(1);
      setRangeTo(slices.length);
    } catch {
      toast({
        title: 'No se pudo generar la vista previa',
        description: 'Intenta de nuevo.',
        variant: 'destructive',
      });
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  /**
   * Exporta el reporte a PDF horizontal, paginando sin partir bloques.
   * @param range - rango 1-based de páginas a incluir; sin valor, todas.
   */
  const exportPdf = async (range?: { from: number; to: number }) => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const { slices, width } = await renderSlices(2.5);

      const pdf = new jsPDF({
        unit: 'pt',
        format: PAPER_SIZES[paper].jsPdf,
        orientation: 'landscape',
      });
      const sheetW = pdf.internal.pageSize.getWidth();
      const sheetH = pdf.internal.pageSize.getHeight();
      /** Margen del PDF en puntos, tomado del control de márgenes (mm). */
      const margin = marginMm * 2.8346;
      const usableW = sheetW - margin * 2;

      const from = Math.max(1, range?.from ?? 1);
      const to = Math.min(slices.length, range?.to ?? slices.length);
      const picked = slices.slice(from - 1, to);
      if (!picked.length) throw new Error('rango vacío');

      picked.forEach((s, i) => {
        if (i > 0) pdf.addPage();
        pdf.addImage(s.url, 'JPEG', margin, margin, usableW, (s.h * usableW) / width);
      });

      /* Numeración "Página X de Y" (conserva el número real de la hoja). */
      for (let i = 0; i < picked.length; i++) {
        pdf.setPage(i + 1);
        pdf.setFontSize(9);
        pdf.setTextColor(90);
        pdf.text(`Página ${from + i} de ${slices.length}`, sheetW - margin, sheetH - 10, {
          align: 'right',
        });
      }

      const suffix = picked.length === slices.length ? '' : `-p${from}-${to}`;
      pdf.save(`time-line-${filters.fecha || 'reporte'}${suffix}.pdf`);
    } catch {
      toast({
        title: 'No se pudo exportar el PDF',
        description: 'Intenta de nuevo o usa Imprimir y elige "Guardar como PDF".',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  /**
   * Acción automática solicitada por URL (`?auto=pdf` o `?auto=print`).
   * La usa el botón de descarga directa de la vista previa en Admin: al abrir
   * la pestaña, en cuanto el reporte está renderizado con datos válidos se
   * dispara la exportación a PDF (o el diálogo de impresión) una sola vez.
   */
  const autoAction = params.get('auto');
  const autoRan = useRef(false);

  useEffect(() => {
    if (autoRan.current) return;
    if (autoAction !== 'pdf' && autoAction !== 'print') return;
    if (!filtersValid || isLoading || totals.groups === 0) return;
    autoRan.current = true;
    // Espera un frame extra para que fuentes y logos estén pintados.
    const id = window.setTimeout(() => {
      if (autoAction === 'pdf') void exportPdf();
      else window.print();
    }, 600);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAction, filtersValid, isLoading, totals.groups]);

  return (
    <div className="min-h-screen bg-background print:bg-transparent">
      <div className="mx-auto max-w-[1200px] px-4 py-6 print:max-w-none print:px-0 print:py-0">
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
          <div className="flex flex-wrap items-center gap-2">
            {/* Vista previa de cortes: dibuja saltos de página y límites de bloque */}
            <Button
              variant="ghost"
              className="bg-primary/10 hover:bg-primary/20"
              onClick={() => setShowGuides((v) => !v)}
            >
              {showGuides ? (
                <EyeOff className="mr-2 h-4 w-4" />
              ) : (
                <Eye className="mr-2 h-4 w-4" />
              )}
              {showGuides ? 'Ocultar guías' : 'Ver guías'}
            </Button>
            <Select value={paper} onValueChange={(v) => setPaper(v as PaperKey)}>
              <SelectTrigger className="h-9 w-[200px]">
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
            {/* Densidad tipográfica: 'auto' baja el nivel hasta que ningún
                bloque quede partido entre páginas. */}
            <Select
              value={density}
              onValueChange={(v) => setDensity(v as 'auto' | DensityKey)}
            >
              <SelectTrigger className="h-9 w-[230px]">
                <SelectValue placeholder="Densidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">
                  Densidad: automática ({DENSITY_LEVELS[autoDensity].label})
                </SelectItem>
                {DENSITY_ORDER.map((k) => (
                  <SelectItem key={k} value={k}>
                    Densidad: {DENSITY_LEVELS[k].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Autoajustar: baja densidad / alto de renglón hasta que no
                queden empalmes detectados en la vista previa. */}
            <Button
              variant="ghost"
              className="bg-primary/10 hover:bg-primary/20"
              onClick={autoFit}
              disabled={isLoading || totals.groups === 0}
            >
              {autoFitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Autoajustar
            </Button>
            {/* Vista previa del PDF hoja por hoja antes de imprimir/exportar */}
            <Button
              variant="ghost"
              className="bg-primary/10 hover:bg-primary/20"
              onClick={() => void openPreview()}
              disabled={!filtersValid || isLoading || totals.groups === 0}
            >
              <ScanSearch className="mr-2 h-4 w-4" />
              Vista previa PDF
            </Button>
            <Button
              variant="ghost"
              className="bg-primary/10 hover:bg-primary/20"
              onClick={() => void exportPdf()}
              disabled={!filtersValid || exporting || isLoading || totals.groups === 0}
            >
              {exporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="mr-2 h-4 w-4" />
              )}
              Exportar PDF
            </Button>
            <Button
              onClick={() => window.print()}
              disabled={!filtersValid || isLoading || totals.groups === 0}
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </div>

        {/* Ajustes manuales de maqueta + resumen en vivo (no se imprimen) */}
        <div className="mb-4 flex flex-wrap items-end gap-4 rounded-md border border-border bg-card p-3 print:hidden">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Margen de hoja (mm)</Label>
            <Input
              type="number"
              min={5}
              max={25}
              step={1}
              value={marginMm}
              onChange={(e) =>
                setMarginMm(Math.min(25, Math.max(5, Number(e.target.value) || 10)))
              }
              className="h-9 w-[110px]"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Alto de renglón (px)</Label>
            <Input
              type="number"
              min={0}
              max={12}
              step={0.5}
              value={rowPad ?? parseFloat(DENSITY_LEVELS[activeDensity].vars['--tl-row-pad'])}
              onChange={(e) => setRowPad(Math.min(12, Math.max(0, Number(e.target.value) || 0)))}
              className="h-9 w-[110px]"
            />
          </div>
          <Button
            variant="ghost"
            className="h-9 bg-primary/10 hover:bg-primary/20"
            onClick={() => setRowPad(null)}
            disabled={rowPad === null}
          >
            Usar el de la densidad
          </Button>
          {/* Resumen en vivo: páginas, densidad y jugadores por página */}
          <div className="ml-auto text-right text-xs text-muted-foreground">
            <p>
              <strong className="text-foreground">{printPages.length}</strong> página(s) ·
              densidad <strong className="text-foreground">
                {DENSITY_LEVELS[activeDensity].label}
                {density === 'auto' ? ' (automática)' : ''}
              </strong>{' '}
              · {totals.groups} grupos / {totals.players} jugadores
            </p>
            <p>
              Jugadores por página:{' '}
              {pageStats.map((s) => `p${s.page}: ${s.players}`).join(' · ') || '—'}
            </p>
          </div>
        </div>

        {/* Filtros inválidos */}
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

        {/* Aviso automático: algún renglón del encabezado se está partiendo */}
        {headerWraps.length > 0 && (
          <div className="mb-4 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm print:hidden">
            El encabezado debe tener 4 renglones; estos se están partiendo en más de una línea:{' '}
            <strong>{headerWraps.join(', ')}</strong>. El texto es demasiado largo para el ancho de{' '}
            {PAPER_SIZES[paper].label}.
          </div>
        )}

        {/* Aviso: con la densidad actual algún bloque no cabe en una hoja */}
        {densityOverflow && (
          <div className="mb-4 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm print:hidden">
            Con la densidad <strong>{DENSITY_LEVELS[activeDensity].label}</strong> hay un bloque
            más alto que una hoja de {PAPER_SIZES[paper].label}
            {density === 'auto'
              ? ' incluso en el nivel más compacto: reduce el rango de hoyos u horas.'
              : '. Usa una densidad más compacta o el modo automático.'}
          </div>
        )}

        {/* Aviso de la vista previa: empalmes detectados en el layout */}
        {showGuides && overlaps > 0 && (
          <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive print:hidden">
            La vista previa detectó <strong>{overlaps}</strong> bloque(s) que se empalman con el pie
            de la hoja: son más altos que una página de {PAPER_SIZES[paper].label}. Usa una densidad
            más compacta o reduce el rango de hoyos u horas.
          </div>
        )}

        {/* @page dinámico: hoja horizontal por el ancho de 18 columnas */}
        <style>{`@media print { @page { size: ${PAPER_SIZES[paper].css} landscape; margin: ${marginMm}mm; } }`}</style>

        {/*
          Contenedor exportable con ANCHO FIJO igual al ancho útil de la hoja
          elegida. Así los saltos de línea (encabezado incluido) son idénticos
          en cualquier pantalla, en la impresión y en el PDF. El scroll
          horizontal queda en el envoltorio, no en el reporte.
        */}
        <div className="overflow-x-auto print:overflow-visible">
          <div
            ref={reportRef}
            style={{
              width: pageW,
              ...(DENSITY_LEVELS[activeDensity].vars as React.CSSProperties),
              /* El control manual de alto de renglón pisa el de la densidad. */
              ...(rowPad !== null
                ? ({ '--tl-row-pad': `${rowPad}px` } as React.CSSProperties)
                : {}),
            }}
            className="timeline-report relative mx-auto bg-background p-1 print:w-full print:p-0"
          >
          {/* ============= VISTA PREVIA DE CORTES (sólo pantalla) =============
              Dibuja, sobre el reporte real:
                · el pie físico de cada hoja (línea roja punteada) → hasta ahí
                  imprime cada página;
                · el punto de corte del flujo (línea verde discontinua) → si se
                  adelanta al pie, es el salto que evita partir un bloque;
                · el contorno de cada bloque de salida.
              Es puramente visual (absoluta, sin afectar el flujo) y nunca se
              imprime ni se incluye en el PDF. */}
          {showGuides && reportHeight > 0 && (
            <div
              aria-hidden
              data-guides="true"
              className="pointer-events-none absolute inset-0 z-10 print:hidden"
            >
              {/* Contornos de bloque */}
              {blockZones.map((z, i) => (
                <div
                  key={`bz-${i}`}
                  className="absolute left-0 right-0 rounded-sm border border-dashed border-primary/40"
                  style={{ top: z.top, height: Math.max(0, z.bottom - z.top) }}
                />
              ))}
              {/* Pie físico y corte de flujo de cada hoja */}
              {printPages.map((cut, i) => {
                const pageStart = i === 0 ? 0 : printPages[i - 1];
                const pageEnd = pageStart + pageH;
                return (
                  <div key={`gp-${i}`}>
                    {/* Zona sobrante: espacio que queda en blanco en la hoja */}
                    {cut < pageEnd - 1 && (
                      <div
                        className="absolute left-0 right-0 bg-primary/5"
                        style={{ top: cut, height: pageEnd - cut }}
                      />
                    )}
                    {/* Corte del flujo (inicio de la hoja siguiente) */}
                    <div
                      className="absolute left-0 right-0 border-t-2 border-dashed border-primary/70"
                      style={{ top: cut }}
                    />
                    <span
                      className="absolute left-1 -translate-y-full rounded-sm bg-primary px-1 text-[10px] font-bold text-primary-foreground"
                      style={{ top: cut }}
                    >
                      Salto · fin de página {i + 1} de {printPages.length}
                    </span>
                    {/* Pie físico de la hoja */}
                    <div
                      className="absolute left-0 right-0 border-t border-dotted border-destructive/60"
                      style={{ top: Math.min(pageEnd, reportHeight) }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Numeración "Página X de Y" para la impresión del navegador.
              IMPORTANTE: el rótulo va al PIE FÍSICO de cada hoja, no en el punto
              de corte del flujo. Tras un salto de página el contenido reinicia
              en la parte superior de la hoja siguiente, así que el pie de la
              hoja i está en (inicio de la hoja i) + alto útil de la hoja, no en
              el corte calculado (que puede adelantarse para no partir bloques).
              Al posicionarse absolutamente no altera el flujo ni el alto. */}
          {printPages.map((_cut, i) => {
            const pageStart = i === 0 ? 0 : printPages[i - 1];
            const footerTop = pageStart + pageH - 14;
            return (
              <span
                key={`pg-${i}`}
                aria-hidden
                className="pointer-events-none absolute right-0 hidden text-[10px] font-semibold text-muted-foreground print:block"
                style={{ top: `${footerTop}px` }}
              >
                Página {i + 1} de {printPages.length}
              </span>
            );
          })}


          {/* Encabezado del reporte */}
          {/*
            Encabezado fijo del reporte — SIEMPRE cuatro renglones, en este
            orden y con salto de línea propio (también al imprimir):
              1) Nombre del torneo            → LXX TORNEO ANUAL DE INVITACION
              2) Sede / fecha                 → VALLE ALTO / martes, 28 de abril 2026
              3) Hoyos · Horario · Grupos / Jugadores
              4) Generado: dd/mm/aaaa, hh:mm
            Cada renglón es un bloque con `whitespace-nowrap`-free wrapping
            controlado, sin depender de datos opcionales: si un dato falta se
            muestra "—" para que la maqueta no cambie de altura.
          */}
          <header
            ref={headerRef}
            className="mb-4 break-inside-avoid border-b-2 border-primary pb-2 text-center"
          >
            {/* 1 — Torneo */}
            <h1
              data-header-line="Nombre del torneo"
              className="block text-2xl font-extrabold uppercase leading-[1.25] tracking-tight text-foreground"
            >
              {data?.tournament || '—'}
            </h1>
            {/* 2 — Sede / fecha */}
            <p
              data-header-line="Sede / fecha"
              className="block text-sm font-bold uppercase leading-[1.5] text-muted-foreground"
            >
              <span>{data?.course || data?.club || '—'}</span>
              <span className="text-primary"> / {data?.fechaFormato || filters.fecha || '—'}</span>
            </p>
            {/* 3 — Hoyos · Horario · Grupos / Jugadores */}
            <p
              data-header-line="Hoyos / Horario / Grupos / Jugadores"
              className="mt-1 block text-xs font-semibold leading-[1.5] text-muted-foreground"
            >
              Hoyos {filters.hi}–{filters.hf} · Horario {filters.hri}–{filters.hrf} · Grupos:{' '}
              {totals.groups.toLocaleString('es-MX')} / Jugadores:{' '}
              {totals.players.toLocaleString('es-MX')}
            </p>
            {/* 4 — Marca de generación */}
            <p
              data-header-line="Generado"
              className="block text-[10px] leading-[1.5] text-muted-foreground"
            >
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
          {!isLoading && !isError && totals.groups === 0 && (
            <p className="py-12 text-muted-foreground">
              No hay salidas para los filtros seleccionados.
            </p>
          )}

          <div className="flex flex-col" style={{ gap: 'var(--tl-gap)' }}>
            {data?.groups.map((g) => (
              <TimeLineBlock
                key={g.id}
                group={g}
                holes={data.holes}
                dateLabel={data.fechaFormato}
                courseName={data.course || data.club}
              />
            ))}
          </div>

          {/* Pie del reporte */}
          <footer className="mt-6 break-inside-avoid border-t-2 border-primary pt-2 text-[10px] leading-[1.6] text-muted-foreground">
            <p className="text-[11px] font-bold uppercase tracking-[0.02em] text-foreground">
              {data?.tournament || 'Time Line'}
              {data?.fechaFormato ? ` — ${data.fechaFormato}` : ''}
            </p>
            <p>
              Hoyos {filters.hi}–{filters.hf} · Horario {filters.hri}–{filters.hrf} · Grupos:{' '}
              {totals.groups} / Jugadores: {totals.players} · Generado: {generatedAt}
            </p>
          </footer>
          </div>
        </div>

        {/* ============= Vista previa del PDF (hoja por hoja) =============
            Rasteriza el reporte con la misma paginación del PDF final, muestra
            el resumen (páginas, jugadores por página, densidad, márgenes) y
            permite exportar sólo un rango de páginas antes de imprimir. */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-5xl print:hidden">
            <DialogHeader>
              <DialogTitle>Vista previa del PDF</DialogTitle>
              <DialogDescription>
                Revisa cada hoja tal como se exportará o imprimirá y elige el rango de páginas.
              </DialogDescription>
            </DialogHeader>

            {previewLoading ? (
              <div className="flex items-center gap-2 py-10 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Generando vista previa…
              </div>
            ) : (
              <>
                {/* Resumen del documento */}
                <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm md:grid-cols-4">
                  <div>
                    <dt className="text-xs text-muted-foreground">Páginas</dt>
                    <dd className="font-bold text-foreground">{previewImgs.length}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Densidad aplicada</dt>
                    <dd className="font-bold text-foreground">
                      {DENSITY_LEVELS[activeDensity].label}
                      {density === 'auto' ? ' (automática)' : ''}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Margen / renglón</dt>
                    <dd className="font-bold text-foreground">
                      {marginMm} mm /{' '}
                      {rowPad ?? parseFloat(DENSITY_LEVELS[activeDensity].vars['--tl-row-pad'])} px
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Grupos / Jugadores</dt>
                    <dd className="font-bold text-foreground">
                      {totals.groups} / {totals.players}
                    </dd>
                  </div>
                </dl>

                {/* Rango de páginas a exportar */}
                <div className="flex flex-wrap items-end gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Desde página</Label>
                    <Input
                      type="number"
                      min={1}
                      max={previewImgs.length || 1}
                      value={rangeFrom}
                      onChange={(e) =>
                        setRangeFrom(
                          Math.min(
                            Math.max(1, Number(e.target.value) || 1),
                            previewImgs.length || 1
                          )
                        )
                      }
                      className="h-9 w-[100px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Hasta página</Label>
                    <Input
                      type="number"
                      min={1}
                      max={previewImgs.length || 1}
                      value={rangeTo}
                      onChange={(e) =>
                        setRangeTo(
                          Math.min(
                            Math.max(1, Number(e.target.value) || 1),
                            previewImgs.length || 1
                          )
                        )
                      }
                      className="h-9 w-[100px]"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    className="h-9 bg-primary/10 hover:bg-primary/20"
                    onClick={() => {
                      setRangeFrom(1);
                      setRangeTo(previewImgs.length || 1);
                    }}
                  >
                    Todas
                  </Button>
                </div>

                {/* Hojas rasterizadas con su resumen de jugadores */}
                <div className="max-h-[55vh] space-y-4 overflow-y-auto rounded-md border border-border p-2">
                  {previewImgs.map((src, i) => {
                    const inRange = i + 1 >= rangeFrom && i + 1 <= rangeTo;
                    const st = pageStats[i];
                    return (
                      <figure
                        key={`prev-${i}`}
                        className={`rounded-md border p-2 ${
                          inRange ? 'border-primary/50' : 'border-border opacity-40'
                        }`}
                      >
                        <img
                          src={src}
                          alt={`Página ${i + 1} del reporte Time Line`}
                          className="w-full bg-background"
                          loading="lazy"
                        />
                        <figcaption className="mt-1 text-xs text-muted-foreground">
                          Página {i + 1} de {previewImgs.length}
                          {st ? ` · ${st.groups} grupos / ${st.players} jugadores` : ''}
                          {inRange ? '' : ' · fuera del rango'}
                        </figcaption>
                      </figure>
                    );
                  })}
                </div>
              </>
            )}

            <DialogFooter className="flex-wrap gap-2">
              <Button
                variant="ghost"
                className="bg-primary/10 hover:bg-primary/20"
                onClick={() => setPreviewOpen(false)}
              >
                Cerrar
              </Button>
              <Button
                variant="ghost"
                className="bg-primary/10 hover:bg-primary/20"
                onClick={() => {
                  setPreviewOpen(false);
                  window.print();
                }}
                disabled={previewLoading || previewImgs.length === 0}
              >
                <Printer className="mr-2 h-4 w-4" />
                Imprimir todo
              </Button>
              <Button
                onClick={() => void exportPdf({ from: rangeFrom, to: rangeTo })}
                disabled={previewLoading || exporting || previewImgs.length === 0}
              >
                {exporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="mr-2 h-4 w-4" />
                )}
                Descargar páginas {rangeFrom}–{rangeTo}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>

  );
};

export default AdminTimeLine;
