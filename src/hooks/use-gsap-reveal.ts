 

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type RevealKind = "up" | "slide-left" | "slide-right" | "scale" | "parallax";

function buildFromVars(kind: RevealKind): gsap.TweenVars {
  switch (kind) {
    case "slide-left":
      return { opacity: 0, x: -32, y: 0, scale: 1 };
    case "slide-right":
      return { opacity: 0, x: 32, y: 0, scale: 1 };
    case "scale":
      return { opacity: 0, x: 0, y: 0, scale: 0.92 };
    case "parallax":
      return { opacity: 1, x: 0, y: 40, scale: 1 };
    case "up":
    default:
      return { opacity: 0, x: 0, y: 16, scale: 1 };
  }
}

function buildToVars(kind: RevealKind): gsap.TweenVars {
  return {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    duration: 0.7,
    ease: "power3.out",
    stagger: kind === "up" ? 0.06 : 0,
    overwrite: "auto",
  };
}

export function useGsapReveal<T extends HTMLElement = HTMLDivElement>(
  scope?: React.RefObject<T | null>,
  deps: unknown[] = []
) {
  const localRef = useRef<T | null>(null);
  const ref = (scope ?? localRef) as React.RefObject<T | null>;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      gsap.set(root.querySelectorAll("[data-reveal]"), {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
      });
      return;
    }

    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      targets.forEach((el) => {
        const kind = ((el.dataset.reveal as RevealKind) || "up") as RevealKind;

        // Stagger siblings inside a parent with data-reveal-stagger
        const parent = el.parentElement;
        const parentStagger = parent?.dataset.revealStagger;

        gsap.set(el, buildFromVars(kind));

        // Parallax runs forever, not on scroll-in
        if (kind === "parallax") {
          gsap.to(el, {
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
          return;
        }

        gsap.to(el, {
          ...buildToVars(kind),
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none reverse",
            ...(parentStagger
              ? { start: "top 90%" }
              : {}),
          },
          ...(parentStagger
            ? {
                delay: Number(parentStagger) || 0,
              }
            : {}),
        });
      });
    }, root);

    return () => {
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
