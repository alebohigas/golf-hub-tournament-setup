/**
 * ShowcaseStickyTitle
 * ----------------------------------------------------------------------------
 * Registra el título contextual del slide activo (categoría / grupo / cupos)
 * dentro del stack sticky superior del rotador. Así el ribbon de patrocinadores,
 * el título de categoría y el header de tabla se comportan como un solo bloque
 * durante el autoscroll, sin que el título quede enterrado debajo del ribbon.
 *
 * Si el componente se usa fuera del rotador, cae al comportamiento anterior:
 * renderiza el título inline con `.showcase-prize-sticky` y publica su altura
 * para apilar el header de tabla debajo.
 */
import { type ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useShowcaseCategoryStickyHeight } from '@/hooks/useShowcaseCategoryStickyHeight';
import { useShowcaseStickyContext } from '@/components/showcase/ShowcaseStickyContext';

/** Props del título sticky compartido del showcase. */
interface ShowcaseStickyTitleProps {
  /** Contenido visual del título contextual del slide. */
  children: ReactNode;
  /** Clases específicas del bloque visual (fondo, padding, layout). */
  className?: string;
  /** Llave estable que fuerza re-registro cuando cambia el slide/datos. */
  contentKey: string;
}

/** Registra/renderiza el título contextual sticky del showcase. */
const ShowcaseStickyTitle = ({ children, className, contentKey }: ShowcaseStickyTitleProps) => {
  const fallbackRef = useShowcaseCategoryStickyHeight<HTMLDivElement>();
  const { enabled, setStickyContent } = useShowcaseStickyContext();

  useEffect(() => {
    if (!enabled) return;

    setStickyContent(
      <div className={cn('showcase-sticky-title', className)}>
        {children}
      </div>,
    );

    return () => setStickyContent(null);
  }, [className, contentKey, enabled, setStickyContent]);

  if (enabled) return null;

  return (
    <div ref={fallbackRef} className={cn('showcase-prize-sticky', className)}>
      {children}
    </div>
  );
};

export default ShowcaseStickyTitle;