import { useEffect } from "react";
import { useReleaseSeatHold } from "./useSeatHold";
import { getActiveSeatHold, clearActiveSeatHold } from "../utils/activeSeatHold";

const SEAT_SELECTION_PATH_RE = /^\/customer\/seats\//;

/**
 * Releases the in-progress seat hold when the user presses browser Back
 * from F&B all the way to Seat Selection. Must be mounted once at the
 * app root (never unmounted) — see activeSeatHold.ts for why a listener
 * scoped to FnbPage itself misses the event.
 */
export function useSeatHoldBackGuard(): void {
    const { mutate: releaseSeatHold } = useReleaseSeatHold();

    useEffect(() => {
        const handlePopState = () => {
            if (!SEAT_SELECTION_PATH_RE.test(window.location.pathname)) return;
            const hold = getActiveSeatHold();
            if (!hold) return;
            clearActiveSeatHold();
            releaseSeatHold(hold);
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [releaseSeatHold]);
}
