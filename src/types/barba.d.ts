/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "@barba/core" {
  // Barba's `once`/`leave`/`enter` hooks pass an IBarbaContext with both
  // `current` and `next` shape. Both expose:
  //   - `el: HTMLElement | undefined` — the DOM container
  //   - `async(): () => void` — completion callback
  interface IBarbaContainer {
    el?: HTMLElement;
    namespace?: string;
    url?: { href: string; path: string };
    html?: string;
    async: () => () => void;
    render?: (html: string) => void;
  }

  interface BarbaContext {
    trigger?: HTMLElement | null;
    current?: IBarbaContainer;
    next?: IBarbaContainer;
  }

  interface BarbaDispatchContext {
    el: HTMLAnchorElement;
    event: MouseEvent;
    href?: string;
  }

  type TransitionFn = (ctx: BarbaContext) => void | Promise<void>;

  interface BarbaTransition {
    name: string;
    once?: (ctx: BarbaContext) => void | Promise<void>;
    leave?: TransitionFn;
    enter?: TransitionFn;
    beforeEnter?: (ctx: BarbaContext) => void | Promise<void>;
    afterEnter?: (ctx: BarbaContext) => void | Promise<void>;
    beforeLeave?: (ctx: BarbaContext) => void | Promise<void>;
    afterLeave?: (ctx: BarbaContext) => void | Promise<void>;
  }

  interface BarbaInitOptions {
    timeout?: number;
    prefetchIgnore?: (string | RegExp)[];
    cacheIgnore?: (string | RegExp)[];
    prevent?: (ctx: BarbaDispatchContext) => boolean;
    transitions?: BarbaTransition[];
    views?: unknown[];
    schema?: Record<string, unknown>;
    debug?: boolean;
    logLevel?: "info" | "warn" | "error" | "off";
  }

  interface BarbaApi {
    init(options: BarbaInitOptions): BarbaApi;
    destroy(): void;
    force(action: "go" | "back" | "forward", url?: string): Promise<void>;
    go(url: string, trigger?: HTMLElement, e?: MouseEvent): Promise<void>;
    back(): Promise<void>;
    forward(): Promise<void>;
    refresh(): Promise<void>;
    prefetch(url: string): Promise<void>;
    hooks: {
      enter: BarbaHookDispatcher;
      leave: BarbaHookDispatcher;
      beforeEnter: BarbaHookDispatcher;
      afterEnter: BarbaHookDispatcher;
      beforeLeave: BarbaHookDispatcher;
      afterLeave: BarbaHookDispatcher;
      once: BarbaHookDispatcher;
      before: BarbaHookDispatcher;
      after: BarbaHookDispatcher;
      current: BarbaHookDispatcher;
      next: BarbaHookDispatcher;
    };
  }

  interface BarbaHookDispatcher {
    (name: string, fn: (ctx: any) => void | Promise<void>): () => void;
  }

  const barba: BarbaApi;
  export default barba;
}
