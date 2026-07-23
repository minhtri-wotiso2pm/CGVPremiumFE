import { useCallback, useRef, useState } from "react";
import type { Gesture, KinoFrame, KinoState, Tone } from "../types";

/* ══════════════════════════════════════════════════════════════
   useKinoMachine — the finite-state machine that replaced the old
   RNG "roam every 20–40s" scheduler.

   Kino holds ONE frame {state, tone} and moves between states only on
   real events (cursor, click, chat, a pushed intent). There is no
   random movement and no timer that invents behavior.

   Orchestrated sequences (wake / fold / gesture) are async. A monotonic
   token cancels a stale sequence the moment a newer transition starts —
   the same "control token" idea as the old beginTakeover(), but built
   in so a dramatic beat can't be stomped mid-flight.

   State guards live here (stateRef) so callers can fire transitions
   freely without reading stale React state.
══════════════════════════════════════════════════════════════ */

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const WAKE_MS = 380;
const FOLD_MS = 420;

export interface KinoMachine {
    frame: KinoFrame;
    getState: () => KinoState;
    /** Cursor noticed → brighten + attentive. Only from calm free states. */
    toAware: () => void;
    /** Cursor left → back to calm. Only if currently aware. */
    leaveAware: () => void;
    /** dormant/aware → waking → present. Awaitable (used before chat). */
    wakeToPresent: () => Promise<void>;
    /** → folding → dormant. Awaitable (used after chat closes). */
    foldToDormant: () => Promise<void>;
    /** Snap to a resting character at the chat dock. */
    goEngaged: () => void;
    /** Snap straight to calm light (reduced-motion / reset). */
    goDormant: () => void;
    /** Remove from the page entirely (fullscreen video / dismissed). */
    goHidden: () => void;
    /** Play a one-shot expressive beat, then fold back to dormant. */
    playGesture: (g: Gesture) => Promise<void>;
}

export function useKinoMachine(): KinoMachine {
    const [frame, setFrame] = useState<KinoFrame>({ state: "dormant", tone: "calm" });

    const stateRef = useRef<KinoState>(frame.state);
    const tokenRef = useRef(0);

    const apply = useCallback((state: KinoState, tone: Tone) => {
        stateRef.current = state;
        setFrame({ state, tone });
    }, []);

    /** Start a fresh sequence and invalidate any running one. */
    const claim = useCallback(() => ++tokenRef.current, []);
    const current = useCallback((t: number) => tokenRef.current === t, []);

    const getState = useCallback(() => stateRef.current, []);

    const toAware = useCallback(() => {
        if (stateRef.current !== "dormant" && stateRef.current !== "aware") return;
        claim();
        apply("aware", "attentive");
    }, [apply, claim]);

    const leaveAware = useCallback(() => {
        if (stateRef.current !== "aware") return;
        claim();
        apply("dormant", "calm");
    }, [apply, claim]);

    const goEngaged = useCallback(() => {
        claim();
        apply("engaged", "resting");
    }, [apply, claim]);

    const goDormant = useCallback(() => {
        claim();
        apply("dormant", "calm");
    }, [apply, claim]);

    const goHidden = useCallback(() => {
        claim();
        apply("hidden", "calm");
    }, [apply, claim]);

    const wakeToPresent = useCallback(async () => {
        const t = claim();
        apply("waking", "attentive");
        await sleep(WAKE_MS);
        if (!current(t)) return;
        apply("present", "attentive");
    }, [apply, claim, current]);

    const foldToDormant = useCallback(async () => {
        const t = claim();
        apply("folding", "resting");
        await sleep(FOLD_MS);
        if (!current(t)) return;
        apply("dormant", "calm");
    }, [apply, claim, current]);

    const playGesture = useCallback(
        async (g: Gesture) => {
            const t = claim();
            const tone: Tone = g === "celebrate" ? "delighted" : "attentive";
            apply("waking", tone);
            await sleep(WAKE_MS);
            if (!current(t)) return;
            apply("gesturing", tone);
            await sleep(g === "celebrate" ? 1500 : 1900);
            if (!current(t)) return;
            apply("folding", "resting");
            await sleep(FOLD_MS);
            if (!current(t)) return;
            apply("dormant", "calm");
        },
        [apply, claim, current],
    );

    return {
        frame,
        getState,
        toAware,
        leaveAware,
        wakeToPresent,
        foldToDormant,
        goEngaged,
        goDormant,
        goHidden,
        playGesture,
    };
}
