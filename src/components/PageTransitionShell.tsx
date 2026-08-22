 
import { useLenis } from "@/hooks/use-lenis";
import { useHorizontalWheel } from "@/hooks/use-horizontal-wheel";
import { useBarbaTransitions } from "@/hooks/use-barba-transitions";
import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";

export default function PageTransitionShell({
  children,
}: {
  children: ReactNode;
}) {
  const { pathname } = useLocation();
  // Re-init Lenis on route change so it picks the right scroll wrapper
  // (window on public pages, nested container inside dashboard layout).
  useLenis(pathname);
  // Translate vertical-wheel gestures into horizontal scroll when the
  // cursor is over a row-style scroller (gallery, leaderboard, tabs...).
  useHorizontalWheel();
  useBarbaTransitions();
  return <div data-barba="wrapper">{children}</div>;
}