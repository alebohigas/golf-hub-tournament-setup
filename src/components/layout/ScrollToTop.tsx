/**
 * ScrollToTop
 * -----------------------------------------------------------------------------
 * Snap-to-top on every client-side navigation.
 *
 * React Router keeps the previous scroll offset when swapping routes, so a page
 * opened from a scrolled position would render mid-page. This component listens
 * to `pathname` / `search` changes and forces the window (and the documentElement
 * / body, needed by some mobile browsers) back to offset 0 instantly.
 *
 * Rendered once inside <BrowserRouter> in App.tsx. Renders no markup.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    /** Disable native scroll restoration so the browser doesn't fight us. */
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const toTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    };

    toTop();
    // Run again after paint: sticky headers / async content can shift layout
    // right after the route mounts and re-anchor the scroll position.
    const raf = window.requestAnimationFrame(toTop);
    return () => window.cancelAnimationFrame(raf);
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
