/**
 * Banderas (Pin Sheet) Page
 * ---------------------------------------------------------------
 * Página pública que muestra el pin sheet oficial del torneo activo.
 * Dos fuentes complementarias, ambas ligadas al `torneo_id` activo:
 *
 *   1. Datos estructurados — tabla `banderas_pin_sheet` (BD MySQL).
 *      El admin captura los 18 hoyos desde /admin → Banderas. La
 *      página los renderiza con la visualización custom (GreenCard).
 *
 *   2. Documentos oficiales — archivos subidos por el admin desde
 *      /admin → Archivos → Banderas (PDF + imágenes). Se muestran
 *      debajo de la grid como respaldo descargable.
 *
 * Si NO hay datos estructurados ni archivos para el torneo activo,
 * la página muestra un mensaje de disculpa para no confundir a los
 * jugadores con información de otro torneo. El admin puede ocultar
 * la ruta entera desde /admin → Páginas → Visibilidad.
 */

import { useCallback, useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { useUploadsList, type UploadedFile } from '@/hooks/useUploads';
import { useBanderas } from '@/hooks/useBanderas';
import GreenCard from '@/components/banderas/GreenCard';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, FileText, Download, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import banderasHero from '@/assets/banderas-hero.jpg';

/** Decide whether an uploaded file is a PDF based on its extension. */
const isPdf = (name: string) => /\.pdf$/i.test(name);

const Banderas = () => {
  // ----- Datos estructurados desde la BD (por torneo) -----
  const { data: banderasData } = useBanderas();
  const holes = banderasData?.holes ?? [];
  const round = banderasData?.round ?? null;
  const hasHoles = holes.length > 0;

  // ----- Archivos subidos (PDF + escaneos) -----
  const { data: uploads } = useUploadsList('banderas');
  const files: UploadedFile[] = uploads?.files ?? [];
  const pdfs = files.filter((f) => isPdf(f.name));
  const images = files.filter((f) => !isPdf(f.name));
  const hasFiles = pdfs.length > 0 || images.length > 0;

  /** Si nada hay (ni datos ni archivos) mostramos disculpa. */
  const hasContent = hasHoles || hasFiles;

  // ----- Lightbox state for image gallery -----
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const goPrev = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }, [images.length]);
  const goNext = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);
  useEffect(() => {
    if (openIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openIndex, goPrev, goNext]);
  const current = openIndex !== null ? images[openIndex] : null;

  return (
    <Layout>
      <PageHero
        title="Posición de Banderas"
        subtitle={
          round?.round_label || round?.round_date
            ? [round?.round_label, round?.round_date].filter(Boolean).join(' · ')
            : 'Pin sheet oficial del día — distancias y posición de la bandera por hoyo.'
        }
        backgroundImage={banderasHero}
        backgroundPosition="center 60%"
      />

      {/* ====== Empty state ====== */}
      {!hasContent && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-5">
                <Flag className="h-7 w-7 text-muted-foreground" />
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
                Pin sheet no disponible
              </h2>
              <p className="text-muted-foreground">
                Una disculpa — todavía no se ha publicado la posición de banderas
                para este torneo. En cuanto el comité suba el documento oficial
                aparecerá aquí automáticamente.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ====== Legend (sólo cuando hay datos estructurados) ====== */}
      {hasHoles && (
        <section className="bg-muted/40 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-1">
              Cómo leer el pin sheet
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              Cada green se muestra visto desde arriba, con el frente del green hacia abajo. Los números significan:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary font-bold text-xs">
                  Depth
                </span>
                <div>
                  <p className="font-semibold text-foreground">Profundidad total del green</p>
                  <p className="text-muted-foreground text-xs">
                    Distancia completa del frente al fondo del green (en pasos / yardas).
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary font-bold text-xs">
                  ↕
                </span>
                <div>
                  <p className="font-semibold text-foreground">Número vertical</p>
                  <p className="text-muted-foreground text-xs">
                    Distancia desde el <strong>frente del green</strong> hasta la bandera.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary font-bold text-xs">
                  ↔
                </span>
                <div>
                  <p className="font-semibold text-foreground">Número horizontal</p>
                  <p className="text-muted-foreground text-xs">
                    Distancia desde el <strong>lado indicado</strong> (izquierdo o derecho) hasta la bandera.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary font-bold text-xs">
                  ±
                </span>
                <div>
                  <p className="font-semibold text-foreground">Número en cuadrito (vs Centro)</p>
                  <p className="text-muted-foreground text-xs">
                    Posición de la bandera respecto al <strong>centro del green</strong>:
                    {' '}positivo = hacia el fondo, negativo = hacia el frente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>
      )}

      {/* ====== Grid de los 18 greens (visualización custom) ====== */}
      {hasHoles && (
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {holes.map((h) => (
                <GreenCard key={h.hole_number} data={h} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====== Documentos oficiales subidos (PDF + escaneos) ====== */}
      {hasFiles && (
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
                Documento Oficial
              </h2>
              <p className="text-muted-foreground">
                Versión publicada por el comité del torneo.
              </p>
            </div>

            {/* PDFs as a list */}
            {pdfs.length > 0 && (
              <ul className="max-w-2xl mx-auto divide-y divide-border rounded-lg border border-border bg-card mb-8">
                {pdfs.map((p) => (
                  <li key={p.name} className="flex items-center gap-3 px-4 py-3">
                    <FileText className="h-5 w-5 text-primary shrink-0" />
                    <span className="flex-1 text-sm font-medium truncate">{p.name}</span>
                    <Button asChild variant="outline" size="sm" className="gap-2">
                      <a href={p.url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                        Ver / Descargar
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            {/* Images as a poster grid + lightbox */}
            {images.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <button
                    key={img.name}
                    type="button"
                    onClick={() => setOpenIndex(idx)}
                    className={cn(
                      'group relative overflow-hidden rounded-lg border border-border/50 bg-card',
                      'shadow-card transition-all duration-300',
                      'hover:shadow-elegant hover:-translate-y-1 hover:border-primary/40',
                    )}
                    aria-label={`Ver ${img.alt} en grande`}
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-card flex items-center justify-center">
                      <img
                        src={img.url}
                        alt={img.alt}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Lightbox */}
          <Dialog open={openIndex !== null} onOpenChange={(o) => !o && setOpenIndex(null)}>
            <DialogContent
              className={cn(
                'max-w-3xl w-[95vw] p-0 bg-transparent border-0 shadow-none',
                '[&>button]:hidden',
              )}
            >
              <DialogTitle className="sr-only">
                {current ? current.alt : 'Pin sheet'}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Vista ampliada del pin sheet. Use las flechas para navegar.
              </DialogDescription>
              {current && (
                <div className="relative">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 z-10 rounded-full bg-background/80 backdrop-blur hover:bg-background"
                    onClick={() => setOpenIndex(null)}
                    aria-label="Cerrar"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur hover:bg-background"
                        onClick={goPrev}
                        aria-label="Imagen anterior"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur hover:bg-background"
                        onClick={goNext}
                        aria-label="Imagen siguiente"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                    </>
                  )}
                  <img
                    src={current.url}
                    alt={current.alt}
                    className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                  />
                  {images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-background/80 backdrop-blur text-xs text-foreground font-medium">
                      {(openIndex ?? 0) + 1} / {images.length}
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </section>
      )}
    </Layout>
  );
};

export default Banderas;