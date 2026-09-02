/**
 * PdfPreviewDialog
 * -----------------------------------------------------------------------
 * Botón reutilizable que abre un diálogo con la PREVISUALIZACIÓN en línea
 * de un PDF (iframe) antes de permitir su descarga o apertura en pestaña
 * nueva. Regla del proyecto: todos los PDFs se muestran primero en
 * previsualización y sólo después se ofrece "Descargar".
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

import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FileText, Download, ExternalLink } from 'lucide-react';

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

        {/* 1) Previsualización en línea — ocupa el cuerpo del diálogo */}
        {open && (
          <iframe
            src={url}
            title={title ?? label}
            className="flex-1 w-full rounded border bg-muted/20"
          />
        )}

        {/* 2) Acciones secundarias: descargar / abrir en pestaña nueva */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button asChild variant="outline" className="gap-2">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" /> Abrir en pestaña nueva
            </a>
          </Button>
          <Button asChild variant="secondary" className="gap-2">
            <a href={url} download={fileName || true as unknown as string}>
              <Download className="h-4 w-4" /> Descargar PDF
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfPreviewDialog;
