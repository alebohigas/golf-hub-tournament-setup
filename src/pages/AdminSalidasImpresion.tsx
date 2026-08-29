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

import { useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Loader2, FileDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
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



/** Renglón de jugador con logo de club. */
const PlayerRow = ({ name, clubLogo }: { name: string; clubLogo: string }) => (
  <div className="flex items-center gap-3 border-b border-border px-2 py-1.5 last:border-b-0">
    <span className="flex h-6 w-10 shrink-0 items-center justify-center">
      {clubLogo ? (
        <img
          src={clubLogo}
          alt=""
          className="h-6 max-w-10 object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
          }}
        />
      ) : null}
    </span>
    <span className="truncate text-sm font-semibold text-foreground">{name}</span>
  </div>
);

/** Bloque de un grupo de salida (encabezado + jugadores).
 *  Encabezado en 3 celdas de ancho fijo para evitar saltos de layout:
 *  CATEGORÍA (izquierda, ancho flexible) · Hoyo (3rem) · Hora/Tee (ancho automático). */
const GroupBlock = ({ group }: { group: SalidasImpresionGroup }) => (
  <div className="break-inside-avoid rounded-sm border border-border bg-card">
    <div className="grid grid-cols-[minmax(0,1fr)_3rem_auto] items-center gap-2 bg-muted px-2 py-1.5">
      <span
        className="truncate text-left text-xs font-bold uppercase text-primary"
        title={group.categoryName}
      >
        {group.shortName || group.categoryName}
      </span>
      <span className="text-left text-sm font-bold tabular-nums text-foreground">
        {group.hole !== null ? `H${String(group.hole).padStart(2, '0')}` : '—'}
      </span>
      <span className="whitespace-nowrap text-left text-sm font-bold tabular-nums text-foreground">
        {group.time}
        {group.tee ? ` / ${group.tee}` : ''}
      </span>
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
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const usableW = pageW - margin * 2;
      const usableH = pageH - margin * 2;
      /** Alto en píxeles del canvas que cabe en una hoja. */
      const sliceH = Math.floor((usableH * canvas.width) / usableW);

      for (let offset = 0, page = 0; offset < canvas.height; offset += sliceH, page++) {
        const h = Math.min(sliceH, canvas.height - offset);
        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = h;
        slice
          .getContext('2d')!
          .drawImage(canvas, 0, offset, canvas.width, h, 0, 0, canvas.width, h);
        if (page > 0) pdf.addPage();
        pdf.addImage(
          slice.toDataURL('image/jpeg', 0.92),
          'JPEG',
          margin,
          margin,
          usableW,
          (h * usableW) / canvas.width
        );
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

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2">
          {data?.groups.map((g) => (
            <GroupBlock key={g.id} group={g} />
          ))}
        </div>

        {/* Pie del reporte: torneo, fecha, rango de hoyos/horario y timestamp */}
        <footer className="mt-6 border-t-2 border-primary pt-2 text-[10px] text-muted-foreground">
          <p className="font-bold uppercase text-foreground">
            {data?.tournament || 'Salidas'}
            {data?.fechaFormato ? ` — ${data.fechaFormato}` : ''}
          </p>
          <p>
            Hoyos {filters.hi}–{filters.hf} · Horario {filters.hri}–{filters.hrf} · Generado: {generatedAt}
          </p>
        </footer>
        </div>
      </div>
    </div>

  );
};

export default AdminSalidasImpresion;
