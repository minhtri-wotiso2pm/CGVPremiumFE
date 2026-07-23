import { useEffect, useState } from "react";

/* ══════════════════════════════════════════════════════════════
   Environment hooks — the physical constraints the mascot lives in.
══════════════════════════════════════════════════════════════ */

export const DESKTOP_MIN_WIDTH = 1024;

/** DesktopOnlyWrapper's brain: true only on ≥1024px pointer:fine screens.
 *  The mascot is a fine-pointer, hover-driven experience — it makes no
 *  sense on touch, so we gate on both width and a real mouse. */
export function useIsDesktop(): boolean {
    const query = `(min-width: ${DESKTOP_MIN_WIDTH}px) and (pointer: fine)`;
    const [isDesktop, setIsDesktop] = useState(
        () => typeof window !== "undefined" && window.matchMedia(query).matches,
    );

    useEffect(() => {
        const mql = window.matchMedia(query);
        const onChange = () => setIsDesktop(mql.matches);
        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
    }, [query]);

    return isDesktop;
}

/** True while the tab is visible. The engines freeze all timers and RAF
 *  loops when this flips false, so a backgrounded tab costs nothing. */
export function usePageVisible(): boolean {
    const [visible, setVisible] = useState(
        () => typeof document === "undefined" || document.visibilityState === "visible",
    );

    useEffect(() => {
        const onChange = () => setVisible(document.visibilityState === "visible");
        document.addEventListener("visibilitychange", onChange);
        return () => document.removeEventListener("visibilitychange", onChange);
    }, []);

    return visible;
}

/** Live viewport width, throttled to animation frames. Movement behaviors
 *  clamp the mascot inside [margin, width - margin]. */
export function useViewportWidth(): number {
    const [width, setWidth] = useState(
        () => (typeof window !== "undefined" ? window.innerWidth : 1280),
    );

    useEffect(() => {
        let raf = 0;
        const onResize = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => setWidth(window.innerWidth));
        };
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("resize", onResize);
            cancelAnimationFrame(raf);
        };
    }, []);

    return width;
}
