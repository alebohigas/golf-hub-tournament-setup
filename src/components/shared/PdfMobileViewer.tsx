/**
 * PdfMobileViewer
 * -----------------------------------------------------------------------
 * Visor de PDF para MÓVIL usado por PdfPreviewDialog. Se carga con
 * React.lazy (code splitting) para que react-pdf/pdf.js (~500 KB) no
 * engorde el bundle inicial: sólo se descarga al abrir el diálogo en
 * un viewport < sm.
 *
 * Motivo de su existencia: los plugins nativos de PDF en iframe de
 * iOS/Safari (y varios Android) sólo renderizan la PRIMERA página y no
 * permiten scroll interno. Aquí pdf.js dibuja TODAS las páginas
 * apiladas verticalmente dentro de un contenedor con overflow-y-auto,
 * de modo que el scroll vertical táctil recorra el documento completo.
 *
 * Props:
 *  - url: URL absoluta o relativa del PDF.
 */

import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

/** Worker de pdf.js resuelto por Vite como asset del bundle. */
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PdfMobileViewerProps {
  /** URL absoluta o relativa del archivo PDF. */
  url: string;
}

const PdfMobileViewer = ({ url }: PdfMobileViewerProps) => {
  /** Número total de páginas del documento (lo reporta pdf.js al cargar). */
  const [numPages, setNumPages] = useState<number>(0);
  /** Ancho disponible del contenedor para escalar cada página al 100%. */
  const [pageWidth, setPageWidth] = useState<number>(0);
  /** Referencia al contenedor scrollable para medir su ancho. */
  const scrollRef = useRef<HTMLDivElement>(null);

  /**
   * Medir el ancho del contenedor (y re-medir en resize/rotación) para
   * que cada página del PDF ocupe exactamente el ancho visible.
   */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => setPageWidth(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={scrollRef}
      className="flex-1 w-full overflow-y-auto rounded border bg-muted/20 touch-pan-y overscroll-contain"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <Document
        file={url}
        onLoadSuccess={({ numPages: n }) => setNumPages(n)}
        loading={
          <p className="p-6 text-center text-sm text-muted-foreground">
            Cargando PDF…
          </p>
        }
        error={
          <p className="p-6 text-center text-sm text-muted-foreground">
            No se pudo mostrar la previsualización. Usa "Abrir en pestaña
            nueva" para ver el documento.
          </p>
        }
      >
        {pageWidth > 0 &&
          Array.from({ length: numPages }, (_, i) => (
            <Page
              key={`page_${i + 1}`}
              pageNumber={i + 1}
              width={pageWidth}
              className="border-b last:border-b-0"
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          ))}
      </Document>
    </div>
  );
};

export default PdfMobileViewer;
