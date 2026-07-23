import { useSyncExternalStore } from "react";
import type { AnimationMode, KinoIntent } from "../types";

/* ══════════════════════════════════════════════════════════════
   FunnyModeManager — the tiny external store behind the feature.

   Deliberately NOT React context: the Settings card and the Kino
   widget live in completely different parts of the tree, and this
   also syncs choices across browser tabs. useSyncExternalStore gives
   every consumer a consistent, tearing-free read.

   Channels:
     • settings snapshot (mode / equipped outfit / sound / celebrations)
       — reactive via useFunnySettings
     • intent bus (sendIntent / subscribeIntents) — fire-and-forget so
       the app can ask Kino to react (e.g. a booking succeeded)
     • ambient tint (setAmbient / useKinoAmbient) — an optional colour a
       page can lend Kino's glow (e.g. echo a movie poster), bounded and
       blended so Kino still reads as itself
══════════════════════════════════════════════════════════════ */

const MODE_KEY = "cgv-funny-mode"; // "normal" | "funny"
const FORCE_VIP_KEY = "cgv-funny-force-vip"; // "1" → dev/QA override
const EQUIP_KEY = "cgv-kino-outfit"; // equipped outfit id, "" = none
const SOUND_KEY = "cgv-kino-sound"; // "1" → subtle SFX on
const CELEB_KEY = "cgv-kino-celebrations"; // milestone counter (unlocks)

export interface FunnySettings {
    mode: AnimationMode;
    /** Pinned outfit id, or null for none. */
    equipped: string | null;
    /** Opt-in sound effects (off by default). */
    sound: boolean;
    /** How many booking celebrations Kino has played — drives milestone unlocks. */
    celebrations: number;
}

const listeners = new Set<() => void>();

const num = (v: string | null) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

const read = (): FunnySettings => {
    try {
        return {
            mode: localStorage.getItem(MODE_KEY) === "funny" ? "funny" : "normal",
            equipped: localStorage.getItem(EQUIP_KEY) || null,
            sound: localStorage.getItem(SOUND_KEY) === "1",
            celebrations: num(localStorage.getItem(CELEB_KEY)),
        };
    } catch {
        return { mode: "normal", equipped: null, sound: false, celebrations: 0 };
    }
};

/** Cached snapshot so useSyncExternalStore gets a stable reference until
 *  something actually changes (required — a fresh object every read loops). */
let snapshot: FunnySettings = read();

const same = (a: FunnySettings, b: FunnySettings) =>
    a.mode === b.mode && a.equipped === b.equipped && a.sound === b.sound && a.celebrations === b.celebrations;

const refresh = () => {
    const next = read();
    if (!same(next, snapshot)) snapshot = next;
    listeners.forEach((l) => l());
};

// Cross-tab sync: another tab writing localStorage fires "storage" here.
if (typeof window !== "undefined") {
    window.addEventListener("storage", (e) => {
        if (e.key && [MODE_KEY, EQUIP_KEY, SOUND_KEY, CELEB_KEY].includes(e.key)) refresh();
    });
}

/* ── Intent bus (non-reactive) ── */
const intentListeners = new Set<(intent: KinoIntent) => void>();

/* ── Ambient tint channel ── */
let ambient: string | null = null;
const ambientListeners = new Set<() => void>();

const writeKey = (key: string, value: string | null) => {
    try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
    } catch {
        /* private mode / quota — the in-memory snapshot still updates */
    }
};

export const funnyModeStore = {
    subscribe(listener: () => void) {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    },
    getSnapshot(): FunnySettings {
        return snapshot;
    },
    setMode(mode: AnimationMode) {
        writeKey(MODE_KEY, mode);
        refresh();
    },
    setEquipped(id: string | null) {
        writeKey(EQUIP_KEY, id);
        refresh();
    },
    setSound(on: boolean) {
        writeKey(SOUND_KEY, on ? "1" : null);
        refresh();
    },
    /** Bump the milestone counter (called when a celebrate beat plays). */
    recordCelebration(): number {
        const next = snapshot.celebrations + 1;
        writeKey(CELEB_KEY, String(next));
        refresh();
        return next;
    },
    isForceVip(): boolean {
        try {
            return localStorage.getItem(FORCE_VIP_KEY) === "1";
        } catch {
            return false;
        }
    },

    /** Ask Kino to react to something that just happened in the app.
     *  Example wiring (booking success):
     *    funnyModeStore.sendIntent("celebrate");
     *  Safe to call anywhere; ignored unless the live Kino is mounted. */
    sendIntent(intent: KinoIntent) {
        intentListeners.forEach((l) => l(intent));
    },
    subscribeIntents(listener: (intent: KinoIntent) => void) {
        intentListeners.add(listener);
        return () => {
            intentListeners.delete(listener);
        };
    },

    /** Lend Kino's glow a colour (e.g. echo a movie poster). Bounded &
     *  blended by the stage so Kino still reads as itself. null clears it.
     *  Mechanism is ready; wire it from a page when desired. */
    setAmbient(color: string | null) {
        if (ambient === color) return;
        ambient = color;
        ambientListeners.forEach((l) => l());
    },
    getAmbient(): string | null {
        return ambient;
    },
    subscribeAmbient(listener: () => void) {
        ambientListeners.add(listener);
        return () => {
            ambientListeners.delete(listener);
        };
    },
};

/** Reactive hook — re-renders any consumer when settings change. */
export function useFunnySettings(): FunnySettings {
    return useSyncExternalStore(funnyModeStore.subscribe, funnyModeStore.getSnapshot);
}

/** Reactive hook for the ambient tint colour (or null). */
export function useKinoAmbient(): string | null {
    return useSyncExternalStore(funnyModeStore.subscribeAmbient, funnyModeStore.getAmbient);
}
