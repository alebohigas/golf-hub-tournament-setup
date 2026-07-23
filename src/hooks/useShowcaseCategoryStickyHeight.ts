/**
 * useShowcaseCategoryStickyHeight
 * ----------------------------------------------------------------------------
 * Mide la altura real del bloque `.showcase-prize-sticky` (título de categoría
 * / "GRUPO: ...") del slide activo y la publica en la CSS var
 * `--showcase-cat-height` sobre <html>. La regla sticky del <thead> en
 * `.showcase-tv .tournament-table thead th` la usa para apilarse justo debajo
 * del título sin quedar tapado ni "flotar" sobre las filas.
 *
 * Retorna un ref para adjuntar al contenedor sticky del título de categoría.
 */
import { useEffect, useRef } from 'react';

export function useShowcaseCategoryStickyHeight<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      const h = el.offsetHeight || 0;
      document.documentElement.style.setProperty(
        '--showcase-cat-height',
        `${h}px`,
      );
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    window.addEventListener('resize', apply);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', apply);
      // Limpia al desmontar el slide para que el siguiente re-mida desde 0.
      document.documentElement.style.removeProperty('--showcase-cat-height');
    };
  }, []);

  return ref;
}