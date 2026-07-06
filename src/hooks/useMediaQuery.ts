import { useState, useEffect } from "react";

/** Tracks whether a CSS media query currently matches. Used to scale down
 *  parallax/motion intensity on narrow viewports without duplicating
 *  breakpoint numbers between CSS and JS-driven animation logic. */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(() =>
        typeof window !== "undefined" ? window.matchMedia(query).matches : false,
    );

    // Re-sync during render if the query string itself changes, rather than
    // via a synchronous setState in the effect body.
    const [prevQuery, setPrevQuery] = useState(query);
    if (query !== prevQuery) {
        setPrevQuery(query);
        setMatches(window.matchMedia(query).matches);
    }

    useEffect(() => {
        const mql = window.matchMedia(query);
        const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, [query]);

    return matches;
}
