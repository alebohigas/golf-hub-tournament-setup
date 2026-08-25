/**
 * useStickyTableHead
 * ---------------------------------------------------------------
 * Keeps a table's <thead> visually pinned to the top of the frame
 * while the PAGE scrolls (not the frame). The stats tables in /stats
 * intentionally have no vertical scroll of their own — only
 * `overflow-x-auto` for wide matrices — which breaks native
 * `position: sticky` (the sticky reference becomes the horizontal
 * scroll container, which never scrolls vertically).
 *
 * Instead of re-introducing an inner vertical scrollbar, we translate
 * the <thead> downwards by exactly the number of pixels the wrapper has
 * scrolled past the top of the viewport, clamped so the header never
 * leaves its own table. Result: the header stays fixed inside the frame
 * until the general (page) scrolling moves past the report.
 *
 * Usage:
 *   const { wrapperRef, theadRef } = useStickyTableHead(offsetTop);
 *   <div ref={wrapperRef} className="overflow-x-auto"> <table>
 *     <thead ref={theadRef}> ... </thead>
 *
 * @param offsetTop Extra px offset from the viewport top (e.g. fixed nav height).
 * @param deps      Values that change the table size and require a recalc.
 */
import { useCallback, useEffect, useRef } from 'react';

export function useStickyTableHead<T = unknown>(offsetTop = 0, deps: T[] = []) {
  /** The horizontally-scrollable frame that wraps the table. */
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  /** The <thead> element that must stay visible. */
  const theadRef = useRef<HTMLTableSectionElement | null>(null);

  /** Recompute the thead translation for the current page scroll. */
  const update = useCallback(() => {
    const wrapper = wrapperRef.current;
    const thead = theadRef.current;
    if (!wrapper || !thead) return;

    const rect = wrapper.getBoundingClientRect();
    const headH = thead.getBoundingClientRect().height;
    // How far the frame's top edge is above the desired sticky line.
    const overshoot = offsetTop - rect.top;
    // Never scroll the header past the bottom of its own frame.
    const maxShift = Math.max(0, rect.height - headH);
    const shift = Math.min(Math.max(0, overshoot), maxShift);

    thead.style.transform = shift > 0 ? `translateY(${shift}px)` : '';
    // Raise above body rows only while floating, so shadows stay clean.
    thead.style.zIndex = '30';
    thead.style.position = 'relative';
    thead.style.willChange = 'transform';
    // Toggle a data attribute so components can apply a visual "stuck" state
    // (shadow / stronger border) through Tailwind data-* variants.
    thead.dataset.stuck = shift > 0 ? 'true' : 'false';
  }, [offsetTop]);

  useEffect(() => {
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update, ...deps]);

  return { wrapperRef, theadRef, recalcStickyHead: update };
}

export default useStickyTableHead;
