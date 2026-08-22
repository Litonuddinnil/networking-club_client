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

  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>(
      ".overflow-y-auto, .overflow-x-auto, [data-lenis-wrapper]"
    )
  );

  // Prefer the element with the largest visible scrollHeight that is
  // currently in viewport. Stable across re-renders.
  const visible = candidates
    .filter((el) => {
      const rect = el.getBoundingClientRect();
      return (
        rect.height > 100 &&
        rect.width > 100 &&
        el.scrollHeight > el.clientHeight + 4
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
        // Don't hijack wheel inside form fields so typing stays smooth
        prevent: (node: Element | null) =>
          !node?.closest?.(
            "[data-lenis-ignore], input, textarea, select, [contenteditable]"
          ),
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
