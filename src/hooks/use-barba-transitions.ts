/**
 * useBarbaTransitions — Barba.js-driven page transitions.
 *
 * In a React SPA, Barba.js is used as the *animation orchestrator* rather
 * than the navigation engine (React Router keeps ownership of state).
 * We initialise Barba with a `data-barba="page"` marker, listen to
 * React Router's location changes, and trigger a GSAP timeline that:
 *   1. Fades the outgoing page out + slides a curtain overlay up
 *   2. Re-keys React's router outlet so children re-mount fresh
 *   3. Fades the incoming page in + slides the curtain away
 *
 * Networking / tech vibe: animated horizontal scan-line, terminal-style
 * status text flashing through the transition.
 */

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import barba from "@barba/core";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const EASE = "power3.inOut";

/**
 * injectCurtain — once-only DOM injection of the Barba overlay.
 */
function injectCurtain() {
  if (document.querySelector("[data-barba-curtain]")) return;
  const el = document.createElement("div");
  el.setAttribute("data-barba-curtain", "");
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = `
    <div data-barba-curtain-bg></div>
    <div data-barba-curtain-grid></div>
    <div data-barba-curtain-text>
      <span data-barba-curtain-route></span>
      <span data-barba-curtain-status>connecting…</span>
    </div>
  `;
  document.body.appendChild(el);
}

/**
 * Inject CSS once. Tailwind can't reach data-barba-* from className, so we
 * append a small style block with the curtain + slide animations.
 */
function injectStyles() {
  if (document.getElementById("barba-styles")) return;
  const style = document.createElement("style");
  style.id = "barba-styles";
  style.textContent = `
    [data-barba-curtain] {
      position: fixed; inset: 0; z-index: 9999; pointer-events: none;
      display: grid; place-items: center;
      transform: translateY(100%);
    }
    [data-barba-curtain-bg] {
      position: absolute; inset: 0;
      background: linear-gradient(180deg, rgba(8,16,12,0.96), rgba(6,30,18,0.96));
      backdrop-filter: blur(8px);
    }
    [data-barba-curtain-grid] {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(34,197,94,0.18) 1px, transparent 1px),
        linear-gradient(90deg, rgba(34,197,94,0.18) 1px, transparent 1px);
      background-size: 36px 36px;
      mask-image: radial-gradient(circle at center, black 30%, transparent 75%);
      opacity: 0.5;
    }
    [data-barba-curtain-text] {
      position: relative;
      display: flex; flex-direction: column; gap: 6px; align-items: center;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      color: rgb(134 239 172);
      text-transform: uppercase;
      letter-spacing: 0.3em;
      font-size: 11px;
    }
    [data-barba-curtain-route] {
      font-size: 22px; letter-spacing: 0.4em;
      color: rgb(187 247 208);
      text-shadow: 0 0 18px rgba(34, 197, 94, 0.7);
    }
    [data-barba-curtain-status]::before {
      content: "> "; color: rgb(74 222 128);
    }
    [data-barba="page"] {
      will-change: opacity, transform;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Build the transition timeline. We keep it tight (≤ 600ms) so users
 * never feel like navigation is sluggish.
 */
function runTransition(timeline: gsap.core.Timeline, onMidpoint: () => void) {
  const curtain = document.querySelector<HTMLElement>("[data-barba-curtain]");
  const routeEl = document.querySelector<HTMLElement>("[data-barba-curtain-route]");
  const statusEl = document.querySelector<HTMLElement>("[data-barba-curtain-status]");
  const page = document.querySelector<HTMLElement>("[data-barba=page]");
  if (!curtain || !page) return;

  if (routeEl && statusEl) {
    routeEl.textContent = location.pathname === "/" ? "home" : location.pathname.replace(/^\//, "") || "page";
    statusEl.textContent = "routing packet";
  }

  timeline
    .set(curtain, { pointerEvents: "auto" })
    .to(curtain, { yPercent: 0, duration: 0.32, ease: EASE })
    .add(() => {
      if (statusEl) statusEl.textContent = "swap view";
      onMidpoint();
    })
    .add(() => {
      if (statusEl) statusEl.textContent = "ack · 200 OK";
    }, ">-0.05")
    .to(page, { opacity: 1, y: 0, duration: 0.0001 }, "<")
    .to(curtain, { yPercent: -100, duration: 0.32, ease: EASE }, ">-0.05")
    .set(curtain, { pointerEvents: "none" });
}

export function useBarbaTransitions() {
  const location = useLocation();
  const pathnameRef = useRef<string>(location.pathname);

  useEffect(() => {
    injectStyles();
    injectCurtain();

    // Initialise Barba once. Barba intercepts `<a>` clicks and dispatches
    // before/after hooks; we keep React Router as the source of truth and
    // use Barba purely for the animation orchestration.
    barba.init({
      // We don't fetch new HTML — React Router handles the route.
      // We just want Barba's event stream.
      prevent: ({ el }) => {
        // Skip external / mail / hash / same-page links
        const href = el.getAttribute("href") ?? "";
        if (!href || href.startsWith("#")) return true;
        if (href.startsWith("http") || href.startsWith("mailto:")) return true;
        return false;
      },
      transitions: [
        {
          name: "scan-line",
          once({ next }) {
            // First load — don't run a transition, just reveal the page
            const page = next?.el?.querySelector<HTMLElement>("[data-barba=page]");
            if (page) {
              gsap.set(page, { opacity: 1, y: 0 });
            }
            ScrollTrigger.refresh();
          },
          async leave({ current }) {
            const done = current?.async?.();
            const tl = gsap.timeline({ onComplete: done });
            const page = current?.el?.querySelector<HTMLElement>("[data-barba=page]");
            if (page) {
              tl.to(page, { opacity: 0, y: -12, duration: 0.2, ease: "power2.in" });
            }
            await new Promise<void>((r) => tl.eventCallback("onComplete", r));
          },
          async enter({ next }) {
            const done = next?.async?.();
            const tl = gsap.timeline({ onComplete: done });
            const page = next?.el?.querySelector<HTMLElement>("[data-barba=page]");
            if (page) {
              tl.fromTo(
                page,
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }
              );
            }
            ScrollTrigger.refresh();
            await new Promise<void>((r) => tl.eventCallback("onComplete", r));
          },
        },
      ],
    });

    return () => {
      barba.destroy();
    };
  }, []);

  // React Router's location change drives the Barba transition manually
  // because we set `prevent: () => true` for non-hash links. This way we
  // get the smooth animation while React owns the route lifecycle.
  useEffect(() => {
    if (pathnameRef.current === location.pathname) return;
    const previous = pathnameRef.current;
    pathnameRef.current = location.pathname;

    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      // Skip animation entirely
      ScrollTrigger.refresh();
      return;
    }

    const tl = gsap.timeline();
    let rerender = false;
    runTransition(tl, () => {
      rerender = true;
      // Force a re-key of the route so React re-mounts page content
      window.dispatchEvent(new CustomEvent("barba:rerender"));
    });

    ScrollTrigger.refresh();

    void previous;
    void rerender;
  }, [location.pathname]);
}
