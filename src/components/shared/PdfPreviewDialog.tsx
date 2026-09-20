/**
 * PdfPreviewDialog
 * -----------------------------------------------------------------------
 * Botón reutilizable que abre un diálogo con la PREVISUALIZACIÓN en línea
 * de un PDF antes de permitir su descarga o apertura en pestaña nueva.
 * Regla del proyecto: todos los PDFs se muestran primero en
 * previsualización y sólo después se ofrece "Descargar".
 *
 * Renderizado por dispositivo:
 *  - ESCRITORIO (≥ sm): iframe nativo; el visor del navegador maneja el
 *    scroll interno de todas las páginas.
 *  - MÓVIL (< sm): los plugins nativos de PDF en iframe (iOS/Safari y
 *    varios Android) sólo renderizan la PRIMERA página y no permiten
 *    scroll interno. Por eso el PDF se dibuja página por página con
 *    react-pdf (pdf.js) dentro de un contenedor con overflow-y-auto,
 *    de modo que el scroll vertical táctil recorra TODAS las páginas.
 *
 * Props:
 *  - url:        URL del PDF a previsualizar (requerido).
 *  - label:      Texto del botón disparador.
 *  - fileName:   Nombre sugerido al descargar.
 *  - title:      Título del diálogo (por defecto = label).
 *  - icon:       Ícono opcional dentro del botón.
 *  - Resto de props visuales del Button (variant, size, className).
 *  - trigger:    Nodo custom que reemplaza al botón por defecto.
 */

import { ReactNode, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FileText, Download, ExternalLink } from 'lucide-react';
// react-pdf (pdf.js): renderizado página a página para el visor móvil.
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

/** Worker de pdf.js resuelto por Vite como asset del bundle. */
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

/** Media query que define "móvil" para el visor (breakpoint sm de Tailwind). */
const MOBILE_MQ = '(max-width: 639px)';

/**
 * Hook: true cuando el viewport es menor al breakpoint `sm`.
 * Se re-evalúa al cambiar el tamaño de la ventana (rotación, resize).
 */
const useIsMobileViewport = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_MQ).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isMobile;
};

interface PdfPreviewDialogProps {
  /** URL absoluta o relativa del archivo PDF. */
  url: string;
  /** Texto mostrado en el botón disparador. */
  label: string;
  /** Nombre sugerido del archivo al descargar. */
  fileName?: string;
  /** Título del diálogo (por defecto usa `label`). */
  title?: string;
  /** Ícono dentro del botón por defecto. */
  icon?: ReactNode;
  /** Variante del botón disparador. */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  /** Tamaño del botón disparador. */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Clases extra para el botón disparador. */
  className?: string;
  /** Disparador personalizado (reemplaza al botón por defecto). */
  trigger?: ReactNode;
}

const PdfPreviewDialog = ({
  url,
  label,
  fileName,
  title,
  icon,
  variant = 'default',
  size = 'lg',
  className,
  trigger,
}: PdfPreviewDialogProps) => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobileViewport();

  // ----- Estado del visor móvil (react-pdf) -----
  /** Número total de páginas del documento (lo reporta pdf.js al cargar). */
  const [numPages, setNumPages] = useState<number>(0);
  /** Ancho disponible del contenedor para escalar cada página al 100%. */
  const [pageWidth, setPageWidth] = useState<number>(0);
  /** Referencia al contenedor scrollable para medir su ancho. */
  const scrollRef = useRef<HTMLDivElement>(null);

  /**
   * Medir el ancho del contenedor móvil (y re-medir en resize/rotación)
   * para que cada página del PDF ocupe exactamente el ancho visible.
   */
  useEffect(() => {
    if (!open || !isMobile) return;
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => setPageWidth(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [open, isMobile]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant={variant} size={size} className={className}>
            {icon ?? <FileText className="h-5 w-5" />}
            {label}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col gap-3">
        <DialogHeader>
          <DialogTitle className="truncate">{title ?? label}</DialogTitle>
        </DialogHeader>

        {/* 1) Previsualización en línea — ocupa el cuerpo del diálogo. */}
        {open && (
          isMobile ? (
            /* MÓVIL: pdf.js dibuja TODAS las páginas apiladas verticalmente;
               el contenedor hace scroll vertical nativo (táctil incluido). */
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
                    No se pudo mostrar la previsualización. Usa "Abrir en
                    pestaña nueva" para ver el documento.
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
          ) : (
            /* ESCRITORIO: iframe con el visor nativo del navegador. */
            <div className="flex-1 w-full overflow-hidden rounded border bg-muted/20">
              <iframe
                src={url}
                title={title ?? label}
                className="w-full h-full"
              />
            </div>
          )
        )}

        {/* 2) Acciones secundarias: descargar / abrir en pestaña nueva */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button asChild variant="outline" className="gap-2">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" /> Abrir en pestaña nueva
            </a>
          </Button>
          <Button asChild variant="secondary" className="gap-2">
            <a href={url} download={fileName ?? ''}>
              <Download className="h-4 w-4" /> Descargar PDF
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfPreviewDialog;
