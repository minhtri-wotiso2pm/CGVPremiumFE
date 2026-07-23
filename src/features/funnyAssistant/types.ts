import type { ReactNode } from "react";

/* ══════════════════════════════════════════════════════════════
   Kino — "Living Sigil" · shared types.

   Kino is a light, not a creature. 90% of the time it is a calm,
   token-tinted point of light (Dormant); at meaningful moments it
   *wakes* into a character — eyes open, a single beat — then folds
   back to light. The whole feature is a small finite-state machine
   over that idea. No RNG roaming, no catch-to-open game.
══════════════════════════════════════════════════════════════ */

/** High-level FSM state — "what is the light doing right now?". */
export type KinoState =
    | "hidden" // not rendered (fullscreen video / dismissed) — zero cost
    | "dormant" // calm breathing light in the corner (the 90% default)
    | "aware" // noticed the cursor / a help-likely context — brightens, leans
    | "waking" // morphing open: eyes appear (anticipation → settle)
    | "present" // character form, eyes open, gentle idle (brief)
    | "gesturing" // a single meaningful beat (greet / celebrate / nudge)
    | "engaged" // resting at the chat dock during a conversation
    | "folding"; // eyes close, character folds back to light

/** Emotional tone — expressed by motion params (breath, brightness,
 *  eye-openness, glow), never by text. Deliberately few, each legible
 *  at the real 84px size. */
export type Tone = "calm" | "attentive" | "delighted" | "resting";

/** One-shot expressive beats the machine can play in `gesturing`. */
export type Gesture = "greet" | "celebrate" | "nudge";

/** Live snapshot the Sigil renders from. */
export interface KinoFrame {
    state: KinoState;
    tone: Tone;
}

/** Context intents the app can push to Kino (see funnyModeStore).
 *  Kept intentionally small — Kino acts on reasons, not randomness. */
export type KinoIntent = Gesture;

export type AnimationMode = "normal" | "funny";

/* ══════════════════════════════════════════════════════════════
   Outfit system (P3).

   Outfits render ONLY in character states (they are glimpsed, not the
   default look — which keeps the Dormant presence pure token-light and
   makes outfits feel special/earned). Each outfit declares a colorMode
   that resolves the "fixed-colour vs token-adaptive" tension explicitly:
     • token-tinted  → drawn with the live --k-* palette, always adapts
     • accent-fixed  → allowed one pinned hex (a deliberate "colour moment")
══════════════════════════════════════════════════════════════ */

/** Where an outfit sits in Kino's light. */
export type OutfitSlot = "crown" | "aura";

export type Rarity = "common" | "rare" | "seasonal" | "event" | "premium";

/** How an outfit sources colour (see the tension note above). */
export type ColorMode = "token-tinted" | "accent-fixed";

/** How an outfit becomes available. Evaluated by data/outfits.ts. */
export type UnlockRule =
    | { type: "default" } // always available
    | { type: "tier" } // any VIP (the feature already implies VIP)
    | { type: "milestone"; celebrations: number } // N booking celebrations
    | { type: "seasonal"; month: number; day?: number } // only during a date window
    | { type: "premium" }; // future paid — never auto-unlocks yet

/** Facts the unlock engine evaluates a rule against. */
export interface UnlockContext {
    isVip: boolean;
    celebrations: number;
    now: Date;
}

export interface OutfitRenderCtx {
    /** Either a "var(--k-*)" reference (token-tinted) or a fixed hex. */
    accent: string;
}

export interface Outfit {
    id: string;
    name: string;
    rarity: Rarity;
    slot: OutfitSlot;
    colorMode: ColorMode;
    /** Required iff colorMode === "accent-fixed". */
    accent?: string;
    unlock: UnlockRule;
    /** SVG accessory layer drawn in Kino's local 100×112 space. */
    render: (ctx: OutfitRenderCtx) => ReactNode;
}

/** An unlocked, colour-resolved outfit ready to hand to the Sigil. */
export interface ResolvedOutfit {
    render: (ctx: OutfitRenderCtx) => ReactNode;
    accent: string;
}
