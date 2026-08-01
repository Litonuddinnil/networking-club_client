import React from "react";

interface State {
  hasError: boolean;
  error: Error | null;
  info: string;
}

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ThreeJSErrorBoundary — catches render-time errors thrown by Three.js
 * components (often WebGL "Illegal invocation" on StrictMode double-mount)
 * and falls back to a static placeholder instead of crashing the whole
 * page. Logs full details to the console.
 */
export default class ThreeJSErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null, info: "" };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[ThreeJSErrorBoundary]", error, info);
    this.setState({ info: info.componentStack || "" });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse at top, rgba(124,58,237,0.12), transparent 60%), radial-gradient(ellipse at bottom, rgba(6,182,212,0.08), transparent 60%)",
            }}
          />
        )
      );
    }
    return this.props.children;
  }
}
