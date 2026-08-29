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
 *  Encabezado: CATEGORÍA (izquierda) · Hoyo · Hora/Tee. */
const GroupBlock = ({ group }: { group: SalidasImpresionGroup }) => (
  <div className="break-inside-avoid rounded-sm border border-border bg-card">
    <div className="grid grid-cols-[1fr_3rem_1fr] items-center gap-2 bg-muted px-2 py-1.5">
      <span className="truncate text-xs font-bold uppercase text-primary">
        {group.shortName || group.categoryName}
      </span>
      <span className="text-sm font-bold text-foreground">
        {group.hole !== null ? `H${String(group.hole).padStart(2, '0')}` : '—'}
      </span>
      <span className="text-right text-sm font-bold text-foreground">
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

  const { data, isLoading, isError } = useSalidasImpresionReport(filters);

  /** Nodo del reporte (encabezado + rejilla) usado para exportar a PDF. */
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

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
              onClick={exportPdf}
              disabled={exporting || isLoading || (data?.groups.length ?? 0) === 0}
            >
              {exporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="mr-2 h-4 w-4" />
              )}
              Exportar PDF
            </Button>
            <Button onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </div>

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
