import type { CSSProperties } from "react";

/**
 * ParallaxEngine — computes the direction-aware CSS custom property that
 * drives the overlay's slide-in drift (see .cgv-hoverlay--parallax /
 * @keyframes cgv-hoverlay-in in hero.css). The actual animation replay on
 * every slide change is triggered by the consumer re-mounting the element
 * with `key={movie.movieId}` — pure CSS, so there's no state/effect here
 * and prefers-reduced-motion is handled entirely by the stylesheet.
 */
export function useParallaxStyle(direction: 1 | -1, distancePx = 8): CSSProperties {
    return { "--cgv-parallax-x": `${direction * distancePx}px` } as CSSProperties;
}
