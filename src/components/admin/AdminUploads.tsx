/**
 * AdminUploads
 * -----------------------------------------------------------------------
 * Admin tab to upload, list, and delete media files served from the
 * IONOS server via `/api/uploads.php`. One sub-tab per logical section:
 *
 *   - Eventos       (images for the Eventos page poster grid)
 *   - Avisos        (images for the Avisos page poster grid)
 *   - Convocatoria  (images for the Convocatoria gallery + the downloadable
 *                    convocatoria PDF — first PDF in this section is what
 *                    the public page links to, regardless of filename)
 *   - Reglas        (the downloadable Reglas y CC PDF — first PDF in this
 *                    section is what the public page links to)
 *
 * The component is purely presentational/admin — it never alters
 * tournament data and only talks to the uploads endpoint. Data fetching
 * and mutations come from `useUploads.ts`. Files are scoped to the
 * current Host header by the backend, so each domain manages its own set.
 */

import { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Upload,
  Trash2,
  FileImage,
  FileText,
  Loader2,
  CalendarDays,
  Bell,
  ScrollText,
  BookOpen,
  HardDrive,
  Info,
} from 'lucide-react';
import {
  useUploadsList,
  useUploadFiles,
  useDeleteFile,
  type UploadSection,
  type UploadedFile,
} from '@/hooks/useUploads';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// ============= Section metadata =============

/** Display configuration for each upload section tab. */
interface SectionMeta {
  /** Backend section identifier */
  id: UploadSection;
  /** Tab label (visible) */
  label: string;
  /** Lucide icon component */
  Icon: React.ComponentType<{ className?: string }>;
  /** Short description shown above the uploader */
  description: string;
  /** `accept` attribute for the file input */
  accept: string;
  /** Whether files are images (renders thumbnails) or PDFs (renders link) */
  kind: 'image' | 'pdf';
}

const SECTIONS: SectionMeta[] = [
  {
    id: 'eventos',
    label: 'Eventos',
    Icon: CalendarDays,
    description:
      'Imágenes que aparecen en el grid de pósters de la página Eventos. Súbelas con prefijos numéricos (01-, 02-...) para controlar el orden.',
    accept: 'image/webp,image/jpeg,image/png,image/gif',
    kind: 'image',
  },
  {
    id: 'avisos',
    label: 'Avisos',
    Icon: Bell,
    description:
      'Imágenes para el grid de Avisos (clima, costos, comunicados). Mismo formato y reglas de orden que Eventos.',
    accept: 'image/webp,image/jpeg,image/png,image/gif',
    kind: 'image',
  },
  {
    id: 'convocatoria',
    label: 'Convocatoria',
    Icon: ScrollText,
    description:
      'Imágenes y PDF para la página de Convocatoria. Las imágenes se reservan para una galería futura. El primer PDF que subas se usará como "Ver en PDF" en la página pública (no importa el nombre del archivo).',
    accept: 'image/webp,image/jpeg,image/png,image/gif,application/pdf',
    kind: 'mixed',
  },
  {
    id: 'reglas',
    label: 'Reglas',
    Icon: BookOpen,
    description:
      'PDF de Reglas y Términos de Competencia. El primer PDF que subas se usará como "Ver Reglas y T. de Competencia" en la página pública (no importa el nombre del archivo).',
    accept: 'application/pdf',
    kind: 'pdf',
  },
];

/** Shared admin password (mirrors site_config.php usage). */
const ADMIN_PASSWORD = 'admin2025';

/** Format byte count as human-readable size. */
const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ============= Per-section uploader panel =============

interface SectionPanelProps {
  meta: SectionMeta;
}

/**
 * SectionPanel
 * Single section card: file picker + grid/list of existing files
 * with delete buttons.
 */
const SectionPanel = ({ meta }: SectionPanelProps) => {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState<UploadedFile | null>(null);

  const { data, isLoading, error, refetch } = useUploadsList(meta.id);
  const uploadMutation = useUploadFiles(meta.id);
  const deleteMutation = useDeleteFile(meta.id);

  /** Handle file selection — uploads immediately. */
  const handleFiles = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    const files = Array.from(filesList);
    uploadMutation.mutate(
      { files, password: ADMIN_PASSWORD },
      {
        onSuccess: (response) => {
          const okCount = response.saved.length;
          const errCount = response.errors.length;
          if (okCount > 0) {
            toast({
              title: `${okCount} archivo${okCount === 1 ? '' : 's'} subido${okCount === 1 ? '' : 's'}`,
              description: errCount > 0 ? `${errCount} con error — revisa el detalle.` : 'Listo.',
            });
          }
          if (errCount > 0) {
            toast({
              title: 'Algunos archivos fallaron',
              description: response.errors.map((e) => `${e.name}: ${e.error}`).join(' · '),
              variant: 'destructive',
            });
          }
          // Reset native input so re-selecting the same file re-triggers change.
          if (inputRef.current) inputRef.current.value = '';
        },
        onError: (err) => {
          toast({
            title: 'Error al subir',
            description: err.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  /** Confirm + execute deletion of a single file. */
  const handleConfirmDelete = () => {
    if (!confirmDelete) return;
    const target = confirmDelete;
    setConfirmDelete(null);
    deleteMutation.mutate(
      { name: target.name, password: ADMIN_PASSWORD },
      {
        onSuccess: () => {
          toast({
            title: 'Archivo eliminado',
            description: target.name,
          });
        },
        onError: (err) => {
          toast({
            title: 'Error al eliminar',
            description: err.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  const files = data?.files ?? [];

  return (
    <div className="space-y-6">
      {/* ---------- Section header + uploader ---------- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <meta.Icon className="h-5 w-5 text-primary" />
            {meta.label}
          </CardTitle>
          <CardDescription>{meta.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hidden native input — triggered by the visible button below */}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={meta.accept}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="gap-2"
            >
              {uploadMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Subir {meta.kind === 'pdf' ? 'PDF' : 'imágenes'}
            </Button>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" />
              Máx. 15 MB por archivo · Tipos permitidos:{' '}
              {meta.kind === 'pdf' ? 'PDF' : 'WebP, JPG, PNG, GIF'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ---------- Existing files list ---------- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            Archivos en el servidor
            <Badge variant="secondary" className="ml-1">{files.length}</Badge>
          </CardTitle>
          <CardDescription>
            Los cambios se aplican inmediatamente para todos los visitantes del dominio actual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-8 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando archivos...
            </div>
          ) : error ? (
            <div className="text-sm text-destructive py-4">
              Error al cargar la lista: {(error as Error).message}
              <Button variant="link" size="sm" onClick={() => refetch()} className="ml-2">
                Reintentar
              </Button>
            </div>
          ) : files.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No hay archivos en esta sección todavía. Usa el botón "Subir" para agregar.
            </p>
          ) : meta.kind === 'image' ? (
            // ---------- Image grid: thumbnail + name + delete ----------
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {files.map((file) => (
                <FileCard
                  key={file.name}
                  file={file}
                  onDelete={() => setConfirmDelete(file)}
                  isDeleting={deleteMutation.isPending && deleteMutation.variables?.name === file.name}
                />
              ))}
            </div>
          ) : (
            // ---------- PDF list: simple rows ----------
            <ul className="divide-y divide-border rounded-md border border-border">
              {files.map((file) => (
                <li
                  key={file.name}
                  className="flex items-center justify-between gap-3 px-3 py-2"
                >
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 min-w-0 flex-1 hover:text-primary"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatBytes(file.size)}
                    </span>
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setConfirmDelete(file)}
                    aria-label={`Eliminar ${file.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ---------- Confirm delete dialog ---------- */}
      <AlertDialog
        open={confirmDelete !== null}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar archivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente <strong>{confirmDelete?.name}</strong> del servidor.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ============= Single file card (image preview) =============

interface FileCardProps {
  file: UploadedFile;
  onDelete: () => void;
  isDeleting: boolean;
}

/** Thumbnail card with hover overlay + delete button. */
const FileCard = ({ file, onDelete, isDeleting }: FileCardProps) => {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border border-border bg-card',
        'transition-shadow hover:shadow-md',
        isDeleting && 'opacity-50 pointer-events-none'
      )}
    >
      <a
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block aspect-[9/16] w-full bg-muted overflow-hidden"
        aria-label={`Ver ${file.name} en tamaño completo`}
      >
        <img
          src={file.url}
          alt={file.alt}
          loading="lazy"
          className="h-full w-full object-contain transition-transform group-hover:scale-105"
        />
      </a>
      <div className="p-2 space-y-1">
        <p className="text-xs font-medium truncate" title={file.name}>
          <FileImage className="h-3 w-3 inline mr-1 text-muted-foreground" />
          {file.name}
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-muted-foreground">{formatBytes(file.size)}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
            disabled={isDeleting}
            aria-label={`Eliminar ${file.name}`}
          >
            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ============= Top-level component =============

/**
 * AdminUploads
 * Wrapper card with sub-tabs (one per section).
 */
const AdminUploads = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Subida de archivos
        </CardTitle>
        <CardDescription>
          Sube imágenes y PDFs directamente al servidor. Los cambios se reflejan al
          instante en las páginas correspondientes — no requiere re-deploy.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="eventos" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            {SECTIONS.map((s) => (
              <TabsTrigger key={s.id} value={s.id} className="gap-2">
                <s.Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{s.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {SECTIONS.map((s) => (
            <TabsContent key={s.id} value={s.id}>
              <SectionPanel meta={s} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminUploads;