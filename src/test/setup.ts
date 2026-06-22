import "@testing-library/jest-dom/vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

globalThis.ResizeObserver = class {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

Element.prototype.hasPointerCapture = vi.fn();
Element.prototype.setPointerCapture = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@tauri-apps/plugin-store", () => {
  const storeData = new Map<string, any>();
  return {
    LazyStore: class {
      constructor(_name: string, options?: { defaults?: Record<string, any> }) {
        if (options?.defaults) {
          Object.entries(options.defaults).forEach(([key, value]) => {
            if (!storeData.has(key)) storeData.set(key, value);
          });
        }
      }
      async get<T>(key: string): Promise<T | undefined> {
        return storeData.get(key) as T | undefined;
      }
      async set(key: string, value: any): Promise<void> {
        storeData.set(key, value);
      }
      async save(): Promise<void> {}
    },
  };
});

vi.mock("@tauri-apps/plugin-os", () => ({
  platform: vi.fn().mockReturnValue("macos"),
}));

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: vi.fn().mockReturnValue({
    close: vi.fn(),
    minimize: vi.fn(),
    toggleMaximize: vi.fn(),
  }),
}));

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const createTag = (tag: string) =>
    React.forwardRef<any, any>(
      (
        { children, whileTap, whileHover, whileInView, layout, ...props }: any,
        ref: any,
      ) => React.createElement(tag, { ...props, ref }, children),
    );
  return {
    motion: new Proxy(
      {},
      {
        get: (_target: any, tag: string) => {
          if (tag === "toString") return () => "motion";
          return createTag(tag);
        },
      },
    ),
    AnimatePresence: ({ children }: any) => children,
  };
});
