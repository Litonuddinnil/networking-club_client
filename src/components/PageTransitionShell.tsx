 
import { useLenis } from "@/hooks/use-lenis";
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
  useBarbaTransitions();
  return <div data-barba="wrapper">{children}</div>;
}