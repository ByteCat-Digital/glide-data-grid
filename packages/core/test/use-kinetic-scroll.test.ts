import { act, renderHook } from "@testing-library/react";
import useKineticScroll from "../src/internal/scrolling-data-grid/use-kinetic-scroll.js";
import { vi, expect, describe, it, afterEach, beforeEach } from "vitest";

describe("useKineticScroll", () => {
    let targetScroller: { current: HTMLDivElement };
    let callback: () => void;

    beforeEach(() => {
        targetScroller = { current: document.createElement("div") };
        callback = vi.fn();

        vi.spyOn(targetScroller.current, "addEventListener");
        vi.spyOn(targetScroller.current, "removeEventListener");
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("registers and unregisters event listeners based on isEnabled", () => {
        const { rerender } = renderHook(({ isEnabled }) => useKineticScroll(isEnabled, callback, targetScroller), {
            initialProps: { isEnabled: false },
        });

        expect(targetScroller.current.addEventListener).not.toHaveBeenCalled();
        expect(targetScroller.current.removeEventListener).not.toHaveBeenCalled();

        rerender({ isEnabled: true });

        expect(targetScroller.current.addEventListener).toHaveBeenCalledTimes(2);
        expect(targetScroller.current.removeEventListener).not.toHaveBeenCalled();

        rerender({ isEnabled: false });

        expect(targetScroller.current.removeEventListener).toHaveBeenCalledTimes(2);
    });

    it("handles scroll events and triggers callback", async () => {
        const { unmount } = renderHook(() => useKineticScroll(true, callback, targetScroller));

        await act(async () => {
            targetScroller.current.dispatchEvent(new Event("touchstart"));
            const touchEnd = new Event("touchend") as TouchEvent;
            Object.defineProperty(touchEnd, "touches", { value: [] });
            targetScroller.current.dispatchEvent(touchEnd);
            await new Promise(resolve => window.setTimeout(resolve, 20));
        });

        expect(callback).toHaveBeenCalled();
        unmount();
    });
});
