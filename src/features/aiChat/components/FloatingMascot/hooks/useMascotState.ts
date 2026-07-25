import { useCallback, useEffect, useRef, useState } from "react";
import type { MascotState } from "../types/mascot.types";

const PRIORITY: Record<MascotState, number> = {
    error: 5,
    thinking: 4,
    landing: 4,
    happy: 3,
    click: 2,
    wave: 1,
    hover: 1,
    lookingAround: 0,
    idle: 0,
    roaming: 0,
    sleep: 0,
};

const AUTO_RETURN: Partial<Record<MascotState, { to: MascotState; ms: number }>> = {
    hover: { to: "idle", ms: 300 },
    click: { to: "idle", ms: 180 },
    happy: { to: "idle", ms: 600 },
    error: { to: "idle", ms: 500 },
    wave: { to: "idle", ms: 1800 },
    landing: { to: "roaming", ms: 350 },
};

const ROAMING_DELAY = 20000;
const SLEEP_TIMEOUT = 60000;
const SLEEP_CHECK_INTERVAL = 5000;

export function useMascotState() {
    const [state, setState] = useState<MascotState>("idle");
    const stateRef = useRef(state);
    stateRef.current = state;

    const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
    const [lastActivity, setLastActivity] = useState(Date.now());
    const lastActivityRef = useRef(lastActivity);
    lastActivityRef.current = lastActivity;

    const prevIsSendingRef = useRef(false);

    const clearTimers = useCallback(() => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current.clear();
    }, []);

    const scheduleReturn = useCallback((next: MascotState, delay: number) => {
        const timer = setTimeout(() => {
            timersRef.current.delete(timer);
            setState(next);
        }, delay);
        timersRef.current.add(timer);
    }, []);

    const transitionTo = useCallback(
        (next: MascotState, { force }: { force?: boolean } = {}) => {
            const current = stateRef.current;
            const nextP = PRIORITY[next];
            const currP = PRIORITY[current];

            if (!force && current !== "sleep" && nextP <= currP) return;

            clearTimers();
            setState(next);
            setLastActivity(Date.now());

            const autoRule = AUTO_RETURN[next];
            if (autoRule) {
                scheduleReturn(autoRule.to, autoRule.ms);
            }
        },
        [clearTimers, scheduleReturn],
    );

    /* ── AI state bridge ─────────────────────────────────────────── */

    const updateAiState = useCallback(
        (isSending: boolean, hasFailedMessage: boolean) => {
            const wasSending = prevIsSendingRef.current;
            prevIsSendingRef.current = isSending;

            if (!wasSending && isSending) {
                transitionTo("thinking");
            } else if (wasSending && !isSending) {
                transitionTo(hasFailedMessage ? "error" : "happy");
            }
        },
        [transitionTo],
    );

    /* ── Interaction handlers ────────────────────────────────────── */

    const touchActivity = useCallback(() => {
        const s = stateRef.current;
        if (s === "sleep") {
            setState("idle");
        } else if (s === "roaming") {
            clearTimers();
            setState("idle");
        } else if (s === "landing") {
            clearTimers();
            setState("idle");
        }
        setLastActivity(Date.now());
    }, [clearTimers]);

    const handleMouseEnter = useCallback(() => {
        touchActivity();
        transitionTo("hover");
    }, [touchActivity, transitionTo]);

    const handleMouseLeave = useCallback(() => {
        touchActivity();
        if (stateRef.current === "hover") {
            clearTimers();
            setState("idle");
        }
    }, [touchActivity, clearTimers]);

    const handleClick = useCallback(() => {
        touchActivity();
        transitionTo("click");
    }, [touchActivity, transitionTo]);

    /* ── Sleep & Roaming timers ──────────────────────────────────── */

    useEffect(() => {
        const interval = setInterval(() => {
            const s = stateRef.current;
            const elapsed = Date.now() - lastActivityRef.current;

            if ((s === "idle" || s === "lookingAround") && elapsed >= SLEEP_TIMEOUT) {
                setState("sleep");
            } else if (s === "idle" && elapsed >= ROAMING_DELAY) {
                setState("roaming");
            }
        }, SLEEP_CHECK_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    return {
        state,
        setState,
        handleMouseEnter,
        handleMouseLeave,
        handleClick,
        updateAiState,
        touchActivity,
    };
}
