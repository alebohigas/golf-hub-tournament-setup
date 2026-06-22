/**
 * useAutoScrollLoop
 * ----------------------------------------------------------------------------
 * Autoscroll en loop infinito para páginas de showcase de UN SOLO reporte
 * (ej. /showcase/calificados/m, /showcase/driver, /showcase/putt…).
 *
 * Fases por iteración:
 *   TOP    → pausa `HOLD_TOP_MS` arriba para permitir lectura del encabezado
 *   SCROLL → desplazamiento lineal a `SCROLL_SPEED_PX_PER_SEC` hasta el fondo
 *   BOTTOM → pausa `HOLD_BOTTOM_MS` abajo
 *   …vuelve a TOP.
 *
 * Si el contenido cabe en viewport (sin overflow), se queda en top.
 * Re-mide `overflow` en cada tick para reaccionar a contenido que llega
 * de forma asíncrona (queries, imágenes).
 */
import { useEffect } from 'react';

export interface AutoScrollOptions {
  /** Velocidad de desplazamiento en píxeles por segundo. */
  speedPxPerSec?: number;
  /** Pausa en milisegundos al estar arriba. */
  holdTopMs?: number;
  /** Pausa en milisegundos al estar abajo. */
  holdBottomMs?: number;
  /** Si es false, el hook no hace nada (útil para deshabilitar bajo flags). */
  enabled?: boolean;
}

export const useAutoScrollLoop = (opts: AutoScrollOptions = {}) => {
  const {
    speedPxPerSec = 30,
    holdTopMs = 2500,
    holdBottomMs = 3000,
    enabled = true,
  } = opts;

  useEffect(() => {
    if (!enabled) return;
    let rafId = 0;
    let phase: 'top' | 'scroll' | 'bottom' = 'top';
    let phaseStart = Date.now();

    const tick = () => {
      const overflow = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const now = Date.now();
      const elapsed = now - phaseStart;

      if (overflow <= 0) {
        window.scrollTo(0, 0);
        phase = 'top';
        phaseStart = now;
      } else if (phase === 'top') {
        window.scrollTo(0, 0);
        if (elapsed >= holdTopMs) { phase = 'scroll'; phaseStart = now; }
      } else if (phase === 'scroll') {
        const dur = (overflow / speedPxPerSec) * 1000;
        const p = Math.min(1, elapsed / dur);
        window.scrollTo(0, p * overflow);
        if (p >= 1) { phase = 'bottom'; phaseStart = now; }
      } else {
        window.scrollTo(0, overflow);
        if (elapsed >= holdBottomMs) { phase = 'top'; phaseStart = now; }
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
    return () => { if (rafId) window.cancelAnimationFrame(rafId); };
  }, [enabled, speedPxPerSec, holdTopMs, holdBottomMs]);
};

export default useAutoScrollLoop;