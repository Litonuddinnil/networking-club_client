import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenisSingleton: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenisSingleton;
}

/**
 * Find the actual scrolling element. DashboardLayout, MobileMenu drawer,
 * modals etc. all use nested `overflow-y-auto` containers, so window
 * isn't always the scroll target. We pick the deepest overflowing
 * container that's visible in the viewport's scroll region.
 *
 * When `routeKey` changes we re-run setup so we always grab the
 * wrapper that matches the current route (window on public pages,
 * nested scroll container inside dashboard layouts, etc.).
 */
function resolveScrollWrapper(): HTMLElement | Window {
  if (typeof window === "undefined") return window;

  // Only consider nested scrollers that are *strictly* overflow-y-auto
  // AND currently have actual vertical overflow that exceeds their
  // visible viewport by a meaningful amount. This prevents Lenis from
  // hijacking the window when the document itself is taller than the
  // viewport (the normal case for tab pages with cards/grids).
  const docScrollable =
    document.documentElement.scrollHeight > window.innerHeight + 4;

  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>(".overflow-y-auto")
  );

  const visible = candidates
    .filter((el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      // Only treat as a real wrapper if the element itself actually
      // overflows vertically *and* the document isn't also scrollable
      // (in which case window is the right target).
      return (
        !docScrollable ||
        (rect.height > 200 &&
          rect.width > 200 &&
          el.scrollHeight - el.clientHeight > 40 &&
          (style.overflowY === "auto" || style.overflowY === "scroll"))
      );
    })
    .sort((a, b) => b.scrollHeight - a.scrollHeight);

  return visible[0] ?? window;
}

export function useLenis(routeKey?: string): void {
  useEffect(() => {
    // Respect reduced-motion — fall back to native scroll
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      ScrollTrigger.normalizeScroll(true);
      return;
    }

    let rafId = 0;
    let mo: MutationObserver | null = null;
    let lenis: Lenis | null = null;
    let cancelled = false;

    const setup = () => {
      if (cancelled) return;

      const wrapper = resolveScrollWrapper();
      const isNested = wrapper !== window;

      lenis = new Lenis({
        wrapper: wrapper as HTMLElement,
        content: isNested ? (wrapper as HTMLElement) : undefined,
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.4,
        // Skip Lenis hijacking when the wheel happens over a horizontal
        // scroller, an ignored region, or a form field. The horizontal
        // wheel helper handles the first case natively.
        prevent: (node: Element | null) => {
          if (!node) return true;
          if (node.closest?.("[data-lenis-ignore]")) return false;
          if (
            node.closest?.(
              "input, textarea, select, [contenteditable]"
            )
          ) {
            return false;
          }
          // If the cursor sits inside a horizontal-scroll container,
          // let the browser (and our use-horizontal-wheel hook) handle
          // the gesture instead of Lenis animating the page vertically.
          let cur: Element | null = node;
          while (cur && cur !== document.body) {
            if (
              cur instanceof HTMLElement &&
              cur.scrollWidth - cur.clientWidth > 4 &&
              (getComputedStyle(cur).overflowX === "auto" ||
                getComputedStyle(cur).overflowX === "scroll")
            ) {
              return false;
            }
            cur = cur.parentElement;
          }
          return true;
        },
      });

      lenisSingleton = lenis;

      lenis.on("scroll", ScrollTrigger.update);

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);

      const onLoad = () => ScrollTrigger.refresh();
      const onResize = () => {
        lenis?.resize();
        ScrollTrigger.refresh();
      };
      window.addEventListener("load", onLoad);
      window.addEventListener("resize", onResize);

      // When DOM mutates (e.g. mobile drawer, modal, route swap adds a
      // new nested scroller) just resize — no need to destroy.
      mo = new MutationObserver(() => {
        lenis?.resize();
        ScrollTrigger.refresh();
      });
      mo.observe(document.body, { childList: true, subtree: true });
    };

    // Defer one frame so the route's <Outlet /> has flushed to DOM
    // and any new nested scroll containers exist before we measure.
    rafId = requestAnimationFrame(setup);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      mo?.disconnect();
      lenis?.destroy();
      lenisSingleton = null;
    };
  }, [routeKey]);
}
