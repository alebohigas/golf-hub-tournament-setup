/**
 * PageSubmenu
 * Sticky secondary navigation used on /convocatoria. Anchors to header height
 * via the `--header-height` CSS variable exposed by <Header>, so it no longer
 * gets clipped by the top ribbon. Supports mouse/touch drag scrolling and
 * shows fade masks only on the side(s) that currently overflow.
 */
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState, useCallback } from 'react';

interface Section {
  id: string;
  label: string;
}

interface PageSubmenuProps {
  sections: Section[];
  activeSection?: string;
}

const PageSubmenu = ({ sections, activeSection }: PageSubmenuProps) => {
  /** Scroll container ref used for drag-to-scroll + overflow detection. */
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  /** Track drag state so click handlers can ignore accidental drags. */
  const dragState = useRef({ isDown: false, moved: false, startX: 0, startScroll: 0 });

  /** Recompute edge-fade visibility from current scroll position. */
  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < maxScroll - 1);
  }, []);

  useEffect(() => {
    updateEdges();
    const el = scrollerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    window.addEventListener('resize', updateEdges);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateEdges);
    };
  }, [updateEdges, sections.length]);

  /** Smooth-scroll to an anchor, offsetting by the live header height. */
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    const headerVar = getComputedStyle(document.documentElement).getPropertyValue('--header-height');
    const headerH = parseInt(headerVar, 10) || 80;
    // Extra breathing room below the sticky submenu (~56px).
    const offset = headerH + 64;
    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  // ---------- Drag-to-scroll (pointer events cover mouse + touch) ----------
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    dragState.current = {
      isDown: true,
      moved: false,
      startX: e.clientX,
      startScroll: el.scrollLeft,
    };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el || !dragState.current.isDown) return;
    const dx = e.clientX - dragState.current.startX;
    if (Math.abs(dx) > 4) dragState.current.moved = true;
    el.scrollLeft = dragState.current.startScroll - dx;
  };
  const endDrag = () => {
    dragState.current.isDown = false;
  };

  return (
    <nav
      className="sticky z-40 bg-background/95 backdrop-blur-sm border-b border-border/50 shadow-sm"
      style={{ top: 'var(--header-height, 80px)' }}
    >
      <div className="container mx-auto px-4 relative">
        {/* Left edge fade — only when content is scrolled off the left. */}
        <div
          className={cn(
            'pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent transition-opacity',
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          )}
        />
        {/* Right edge fade — only when content is scrollable further right. */}
        <div
          className={cn(
            'pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent transition-opacity',
            canScrollRight ? 'opacity-100' : 'opacity-0'
          )}
        />
        <div
          ref={scrollerRef}
          onScroll={updateEdges}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onPointerCancel={endDrag}
          className={cn(
            'flex items-center justify-start md:justify-center gap-1 py-2 overflow-x-auto scrollbar-hide select-none',
            'touch-pan-x cursor-grab active:cursor-grabbing'
          )}
        >
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={(e) => {
                // Ignore click that ended a drag.
                if (dragState.current.moved) {
                  e.preventDefault();
                  return;
                }
                scrollToSection(section.id);
              }}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all',
                activeSection === section.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default PageSubmenu;
