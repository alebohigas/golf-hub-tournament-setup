/**
 * useRowSnap
 * -----------------------------------------------------------------------------
 * Snaps the WINDOW scroll position to whole rows of a target element after the
 * user stops scrolling. Designed for tables with sticky headers: when the user
 * leaves a row partially hidden behind the sticky header, this hook nudges the
 * page so the row is fully visible (or fully scrolled past, depending on which
 * half of the row is currently above the header).
 *
 * Behavior:
 *   - More than 50% of the row is hidden under the header  -> snap DOWN
 *     (scroll past the row so the next row is the first visible).
 *   - Less than 50% hidden                                  -> snap UP
 *     (reveal the row entirely just below the header).
 *
 * The snap fires after the user stops scrolling for `idleMs` ms, so it does
 * not fight the user's active gesture (works on desktop wheel and mobile
 * inertia scroll).
 *
 * @param ref           Ref to the element whose direct children are the rows
 *                      to snap to (typically a <tbody>).
 * @param stickyOffset  Function returning current sticky-header offset (px)
 *                      from the top of the viewport. Returning the live value
 *                      lets the hook adapt to responsive header heights.
 * @param enabled       When false, the hook is a no-op (lets us disable
 *                      snapping while loading or on small datasets).
 * @param idleMs        Idle time before the snap fires. Default 140ms.
 */
import { useEffect, useRef } from 'react';

export function useRowSnap(
  ref: React.RefObject<HTMLElement>,
  stickyOffset: () => number,
  enabled: boolean = true,
  idleMs: number = 140,
) {
  // Tracks the in-flight idle timeout so we can reset it on every scroll tick.
  const timeoutRef = useRef<number | null>(null);
  // True while we are programmatically scrolling — prevents feedback loops
  // where our own scrollTo() retriggers the snap logic.
  const programmaticRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled) return;
    const container = ref.current;
    if (!container) return;

    /** Compute target scrollY and trigger a smooth snap if needed. */
    const performSnap = () => {
      const offset = stickyOffset();
      const rows = Array.from(container.children) as HTMLElement[];
      if (rows.length === 0) return;

      // The "anchor line" is the first pixel of viewport content that is NOT
      // hidden under the sticky header. A row is "fully visible" when its
      // top is at or below this line.
      const anchorY = offset;

      // Find the row that straddles the anchor line.
      for (const row of rows) {
        const rect = row.getBoundingClientRect();
        // Skip rows entirely above or below the anchor.
        if (rect.bottom <= anchorY) continue;        // fully above
        if (rect.top >= anchorY) return;             // fully below — nothing to snap

        // This row straddles the anchor line. Compute how much is hidden.
        const hidden = anchorY - rect.top;            // px of the row above anchor
        const visible = rect.bottom - anchorY;        // px of the row below anchor
        const rowHeight = rect.height;
        if (rowHeight <= 0) return;

        // Decide direction: <50% hidden -> snap up (reveal row);
        //                   >=50% hidden -> snap down (skip past row).
        const targetScrollY =
          hidden < rowHeight / 2
            ? window.scrollY - visible + (rowHeight - visible) // align row.top with anchor
            : window.scrollY + visible;                        // push row.bottom to anchor

        // Only snap if the delta is meaningful (>1px) to avoid jitter.
        if (Math.abs(targetScrollY - window.scrollY) < 1) return;

        programmaticRef.current = true;
        window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
        // Release the programmatic flag after the smooth scroll likely ended.
        window.setTimeout(() => { programmaticRef.current = false; }, 400);
        return;
      }
    };

    /** Reset the idle timer on every scroll event. */
    const onScroll = () => {
      if (programmaticRef.current) return;
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        performSnap();
      }, idleMs);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, [ref, stickyOffset, enabled, idleMs]);
}