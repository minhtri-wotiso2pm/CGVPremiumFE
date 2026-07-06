import { useEffect, useRef, useState } from "react";

/** Animates a number from its previous value to `target` on change, via
 *  requestAnimationFrame (no extra dependency). Used by KpiCard so values
 *  count up smoothly whenever the report filters change. */
export function useCountUp(target: number, durationMs = 900): number {
    const [value, setValue] = useState(target);
    const fromRef = useRef(target);

    useEffect(() => {
        const from = fromRef.current;
        if (from === target) return;

        let raf = 0;
        let start: number | null = null;

        const tick = (t: number) => {
            if (start === null) start = t;
            const progress = Math.min(1, (t - start) / durationMs);
            const eased = 1 - (1 - progress) ** 3; // ease-out cubic
            setValue(from + (target - from) * eased);
            if (progress < 1) {
                raf = requestAnimationFrame(tick);
            } else {
                fromRef.current = target;
            }
        };
        raf = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(raf);
    }, [target, durationMs]);

    return value;
}
