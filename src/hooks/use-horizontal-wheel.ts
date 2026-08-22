/**
 * useHorizontalWheel — translate vertical wheel deltas into horizontal
 * scroll on any `overflow-x-auto` element under the pointer.
 *
 * Lenis already handles vertical smooth scroll via the resolved
 * wrapper. Galleries, leaderboards, tabs and table rows in this app
 * use Tailwind's `overflow-x-auto`, which means a normal vertical
 * scroll gesture does nothing while the cursor is over a horizontal
 * scroller. This hook fixes that by intercepting `wheel` events on
 * overflowing-x containers and converting deltaY → scrollLeft.
 *
 * It also calls `event.stopPropagation()` so Lenis doesn't double-
 * animate the page while the user is scrolling a card row.
 *
 * The effect is no-op for non-`overflow-x-auto` elements so it never
 * touches the vertical scroll path.
 */
import { useEffect } from "react";

const SCROLL_CLASSES = ["overflow-x-auto", "[data-lenis-x]"];
const SCROLL_SELECTOR = SCROLL_CLASSES.join(",");

function isScrollableX(el: HTMLElement): boolean {
  return (
    (el.scrollWidth - el.clientWidth > 4) &&
    el.matches(SCROLL_SELECTOR) &&
    getComputedStyle(el).overflowX !== "visible" &&
    getComputedStyle(el).overflowX !== "hidden"
  );
}

function findHorizontalTarget(node: Element | null): HTMLElement | null {
  let cur: Element | null = node;
  while (cur && cur !== document.body) {
    if (cur instanceof HTMLElement && isScrollableX(cur)) return cur;
    cur = cur.parentElement;
  }
  return null;
}

export function useHorizontalWheel(): void {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const handler = (event: WheelEvent) => {
      // Only convert when the dominant axis is vertical (typical mouse)
      // OR when the target is itself a horizontal scroller.
      const target = event.target as Element | null;
      const hTarget = findHorizontalTarget(target);
      if (!hTarget) return;

      // Allow trackpad native horizontal swipes through untouched.
      // Only convert pure vertical-wheel gestures (|deltaY| > |deltaX|*2).
      const domX = Math.abs(event.deltaX);
      const domY = Math.abs(event.deltaY);
      if (domX > domY) return;
      if (domY < 1) return;

      // Convert to scrollLeft: scale deltaY to feel natural with trackpads.
      const step = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? event.deltaY * 16
        : event.deltaY;
      const before = hTarget.scrollLeft;
      hTarget.scrollLeft += step * (reduced ? 1 : 0.9);

      // If the container can scroll in this direction, mark the event
      // consumed so Lenis (which has window-level wheel capture) doesn't
      // also animate the page background.
      if (hTarget.scrollLeft !== before) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    // Capture phase so we run before any other listener, including Lenis.
    window.addEventListener("wheel", handler, { passive: false, capture: true });
    return () => {
      window.removeEventListener("wheel", handler, { capture: true } as any);
    };
  }, []);
}