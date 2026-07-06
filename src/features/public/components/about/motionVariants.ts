import type { Variants, Transition } from "framer-motion";

/** Shared easing/timing so every section in the page moves at the same
 *  cinematic pace — smooth cubic-bezier, no bounce, 0.6–1.2s range. */
export const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const;

export const revealTransition: Transition = {
    duration: 0.9,
    ease: EASE_SMOOTH,
};

/** Scroll-reveal: opacity 0→1, y 30→0, scale 0.98→1 — the base motion
 *  used across Brand Story paragraphs, Experience cards and Timeline items. */
export const revealUp: Variants = {
    hidden: { opacity: 0, y: 32, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: revealTransition },
};

/** Staggered container — reveals its children one after another. */
export const staggerContainer = (staggerChildren = 0.15): Variants => ({
    hidden: {},
    visible: {
        transition: { staggerChildren, delayChildren: 0.1 },
    },
});

/** Shared viewport config: trigger once, slightly before the element is
 *  fully in view, so the motion reads as anticipatory rather than late. */
export const viewportOnce = { once: true, margin: "-80px" } as const;

/** Piecewise-linear interpolation across a sorted list of [input, output]
 *  points, clamped at both ends. Used for the pinned-scroll crossfade
 *  bands (Brand Story paragraphs, Experience panels) — computed as plain
 *  numbers from a single scroll listener rather than one useTransform per
 *  band, so there's no per-band WAAPI-driven animation to fall out of
 *  sync with the actual scroll position. */
export function bandValue(progress: number, points: [number, number][]): number {
    if (points.length === 0) return 0;
    if (progress <= points[0][0]) return points[0][1];
    for (let i = 1; i < points.length; i++) {
        const [x0, y0] = points[i - 1];
        const [x1, y1] = points[i];
        if (progress <= x1) {
            const t = x1 === x0 ? 1 : (progress - x0) / (x1 - x0);
            return y0 + (y1 - y0) * t;
        }
    }
    return points[points.length - 1][1];
}
