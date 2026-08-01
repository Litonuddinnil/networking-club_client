/**
 * PageTransitionShell — root-level orchestrator for Lenis + Barba.
 *
 * - Mounts once at the top of the React tree (inside <App />).
 * - Initializes the Lenis singleton via useLenis().
 * - Initializes Barba transitions via useBarbaTransitions().
 * - Provides a div[data-barba="page"] scope that Barba hooks read on enter/leave.
 *
 * NOTE: React Router still owns the route lifecycle — we only wrap the
 * rendered router in this shell, and the shell renders its children as-is.
 * Barba's hooks read DOM nodes but never replace them.
 */
import { useLenis } from "@/hooks/use-lenis";
import { useBarbaTransitions } from "@/hooks/use-barba-transitions";
import type { ReactNode } from "react";

export default function PageTransitionShell({ children }: { children: ReactNode }) {
  useLenis();
  useBarbaTransitions();
  return <div data-barba="wrapper">{children}</div>;
}