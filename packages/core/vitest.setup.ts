import "vitest-canvas-mock";
import { vi } from "vitest";

// this is needed to make the canvas mock work for some reason
global.jest = vi;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

class MockResizeObserver {
    public constructor(private readonly callback: ResizeObserverCallback) {}

    public observe = vi.fn((target: Element) => {
        const contentRect = target.getBoundingClientRect();
        this.callback([{ target, contentRect } as ResizeObserverEntry], this as unknown as ResizeObserver);
    });

    public unobserve = vi.fn();
    public disconnect = vi.fn();
}

global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

Image.prototype.decode = () => new Promise(resolve => window.setTimeout(resolve, 10));
