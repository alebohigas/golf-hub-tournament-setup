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
import { ArrowLeft, FileDown, Loader2, Printer } from 'lucide-react';
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

/** Tamaños de papel soportados (formato jsPDF y valor para @page). */
const PAPER_SIZES = {
  letter: { label: 'Carta (11 × 8.5 in)', css: 'letter', jsPdf: 'letter' as const },
  a4: { label: 'A4 (297 × 210 mm)', css: 'A4', jsPdf: 'a4' as const },
};

/** Clave de tamaño de papel. */
type PaperKey = keyof typeof PAPER_SIZES;

/** Celda de la rejilla de hoyos (números, pares y horas). */
const HoleCell = ({
  children,
  bold = false,
}: {
  children: React.ReactNode;
  bold?: boolean;
}) => (
  <td
    className={`border border-border px-1 py-[3px] text-center align-middle text-[10px] leading-[1.6] tabular-nums ${
      bold ? 'font-bold text-foreground' : 'text-foreground'
    }`}
  >
    {children}
  </td>
);

/**
 * Bloque TIME LINE de un grupo de salida.
 * `data-group-block` lo usa la exportación a PDF para no partir el bloque.
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
}) => (
  <div data-group-block className="break-inside-avoid">
    <table className="w-full table-fixed border-collapse border border-border">
      <tbody>
        {/* Fecha del día de juego + numeración de hoyos */}
        <tr className="bg-muted">
          <td className="w-[240px] border border-border px-2 py-[3px] text-center text-[11px] font-bold uppercase leading-[1.6] text-foreground">
            {dateLabel}
          </td>
          {holes.map((h) => (
            <HoleCell key={`n-${h.numero}`} bold>
              {String(h.numero).padStart(2, '0')}
            </HoleCell>
          ))}
        </tr>

        {/* Nombre del campo + par de cada hoyo */}
        <tr>
          <td className="border border-border px-2 py-[3px] text-center text-[11px] font-bold uppercase leading-[1.6] text-primary">
            {courseName}
          </td>
          {holes.map((h) => (
            <HoleCell key={`p-${h.numero}`}>{h.par}</HoleCell>
          ))}
        </tr>

        {/* Hora de salida + categoría (a un lado de la hora) + línea de tiempo */}
        <tr>
          <td className="border-b-2 border-border border-b-foreground/40 px-2 py-[4px] text-center leading-[1.7]">
            <span className="text-[15px] font-extrabold tabular-nums text-foreground">
              {group.time}
            </span>
            <span className="ml-2 text-[11px] font-bold uppercase text-primary">
              {group.categoryName || group.shortName}
            </span>
          </td>
          {holes.map((h) => (
            <HoleCell key={`t-${h.numero}`}>{group.times?.[String(h.numero)] ?? ''}</HoleCell>
          ))}
        </tr>

        {/* Jugadores del grupo (mismo orden que el grid de Salidas) */}
        <tr>
          <td className="border border-border p-0 align-top">
            {group.players.map((p, i) => (
              <div
                key={`${group.id}-${i}`}
                className="flex items-center gap-2 border-b border-border px-1 py-[3px] last:border-b-0"
              >
                {p.id ? (
                  <span className="w-[46px] shrink-0 border-r border-border pr-1 text-right text-[9px] tabular-nums text-muted-foreground">
                    {p.id}
                  </span>
                ) : null}
                <span className="min-w-0 flex-1 text-[12px] font-semibold leading-[1.5] text-foreground">
                  {p.name}
                </span>
              </div>
            ))}
          </td>
          <td className="border border-border" colSpan={holes.length} />
        </tr>
      </tbody>
    </table>
  </div>
);

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

  /** Tamaño de papel (afecta @page y el formato del PDF). */
  const [paper, setPaper] = useState<PaperKey>('letter');

  /** Nodo exportable del reporte. */
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  /** Recalcula la paginación antes de imprimir desde el navegador. */
  const beforePrint = useCallback(() => {
    /* La impresión usa `break-inside: avoid` en cada bloque (ver index.css),
       por lo que no requiere cálculo adicional de cortes. */
  }, []);

  useEffect(() => {
    window.addEventListener('beforeprint', beforePrint);
    return () => window.removeEventListener('beforeprint', beforePrint);
  }, [beforePrint]);

  /**
   * Exporta el reporte a PDF horizontal, paginando sin partir bloques.
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
      const scale = 2.5;
      const canvas = await html2canvas(reportRef.current, {
        scale,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      /** Zonas que no deben partirse: cada bloque de grupo. */
      const blocks = Array.from(
        reportRef.current.querySelectorAll<HTMLElement>('[data-group-block]')
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
        orientation: 'landscape',
      });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const usableW = pageW - margin * 2;
      const usableH = pageH - margin * 2 - 14;
      const maxSliceH = Math.floor((usableH * canvas.width) / usableW);

      /** Corte seguro: sube el salto al inicio del bloque que se partiría. */
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

      /* Numeración "Página X de Y" al pie derecho de cada hoja. */
      const totalPages = pdf.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        pdf.setFontSize(9);
        pdf.setTextColor(90);
        pdf.text(`Página ${p} de ${totalPages}`, pageW - margin, pageH - 10, {
          align: 'right',
        });
      }

      pdf.save(`time-line-${filters.fecha || 'reporte'}.pdf`);
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

        {/* @page dinámico: hoja horizontal por el ancho de 18 columnas */}
        <style>{`@media print { @page { size: ${PAPER_SIZES[paper].css} landscape; margin: 10mm; } }`}</style>

        {/* Contenedor exportable */}
        <div ref={reportRef} className="relative bg-background p-1 print:p-0">
          {/* Encabezado del reporte */}
          <header className="mb-4 border-b-2 border-primary pb-2 text-center">
            <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground">
              {data?.tournament || 'Time Line'}
            </h1>
            <p className="text-sm font-bold uppercase text-muted-foreground">
              {data?.course || data?.club}
              {data?.fechaFormato ? (
                <span className="text-primary"> / {data.fechaFormato}</span>
              ) : null}
            </p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              Hoyos {filters.hi}–{filters.hf} · Horario {filters.hri}–{filters.hrf} · Grupos:{' '}
              {totals.groups.toLocaleString('es-MX')} / Jugadores:{' '}
              {totals.players.toLocaleString('es-MX')}
            </p>
            <p className="text-[10px] text-muted-foreground">Generado: {generatedAt}</p>
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

          <div className="space-y-3">
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
    </div>
  );
};

export default AdminTimeLine;
