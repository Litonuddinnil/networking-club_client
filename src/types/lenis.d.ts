declare module "lenis" {
  type LenisEasingFn = (t: number) => number;

  interface LenisOptions {
    duration?: number;
    easing?: LenisEasingFn;
    smoothWheel?: boolean;
    smoothTouch?: boolean;
    touchMultiplier?: number;
    wheelMultiplier?: number;
    lerp?: number;
    infinite?: boolean;
    orientation?: "vertical" | "horizontal";
    gestureOrientation?: "vertical" | "horizontal" | "both";
    overscroll?: boolean;
    autoRaf?: boolean;
    wrapper?: HTMLElement | Window;
    content?: HTMLElement;
    prevent?: (node: HTMLElement) => boolean;
  }

  interface LenisScrollEvent {
    target: HTMLElement;
    scroll: number;
    limit: number;
    progress: number;
    velocity: number;
    direction: 1 | -1;
  }

  interface LenisRafEvent {
    timestamp: number;
    scroll: number;
    limit: number;
    progress: number;
    velocity: number;
  }

  interface Lenis {
    raf(time: number): void;
    scrollTo(
      target: number | string | HTMLElement,
      options?: {
        offset?: number;
        duration?: number;
        easing?: LenisEasingFn;
        immediate?: boolean;
        lock?: boolean;
        force?: boolean;
        onComplete?: () => void;
      }
    ): void;
    start(): void;
    stop(): void;
    destroy(): void;
    on(event: "scroll", handler: (e: LenisScrollEvent) => void): () => void;
    on(event: string, handler: (e: unknown) => void): () => void;
    off(event: string, handler: (e: unknown) => void): void;
    emit(event: string, ...args: unknown[]): void;
    options: LenisOptions;
    actualScroll: number;
    limit: number;
    progress: number;
    velocity: number;
    direction: 1 | -1;
    targetScroll: number;
    animatedScroll: number;
  }

  export class Lenis implements Lenis {
    constructor(options?: LenisOptions);
  }

  export default Lenis;
}