import { useCallback, useEffect, useRef } from "react";

/* ══════════════════════════════════════════════════════════════
   useKinoSound — subtle, opt-in sound.

   Synthesised with the Web Audio API (sine tones + short envelopes),
   so there are NO audio asset files to ship or load. Deliberately quiet
   and rare — a soft cue, never a jingle. Off by default; only plays when
   the user has turned it on in Settings.

   Browsers block audio until a user gesture, so the AudioContext is
   created lazily and resumed on demand. Sounds fired before any
   interaction (e.g. the first-visit greet) simply stay silent — fine.
══════════════════════════════════════════════════════════════ */

export type SoundKind = "wake" | "celebrate" | "chat";

export function useKinoSound(enabled: boolean) {
    const ctxRef = useRef<AudioContext | null>(null);

    const getCtx = useCallback((): AudioContext | null => {
        if (!ctxRef.current) {
            if (typeof window === "undefined" || !window.AudioContext) return null;
            ctxRef.current = new AudioContext();
        }
        return ctxRef.current;
    }, []);

    useEffect(() => {
        return () => {
            void ctxRef.current?.close().catch(() => {});
            ctxRef.current = null;
        };
    }, []);

    return useCallback(
        (kind: SoundKind) => {
            if (!enabled) return;
            const ctx = getCtx();
            if (!ctx) return;
            if (ctx.state === "suspended") void ctx.resume().catch(() => {});

            const t0 = ctx.currentTime;
            const blip = (freq: number, at: number, dur: number, peak: number) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.0001, t0 + at);
                gain.gain.exponentialRampToValueAtTime(peak, t0 + at + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, t0 + at + dur);
                osc.connect(gain).connect(ctx.destination);
                osc.start(t0 + at);
                osc.stop(t0 + at + dur + 0.03);
            };

            if (kind === "chat") {
                blip(440, 0, 0.18, 0.05);
            } else if (kind === "wake") {
                blip(523.25, 0, 0.16, 0.045);
                blip(659.25, 0.09, 0.2, 0.05);
            } else {
                // celebrate — a gentle ascending triad
                blip(523.25, 0, 0.22, 0.05);
                blip(659.25, 0.1, 0.24, 0.055);
                blip(783.99, 0.2, 0.34, 0.06);
            }
        },
        [enabled, getCtx],
    );
}
