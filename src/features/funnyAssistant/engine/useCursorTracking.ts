import { useEffect, useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   InteractionEngine (cursor half) — makes the mascot aware of the
   pointer. Produces smoothed pupil offsets for eye-tracking and fires
   enter/leave callbacks with hysteresis so the mascot doesn't twitch
   at the proximity boundary. One rAF-throttled listener, only while on.
══════════════════════════════════════════════════════════════ */

const ENTER_RADIUS = 168;
const LEAVE_RADIUS = 250;
const MAX_PUPIL = 2.7; // local SVG units

interface Options {
    enabled: boolean;
    /** Returns the mascot head centre in viewport px, or null if unmounted. */
    getHeadCenter: () => { x: number; y: number } | null;
    onEnter: () => void;
    onLeave: () => void;
}

export function useCursorTracking({ enabled, getHeadCenter, onEnter, onLeave }: Options) {
    // Raw target, then a spring so the eyes glide rather than snap.
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const pupilX = useSpring(rawX, { stiffness: 340, damping: 26, mass: 0.4 });
    const pupilY = useSpring(rawY, { stiffness: 340, damping: 26, mass: 0.4 });

    const nearRef = useRef(false);
    const enterRef = useRef(onEnter);
    const leaveRef = useRef(onLeave);
    const getCenterRef = useRef(getHeadCenter);

    // Keep the latest callbacks without re-subscribing the mousemove listener.
    // (Written in an effect, not during render — required by react-hooks/refs.)
    useEffect(() => {
        enterRef.current = onEnter;
        leaveRef.current = onLeave;
        getCenterRef.current = getHeadCenter;
    });

    useEffect(() => {
        if (!enabled) return;
        let raf = 0;
        let pending: { x: number; y: number } | null = null;

        const process = () => {
            raf = 0;
            if (!pending) return;
            const center = getCenterRef.current();
            if (!center) return;
            const dx = pending.x - center.x;
            const dy = pending.y - center.y;
            const dist = Math.hypot(dx, dy);

            // Eye tracking — normalize the direction, scale into pupil range.
            const norm = Math.max(1, dist);
            rawX.set(Math.max(-MAX_PUPIL, Math.min(MAX_PUPIL, (dx / norm) * MAX_PUPIL)));
            rawY.set(Math.max(-1.8, Math.min(2, (dy / norm) * 2)));

            // Proximity with hysteresis.
            if (!nearRef.current && dist < ENTER_RADIUS) {
                nearRef.current = true;
                enterRef.current();
            } else if (nearRef.current && dist > LEAVE_RADIUS) {
                nearRef.current = false;
                leaveRef.current();
            }
        };

        const onMove = (e: MouseEvent) => {
            pending = { x: e.clientX, y: e.clientY };
            if (!raf) raf = requestAnimationFrame(process);
        };

        window.addEventListener("mousemove", onMove, { passive: true });
        return () => {
            window.removeEventListener("mousemove", onMove);
            if (raf) cancelAnimationFrame(raf);
            nearRef.current = false;
        };
    }, [enabled, rawX, rawY]);

    return { pupilX, pupilY };
}
