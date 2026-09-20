/**
 * PdfPreviewDialog
 * -----------------------------------------------------------------------
 * Botón reutilizable que abre un diálogo con la PREVISUALIZACIÓN en línea
 * de un PDF antes de permitir su descarga o apertura en pestaña nueva.
 * Regla del proyecto: todos los PDFs se muestran primero en
 * previsualización y sólo después se ofrece "Descargar".
 *
 * Renderizado uniforme: pdf.js dibuja TODAS las páginas apiladas dentro
 * de un área con scroll vertical propio en móvil, tableta y escritorio.
 * Evita depender del plugin PDF del navegador, que en algunos equipos
 * sólo presenta la primera página. El visor se importa con React.lazy
 * para que pdf.js no engorde el bundle inicial.
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

import { ReactNode, Suspense, lazy, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FileText, Download, ExternalLink, Menu } from 'lucide-react';

/**
 * Visor móvil (pdf.js, página por página) con code splitting: el chunk
 * de react-pdf sólo se descarga cuando alguien abre la previsualización.
 */
const PdfMobileViewer = lazy(() => import('@/components/shared/PdfMobileViewer'));

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
  /** Nombre legible mostrado en la barra superior del visor. */
  const displayFileName = useMemo(() => {
    if (fileName) return fileName;
    const cleanUrl = url.split('?')[0];
    const lastSegment = cleanUrl.split('/').pop();
    if (!lastSegment) return `${title ?? label}.pdf`;
    try {
      return decodeURIComponent(lastSegment);
    } catch {
      return lastSegment;
    }
  }, [fileName, label, title, url]);

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
      <DialogContent className="flex h-[96dvh] w-[calc(100vw-1rem)] max-w-6xl flex-col gap-0 overflow-hidden p-0 sm:h-[92vh] sm:w-[calc(100vw-2rem)]">
        {/* Encabezado fijo del diálogo, separado del documento desplazable. */}
        <DialogHeader className="shrink-0 border-b px-4 py-4 pr-14 sm:px-6">
          <DialogTitle className="truncate text-left">{title ?? label}</DialogTitle>
        </DialogHeader>

        {/* Barra del archivo inspirada en el visor de referencia. */}
        <div className="flex shrink-0 items-center gap-3 bg-primary px-4 py-4 text-primary-foreground sm:px-6">
          <Menu className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="truncate text-sm font-semibold sm:text-base">{displayFileName}</span>
        </div>

        {/* El visor continuo es el mismo en móvil, tableta y escritorio. */}
        {open && (
          <Suspense
            fallback={
              <div className="flex min-h-0 flex-1 w-full items-center justify-center bg-muted">
                <p className="text-sm text-muted-foreground">Cargando visor…</p>
              </div>
            }
          >
            <PdfMobileViewer url={url} />
          </Suspense>
        )}

        {/* Acciones fijas: permanecen visibles mientras el PDF se desplaza. */}
        <div className="grid shrink-0 gap-2 border-t bg-background p-3 sm:grid-cols-2 sm:p-4">
          <Button asChild className="h-11 gap-2 sm:order-2">
            <a href={url} download={fileName ?? ''}>
              <Download className="h-4 w-4" /> Descargar PDF
            </a>
          </Button>
          <Button asChild variant="outline" className="h-11 gap-2 sm:order-1">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" /> Abrir en pestaña nueva
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfPreviewDialog;
