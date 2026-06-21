/**
 * Banderas (Pin Sheet) Page
 * ---------------------------------------------------------------
 * Public page that visualizes the pin positions for the current
 * tournament round. Layout:
 *   1. PageHero with banderas-hero.jpg
 *   2. Custom 18-hole grid built from `PIN_SHEET_HOLES` (GreenCard.tsx)
 *   3. Optional gallery of admin-uploaded copies (PDF + scans) coming
 *      from `/api/uploads/{domain}/banderas/`. PDFs render as a
 *      downloadable row, images as a thumbnail grid + lightbox — same
 *      visual treatment used in Eventos / Premios / Avisos.
 *
 * Admins manage uploads from /admin → tab "Archivos" → sub-tab
 * "Banderas".
 */

import { useCallback, useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import GreenCard from '@/components/banderas/GreenCard';
import { PIN_SHEET_HOLES, PIN_SHEET_META } from '@/data/banderasData';
import { useUploadsList, type UploadedFile } from '@/hooks/useUploads';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, FileText, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import banderasHero from '@/assets/banderas-hero.jpg';

/** Decide whether an uploaded file is a PDF based on its extension. */
const isPdf = (name: string) => /\.pdf$/i.test(name);

const Banderas = () => {
  // ----- Server-side uploads (PDF + image scans) -----
  const { data: uploads } = useUploadsList('banderas');
  const files: UploadedFile[] = uploads?.files ?? [];
  const pdfs = files.filter((f) => isPdf(f.name));
  const images = files.filter((f) => !isPdf(f.name));

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
        title={PIN_SHEET_META.title}
        subtitle={`${PIN_SHEET_META.subtitle} · ${PIN_SHEET_META.dateLabel}`}
        backgroundImage={banderasHero}
        backgroundPosition="center 60%"
      />

      {/* ====== Legend ====== */}
      <section className="bg-muted/40 border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-xs">
                F
              </span>
              <div>
                <p className="font-semibold text-foreground">Frente</p>
                <p className="text-muted-foreground text-xs">
                  Pasos desde el borde frontal del green hasta el pin.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-xs">
                I/D
              </span>
              <div>
                <p className="font-semibold text-foreground">Izq / Der</p>
                <p className="text-muted-foreground text-xs">
                  Pasos desde el borde lateral más cercano al pin.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-xs">
                D
              </span>
              <div>
                <p className="font-semibold text-foreground">Depth</p>
                <p className="text-muted-foreground text-xs">
                  Profundidad total del green: frente → fondo.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-xs">
                ±
              </span>
              <div>
                <p className="font-semibold text-foreground">Pendiente</p>
                <p className="text-muted-foreground text-xs">
                  Inclinación del green en el lugar del pin. Positivo = subida, negativo = bajada.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== Custom 18-hole grid ====== */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {PIN_SHEET_HOLES.map((h) => (
              <GreenCard key={h.hole} data={h} />
            ))}
          </div>
        </div>
      </section>

      {/* ====== Optional uploaded copies (PDF + scans) ====== */}
      {(pdfs.length > 0 || images.length > 0) && (
        <section className="py-12 bg-muted/30 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
                Documentos Oficiales
              </h2>
              <p className="text-muted-foreground">
                Versiones originales del pin sheet — descarga o consulta.
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