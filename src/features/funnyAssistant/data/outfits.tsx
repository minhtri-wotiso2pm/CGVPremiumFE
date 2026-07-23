import type { Outfit, ResolvedOutfit, UnlockContext } from "../types";

/* ══════════════════════════════════════════════════════════════
   Outfit registry.

   Each outfit is an SVG accessory drawn in Kino's local 100×112 space
   (crown of the light near y≈6–22). Outfits render ONLY in character
   states, so they are rare glimpses — which makes them feel earned.

   colorMode resolves the "fixed colour vs token-adaptive" tension:
     • token-tinted → accent = "var(--k-heart)" → adapts with the theme
     • accent-fixed → a deliberate pinned hex (a "colour moment")

   Adding an outfit = one entry here. Nothing else changes.
══════════════════════════════════════════════════════════════ */

export const OUTFITS: Outfit[] = [
    {
        id: "halo",
        name: "Guiding Halo",
        rarity: "common",
        slot: "aura",
        colorMode: "token-tinted",
        unlock: { type: "default" },
        render: ({ accent }) => (
            <g opacity="0.9">
                <ellipse cx="50" cy="17" rx="30" ry="8" fill="none" stroke={accent} strokeWidth="3.2" />
                <ellipse cx="50" cy="17" rx="30" ry="8" fill="none" stroke="#fff" strokeWidth="0.8" opacity="0.4" />
            </g>
        ),
    },
    {
        id: "beret",
        name: "Director's Beret",
        rarity: "rare",
        slot: "crown",
        colorMode: "accent-fixed",
        accent: "#2b2732",
        unlock: { type: "milestone", celebrations: 1 },
        render: ({ accent }) => (
            <g transform="rotate(-8 50 14)">
                <ellipse cx="50" cy="14" rx="19" ry="6.5" fill={accent} />
                <ellipse cx="50" cy="12.5" rx="15" ry="4.5" fill={accent} />
                <circle cx="60" cy="8.5" r="2.4" fill={accent} />
            </g>
        ),
    },
    {
        id: "crown",
        name: "Milestone Crown",
        rarity: "rare",
        slot: "crown",
        colorMode: "accent-fixed",
        accent: "#f5b623",
        unlock: { type: "milestone", celebrations: 5 },
        render: ({ accent }) => (
            <g>
                <path d="M33 20 L37 9 L44 16 L50 6 L56 16 L63 9 L67 20 Q50 15 33 20 Z" fill={accent} />
                <circle cx="50" cy="6" r="1.9" fill="#fff" opacity="0.75" />
            </g>
        ),
    },
    {
        id: "sparks",
        name: "Festival Sparks",
        rarity: "event",
        slot: "aura",
        colorMode: "accent-fixed",
        accent: "#ff7aa2",
        unlock: { type: "milestone", celebrations: 10 },
        render: ({ accent }) => (
            <g fill={accent}>
                {([[18, 30], [82, 34], [22, 70], [80, 66], [50, 4]] as const).map(([x, y], i) => (
                    <path key={i} d={`M${x} ${y - 4} l3 4 -3 4 -3 -4 z`} />
                ))}
            </g>
        ),
    },
    {
        id: "frost",
        name: "Winter Frost",
        rarity: "seasonal",
        slot: "crown",
        colorMode: "accent-fixed",
        accent: "#9ecbff",
        unlock: { type: "seasonal", month: 11 }, // December (0-indexed)
        render: ({ accent }) => (
            <g fill={accent}>
                <path d="M31 22 Q50 8 69 22 Q50 15 31 22 Z" />
                <circle cx="40" cy="14" r="1.6" opacity="0.85" />
                <circle cx="50" cy="10" r="2" opacity="0.9" />
                <circle cx="60" cy="14" r="1.6" opacity="0.85" />
            </g>
        ),
    },
    {
        id: "signature",
        name: "Signature Aura",
        rarity: "premium",
        slot: "aura",
        colorMode: "accent-fixed",
        accent: "#c8a2ff",
        unlock: { type: "premium" },
        render: ({ accent }) => (
            <g fill="none" stroke={accent} strokeWidth="2.2">
                <ellipse cx="50" cy="17" rx="31" ry="8.5" />
                <ellipse cx="50" cy="19" rx="24" ry="6" opacity="0.55" />
            </g>
        ),
    },
];

/* ── Lookup + unlock engine ── */

export function getOutfit(id: string | null | undefined): Outfit | undefined {
    return id ? OUTFITS.find((o) => o.id === id) : undefined;
}

export function isUnlocked(outfit: Outfit, ctx: UnlockContext): boolean {
    const u = outfit.unlock;
    switch (u.type) {
        case "default":
            return true;
        case "tier":
            return ctx.isVip;
        case "milestone":
            return ctx.celebrations >= u.celebrations;
        case "seasonal":
            return ctx.now.getMonth() === u.month && (u.day === undefined || ctx.now.getDate() === u.day);
        case "premium":
            return false; // future paid slot — same interface, never auto-unlocks yet
        default:
            return false;
    }
}

/** The colour an outfit draws with: a live token ref, or its pinned hex. */
export function resolveAccent(outfit: Outfit): string {
    return outfit.colorMode === "accent-fixed" ? outfit.accent ?? "var(--k-heart)" : "var(--k-heart)";
}

/** Resolve the equipped outfit to something the Sigil can render — but
 *  only if it exists and is currently unlocked (defensive: never render a
 *  locked outfit even if its id lingers in storage). */
export function resolveEquipped(id: string | null, ctx: UnlockContext): ResolvedOutfit | null {
    const outfit = getOutfit(id);
    if (!outfit || !isUnlocked(outfit, ctx)) return null;
    return { render: outfit.render, accent: resolveAccent(outfit) };
}

/** Human-readable unlock condition (VN) for the Wardrobe UI. */
export function describeUnlock(outfit: Outfit): string {
    const u = outfit.unlock;
    switch (u.type) {
        case "default":
            return "Luôn có sẵn";
        case "tier":
            return "Thành viên VIP";
        case "milestone":
            return `Đặt vé ${u.celebrations} lần`;
        case "seasonal":
            return "Theo mùa · Tháng 12";
        case "premium":
            return "Premium · sắp ra mắt";
        default:
            return "";
    }
}

/** Milestone progress for the Wardrobe progress ring, or null. */
export function unlockProgress(outfit: Outfit, ctx: UnlockContext): { have: number; need: number } | null {
    if (outfit.unlock.type !== "milestone") return null;
    return { have: Math.min(ctx.celebrations, outfit.unlock.celebrations), need: outfit.unlock.celebrations };
}
