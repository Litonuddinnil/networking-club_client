 
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