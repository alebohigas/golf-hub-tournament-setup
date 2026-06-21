/**
 * Banderas (Pin Sheet) Page
 * ---------------------------------------------------------------
 * Página pública del pin sheet del torneo activo.
 *
 *  - Los datos vienen 100% de la BD (tabla `banderas`) vía `useBanderas()`.
 *  - Si el torneo no tiene filas cargadas, se muestra un mensaje de
 *    disculpa al jugador (NO valores hardcodeados). El admin puede
 *    además ocultar la página completa desde /admin → Página.
 *  - Si hay PDF / imágenes subidas en /admin → Archivos → Banderas, se
 *    muestran como "Documentos Oficiales" (descarga + lightbox).
 */

import { useCallback, useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import GreenCard from '@/components/banderas/GreenCard';
import { useBanderas } from '@/hooks/useBanderasData';
import { useUploadsList, type UploadedFile } from '@/hooks/useUploads';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, FileText, Download, Loader2, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import banderasHero from '@/assets/banderas-hero.jpg';

/** ¿Es un PDF? Decide cómo se renderiza el archivo subido. */
const isPdf = (name: string) => /\.pdf$/i.test(name);

const Banderas = () => {
  // ----- Datos del pin sheet (BD) ----------------------------------
  const { data: banderasData, isLoading } = useBanderas();
  const holes = banderasData?.holes ?? [];
  const hasHoles = holes.length > 0;

  // ----- Archivos subidos (PDF + scans) ----------------------------
  const { data: uploads } = useUploadsList('banderas');
  const files: UploadedFile[] = uploads?.files ?? [];
  const pdfs = files.filter((f) => isPdf(f.name));
  const images = files.filter((f) => !isPdf(f.name));

  // ----- Lightbox para galería de imágenes -------------------------
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
        subtitle="Pin sheet oficial del torneo"
        backgroundImage={banderasHero}
        backgroundPosition="center 60%"
      />

      {/* ====== Estado: cargando ====== */}
      {isLoading && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando pin sheet…
          </div>
        </section>
      )}

      {/* ====== Estado: sin datos cargados (mensaje de disculpa) ====== */}
      {!isLoading && !hasHoles && pdfs.length === 0 && images.length === 0 && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Flag className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
              Pin sheet aún no disponible
            </h2>
            <p className="text-muted-foreground">
              Disculpa las molestias — todavía no hay información de posición de banderas
              cargada para este torneo. Vuelve a revisar más cerca de la fecha de juego.
            </p>
          </div>
        </section>
      )}

      {/* ====== Leyenda + grid de hoyos (sólo si hay datos) ====== */}
      {!isLoading && hasHoles && (
        <>
          {/* ===== Leyenda ===== */}
          <section className="bg-muted/40 border-b border-border">
            <div className="container mx-auto px-4 py-8">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-1">
                  Cómo leer cada green
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  Cada tarjeta representa un green visto desde arriba, con el frente abajo. Los números significan:
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

          {/* ===== Grid 18 hoyos ===== */}
          <section className="py-12 bg-background">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {holes.map((h) => (
                  <GreenCard key={h.hole} data={h} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ====== Documentos oficiales (PDF / imágenes) ====== */}
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

            {/* PDFs */}
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

            {/* Imágenes */}
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
