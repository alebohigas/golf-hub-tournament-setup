/**
 * ShowcaseRotator — `/showcase/rotacion`
 * ----------------------------------------------------------------------------
 * Página fullscreen sin layout que rota slides de showcase (reportes 300,
 * Mejor Score Diario, brackets putt) según una configuración codificada
 * en el `#hash` de la URL.
 *
 * Comportamiento:
 *  - Lee `#<base64-json>` y lo decodifica con decodeShowcaseConfig().
 *  - Si no hay hash o está corrupto → fallback: rota TODOS los slides
 *    disponibles con segundos por defecto (30s).
 *  - Muestra una barra de progreso superior + contador "i/N" + título.
 *  - El componente del slide actual hace su propio fetch en intervalos
 *    POLL_ACTIVE, por lo que los datos se mantienen frescos sin recargar
 *    la página.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  decodeShowcaseConfig,
  parseSlideId,
  type ShowcaseConfig,
} from '@/lib/showcaseSlides';
import { useShowcaseSlides } from '@/hooks/useShowcaseSlides';
import Showcase300Slide from '@/components/showcase/slides/Showcase300Slide';
import MejorScoreSlide from '@/components/showcase/slides/MejorScoreSlide';
import BracketSlide from '@/components/showcase/slides/BracketSlide';
import PuttCalificadosSlide from '@/components/showcase/slides/PuttCalificadosSlide';
import MatchPlaySlide from '@/components/showcase/slides/MatchPlaySlide';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { getTournamentUrl, POLL_SLOW } from '@/config/api';
import { Loader2 } from 'lucide-react';

/** Info mínima del torneo para mostrar el header arriba. */
interface TournamentInfo {
  tournament?: { name?: string; club?: string; logo?: string };
}

/** Lee el hash sin el `#` inicial. */
const readHash = (): string => {
  if (typeof window === 'undefined') return '';
  return (window.location.hash || '').replace(/^#/, '');
};

/** Renderiza el slide apropiado según su id. */
const renderSlide = (id: string) => {
  const { kind, parts } = parseSlideId(id);
  if (kind === 's300') {
    return <Showcase300Slide tipo={parts[0]} prizeIdx={Number(parts[1])} />;
  }
  if (kind === 'mejor') {
    return <MejorScoreSlide fecha={parts[0]} />;
  }
  if (kind === 'bracket') {
    return <BracketSlide sexo={parts[0] as 'M' | 'F'} kind={parts[1]} />;
  }
  if (kind === 'qual') {
    return <PuttCalificadosSlide sexo={parts[0] as 'M' | 'F'} />;
  }
  if (kind === 'matchplay') {
    // El catid puede contener ':' internos — recomponemos juntando las partes.
    return <MatchPlaySlide catid={parts.join(':')} />;
  }
  return (
    <div className="max-w-4xl mx-auto p-6 rounded bg-card text-muted-foreground text-center">
      Slide desconocido: <code>{id}</code>
    </div>
  );
};

const ShowcaseRotator = () => {
  /** Config decodificada del hash (o null si no hay). */
  const [config, setConfig] = useState<ShowcaseConfig | null>(() => {
    const h = readHash();
    return h ? decodeShowcaseConfig(h) : null;
  });

  /** Reaccionar a cambios de hash en caliente (útil al testear). */
  useEffect(() => {
    const onHash = () => {
      const h = readHash();
      setConfig(h ? decodeShowcaseConfig(h) : null);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  /** Fallback: si no hay config, listar TODOS los slides disponibles. */
  const fallback = useShowcaseSlides();

  /** Config efectiva (usuario o fallback con todo). */
  const effective: ShowcaseConfig | null = useMemo(() => {
    if (config && config.slides.length > 0) return config;
    if (fallback.isLoading) return null;
    if (!fallback.all.length) return { defaultSeconds: 30, slides: [] };
    return {
      defaultSeconds: 30,
      slides: fallback.all.map((s) => ({ id: s.id })),
    };
  }, [config, fallback.isLoading, fallback.all]);

  /** Tournament header (mismo estilo que /showcase/:tipo). */
  const { data: tInfo } = useQuery<TournamentInfo>({
    queryKey: ['rotator-tournament'],
    queryFn: () => apiFetch<TournamentInfo>(getTournamentUrl()),
    staleTime: POLL_SLOW,
  });

  /** Índice del slide activo. */
  const [idx, setIdx] = useState(0);

  /** Progreso 0..1 dentro del slide actual (para barra superior). */
  const [progress, setProgress] = useState(0);

  /** Reset índice si la lista cambia bajo nuestros pies. */
  useEffect(() => { setIdx(0); }, [effective?.slides.length]);

  /**
   * Rotación + AUTO-SCROLL dinámico por fases.
   * --------------------------------------------------------------------
   * Cada slide pasa por fases TOP → SCROLL → BOTTOM y SOLO entonces rota.
   * El overflow se re-mide en CADA tick, así si los datos llegan tarde
   * (queries async, imágenes), el autoscroll sigue funcionando — incluso
   * si al inicio el contenido aún cabía en pantalla. La duración mínima
   * del slide es la configurada por el usuario (`sec`); puede extenderse
   * si el autoscroll requiere más tiempo para completarse.
   */
  useEffect(() => {
    if (!effective || effective.slides.length === 0) return;
    const slide = effective.slides[idx % effective.slides.length];
    const sec = (slide.seconds ?? effective.defaultSeconds) || 30;
    const baseMs = sec * 1000;

    const SCROLL_SPEED_PX_PER_SEC = 40; // velocidad cómoda en TV
    const HOLD_TOP_MS = 1500;
    const HOLD_BOTTOM_MS = 1800;
    /** Margen mínimo antes de medir overflow por primera vez (montaje + 1ra carga). */
    const INITIAL_SETTLE_MS = 700;

    setProgress(0);
    window.scrollTo(0, 0);

    let rafId = 0;
    const slideStart = Date.now();
    let phase: 'top' | 'scroll' | 'bottom' | 'done' = 'top';
    let phaseStart = slideStart;
    let advanced = false;

    const advance = () => {
      if (advanced) return;
      advanced = true;
      setIdx((i) => (i + 1) % effective.slides.length);
    };

    const tick = () => {
      const now = Date.now();
      const slideElapsed = now - slideStart;
      const phaseElapsed = now - phaseStart;
      const overflow = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );

      if (phase === 'top') {
        window.scrollTo(0, 0);
        // Espera mínima a que el contenido se asiente antes de decidir si hay overflow.
        const minTop = Math.max(HOLD_TOP_MS, INITIAL_SETTLE_MS);
        if (phaseElapsed >= minTop) {
          if (overflow > 0) { phase = 'scroll'; phaseStart = now; }
          else { phase = 'done'; phaseStart = now; }
        }
      } else if (phase === 'scroll') {
        const dur = (overflow / SCROLL_SPEED_PX_PER_SEC) * 1000;
        const p = dur > 0 ? Math.min(1, phaseElapsed / dur) : 1;
        window.scrollTo(0, p * overflow);
        if (p >= 1) { phase = 'bottom'; phaseStart = now; }
      } else if (phase === 'bottom') {
        window.scrollTo(0, overflow);
        if (phaseElapsed >= HOLD_BOTTOM_MS) { phase = 'done'; phaseStart = now; }
      }

      // Estimación visual de progreso: 50 % cuando termina TOP, 100 % al avanzar.
      const visualTotal = Math.max(baseMs, phase === 'done' ? slideElapsed : slideElapsed + 1);
      setProgress(Math.min(1, slideElapsed / visualTotal));

      // Avanza solo cuando: fase = done Y se cumplió la duración mínima configurada.
      if (phase === 'done' && slideElapsed >= baseMs) {
        advance();
        return;
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [idx, effective]);

  // ----- Render -----
  if (!effective) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (effective.slides.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-3 p-6">
        <p className="text-lg font-semibold">No hay resultados disponibles para rotar.</p>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Cuando existan datos en alguno de los reportes (driver, approach, putt, etc.)
          o en los brackets, aparecerán aquí automáticamente.
        </p>
      </div>
    );
  }

  const slide = effective.slides[idx % effective.slides.length];
  const sec = slide.seconds ?? effective.defaultSeconds;
  const tournament = tInfo?.tournament;

  return (
    <div className="showcase-tv min-h-screen bg-background text-foreground">
      {/* Barra de progreso superior */}
      <div className="sticky top-0 z-20 h-1 bg-muted/50">
        <div
          className="h-full bg-primary transition-[width] duration-200 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Header */}
      <header className="max-w-6xl mx-auto px-4 pt-4 text-center">
        {tournament?.name && (
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-wide bg-primary text-primary-foreground py-2 rounded">
            {tournament.name}
          </h2>
        )}
        {tournament?.logo && (
          <img
            src={tournament.logo}
            alt={tournament?.name || 'Club'}
            className="mx-auto my-3 h-14 object-contain"
          />
        )}
        {tournament?.club && (
          <h3 className="text-sm md:text-base font-semibold bg-primary text-primary-foreground py-1 rounded">
            {tournament.club}
          </h3>
        )}
      </header>

      {/* Contador i/N */}
      <div className="max-w-6xl mx-auto px-4 pt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>Slide {(idx % effective.slides.length) + 1} de {effective.slides.length}</span>
        <span>{sec}s por slide</span>
      </div>

      {/* Slide actual */}
      <main className="py-6 px-4 md:px-8 animate-fade-in" key={`${idx}-${slide.id}`}>
        {renderSlide(slide.id)}
      </main>
    </div>
  );
};

export default ShowcaseRotator;