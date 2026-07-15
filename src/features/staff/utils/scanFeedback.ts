let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
    try {
        if (!audioCtx) audioCtx = new AudioContext();
        return audioCtx;
    } catch {
        return null;
    }
};

const beep = (freq: number, durationMs: number) => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.15;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
};

/** Short audio + haptic cue so staff get feedback without watching the
 *  screen while scanning tickets at the door. Silently no-ops if the
 *  browser blocks/lacks Web Audio or vibration — this is a nice-to-have,
 *  never something worth surfacing an error for. */
export const playScanFeedback = (outcome: "success" | "error"): void => {
    try {
        if (outcome === "success") {
            beep(880, 120);
        } else {
            beep(220, 220);
        }
    } catch {
        // ignore
    }
    if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(outcome === "success" ? 60 : [80, 60, 80]);
    }
};
