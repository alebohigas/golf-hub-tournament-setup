/**
 * useRowSnap
 * -----------------------------------------------------------------------------
 * Bidirectional snap helper for large matrix tables.
 *
 * It coordinates TWO independent scroll contexts:
 *   1) Vertical scroll on the WINDOW
 *      - Snaps the first visible table row so it lands cleanly under the
 *        sticky calendar header stack.
 *   2) Horizontal scroll on an inner container
 *      - Snaps the table to full date columns so no column is left half cut.
 *
 * Vertical and horizontal snapping are intentionally decoupled because the
 * Calendario page uses page scroll for Y and an isolated table wrapper for X.
 */
import { useEffect, useRef } from 'react';

/** Optional configuration for horizontal snapping inside a scroll container. */
interface HorizontalSnapOptions {
  /** Ref to the element that owns horizontal scrolling (overflow-x-auto). */
  scrollRef?: React.RefObject<HTMLElement>;
  /** CSS selector used to discover column anchors inside `scrollRef`. */
  selector?: string;
  /** Width of the pinned left column that must remain visible while snapping. */
  offset?: () => number;
}

export function useRowSnap(
  ref: React.RefObject<HTMLElement>,
  stickyOffset: () => number,
  enabled: boolean = true,
  idleMs: number = 140,
  horizontal?: HorizontalSnapOptions,
) {
  /** Idle timer for WINDOW vertical scroll snapping. */
  const verticalTimeoutRef = useRef<number | null>(null);
  /** Idle timer for inner horizontal scroll snapping. */
  const horizontalTimeoutRef = useRef<number | null>(null);
  /** Guards against feedback loops caused by our own window.scrollTo(). */
  const programmaticVerticalRef = useRef<boolean>(false);
  /** Guards against feedback loops caused by our own scrollRef.scrollTo(). */
  const programmaticHorizontalRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled) return;
    const container = ref.current;
    if (!container) return;

    /**
     * Return the rows eligible for vertical snap.
     * When explicit `data-snap-row="true"` markers exist we use only those;
     * otherwise we fall back to the container's direct children.
     */
    const getRows = () => {
      const markedRows = Array.from(
        container.querySelectorAll<HTMLElement>('[data-snap-row="true"]'),
      );
      return markedRows.length > 0
        ? markedRows
        : (Array.from(container.children) as HTMLElement[]);
    };

    /** Compute target window scrollY and trigger a smooth vertical snap. */
    const performVerticalSnap = () => {
      const offset = stickyOffset();
      const rows = getRows();
      if (rows.length === 0) return;

      const anchorY = offset;

      for (const row of rows) {
        const rect = row.getBoundingClientRect();
        if (rect.bottom <= anchorY) continue;
        if (rect.top >= anchorY) return;

        const hidden = anchorY - rect.top;
        const visible = rect.bottom - anchorY;
        const rowHeight = rect.height;
        if (rowHeight <= 0) return;

        const targetScrollY =
          hidden < rowHeight / 2
            ? window.scrollY - hidden
            : window.scrollY + visible;

        if (Math.abs(targetScrollY - window.scrollY) < 1) return;

        programmaticVerticalRef.current = true;
        window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
        window.setTimeout(() => {
          programmaticVerticalRef.current = false;
        }, 400);
        return;
      }
    };

    /** Reset the vertical idle timer on every page scroll event. */
    const onWindowScroll = () => {
      if (programmaticVerticalRef.current) return;
      if (verticalTimeoutRef.current !== null) {
        window.clearTimeout(verticalTimeoutRef.current);
      }
      verticalTimeoutRef.current = window.setTimeout(() => {
        verticalTimeoutRef.current = null;
        performVerticalSnap();
      }, idleMs);
    };

    window.addEventListener('scroll', onWindowScroll, { passive: true });

    const scrollEl = horizontal?.scrollRef?.current;
    const selector = horizontal?.selector;

    /**
     * Compute the nearest full-column position and snap the horizontal scroll.
     * We derive candidate targets from the actual DOM offsets of date cells,
     * then subtract the pinned left-column width so the chosen column lands
     * exactly next to the sticky Categoría column.
     */
    const performHorizontalSnap = () => {
      if (!scrollEl || !selector) return;

      const anchors = Array.from(scrollEl.querySelectorAll<HTMLElement>(selector));
      if (anchors.length === 0) return;

      const pinnedOffset = horizontal?.offset?.() ?? 0;
      const maxScrollLeft = Math.max(0, scrollEl.scrollWidth - scrollEl.clientWidth);

      const targets = Array.from(
        new Set(
          anchors.map((anchor) => {
            const rawLeft = Math.round(anchor.offsetLeft - pinnedOffset);
            return Math.min(maxScrollLeft, Math.max(0, rawLeft));
          }),
        ),
      ).sort((a, b) => a - b);

      if (targets.length === 0) return;

      const current = scrollEl.scrollLeft;
      const nearest = targets.reduce((best, candidate) =>
        Math.abs(candidate - current) < Math.abs(best - current) ? candidate : best,
      );

      if (Math.abs(nearest - current) < 1) return;

      programmaticHorizontalRef.current = true;
      scrollEl.scrollTo({ left: nearest, behavior: 'smooth' });
      window.setTimeout(() => {
        programmaticHorizontalRef.current = false;
      }, 300);
    };

    /** Reset the horizontal idle timer on every inner X scroll event. */
    const onHorizontalScroll = () => {
      if (programmaticHorizontalRef.current) return;
      if (horizontalTimeoutRef.current !== null) {
        window.clearTimeout(horizontalTimeoutRef.current);
      }
      horizontalTimeoutRef.current = window.setTimeout(() => {
        horizontalTimeoutRef.current = null;
        performHorizontalSnap();
      }, idleMs);
    };

    if (scrollEl && selector) {
      scrollEl.addEventListener('scroll', onHorizontalScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', onWindowScroll);
      if (scrollEl && selector) {
        scrollEl.removeEventListener('scroll', onHorizontalScroll);
      }
      if (verticalTimeoutRef.current !== null) {
        window.clearTimeout(verticalTimeoutRef.current);
      }
      if (horizontalTimeoutRef.current !== null) {
        window.clearTimeout(horizontalTimeoutRef.current);
      }
    };
  }, [ref, stickyOffset, enabled, idleMs, horizontal]);
}