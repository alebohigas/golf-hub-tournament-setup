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
 *    scroll interno. Por eso se usa PdfMobileViewer (react-pdf/pdf.js),
 *    que dibuja TODAS las páginas apiladas en un contenedor con scroll
 *    vertical. Ese visor se importa con React.lazy para que pdf.js no
 *    engorde el bundle inicial.
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

import { ReactNode, Suspense, lazy, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FileText, Download, ExternalLink } from 'lucide-react';

/**
 * Visor móvil (pdf.js, página por página) con code splitting: el chunk
 * de react-pdf sólo se descarga cuando alguien abre la previsualización.
 */
const PdfMobileViewer = lazy(() => import('@/components/shared/PdfMobileViewer'));

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
            <Suspense
              fallback={
                <div className="flex-1 w-full rounded border bg-muted/20 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Cargando visor…</p>
                </div>
              }
            >
              <PdfMobileViewer url={url} />
            </Suspense>
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
