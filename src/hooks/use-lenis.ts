/**
 * useLenis — singleton smooth-scroll manager.
 *
 * Lenis (https://www.lenis.dev) drives window.scrollY with a damped lerp so
 * navigation across the page feels weighty. We:
 *   - Initialise Lenis once at the React root
 *   - Pump its rAF loop until unmount
 *   - Wire ScrollTrigger.refresh() so GSAP stays in sync with Lenis's
 *     virtual scroll position
 *   - Respect prefers-reduced-motion (instant scroll instead of smooth)
 *
 * Usage in App.tsx:
 *   useLenis();        // call once at the top of the tree
 */

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenisSingleton: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenisSingleton;
}

export function useLenis(): void {
  useEffect(() => {
    // Respect reduced-motion — fall back to native scroll
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // Tell GSAP + ScrollTrigger to use natural scroll
      ScrollTrigger.normalizeScroll(true);
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });

    lenisSingleton = lenis;

    // Sync Lenis -> ScrollTrigger on every frame
    lenis.on("scroll", ScrollTrigger.update);

    // Pump the rAF loop
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Recalculate ScrollTrigger after fonts/images settle
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("load", onLoad);
      lenis.destroy();
      lenisSingleton = null;
    };
  }, []);
}