import { memo } from "react";
import { motion, type MotionValue } from "framer-motion";
import type { ResolvedOutfit } from "../types";

/* ══════════════════════════════════════════════════════════════
   Sigil — Kino's single visual rig.

   A vertical "seed of light": a diffuse halo, a token-tinted core, and
   a pair of eyes that only open (via CSS on the parent `.fa-mascot`,
   keyed by data-awake) when the light wakes. Every fill references the
   derived `--k-*` custom properties, so the whole creature is generated
   from ONE design token (`--cgv-crimson`) — never hard-coded.

   The optional outfit layer renders only when the parent passes one
   (i.e. in character states), so the Dormant presence stays pure light.
   The ambient breath is a compositor-only CSS animation (see the .css).
══════════════════════════════════════════════════════════════ */

interface Props {
    /** Smoothed pupil offset in local SVG units (from useCursorTracking). */
    pupilX: MotionValue<number>;
    pupilY: MotionValue<number>;
    /** Unique gradient id suffix so multiple Sigils on a page don't clash. */
    idSuffix?: string;
    /** Equipped, unlocked outfit to draw — only supplied in character states. */
    outfit?: ResolvedOutfit | null;
}

const Sigil = memo(function Sigil({ pupilX, pupilY, idSuffix = "main", outfit = null }: Props) {
    const halo = `k-halo-${idSuffix}`;
    const core = `k-core-${idSuffix}`;

    return (
        <svg className="fa-sigil" viewBox="0 0 100 112" aria-hidden="true">
            <defs>
                <radialGradient id={halo} cx="50%" cy="42%" r="56%">
                    <stop offset="0%" stopColor="var(--k-heart)" stopOpacity="0.55" />
                    <stop offset="46%" stopColor="var(--k-core)" stopOpacity="0.20" />
                    <stop offset="100%" stopColor="var(--k-core)" stopOpacity="0" />
                </radialGradient>
                <radialGradient id={core} cx="42%" cy="34%" r="72%">
                    <stop offset="0%" stopColor="var(--k-heart)" />
                    <stop offset="38%" stopColor="var(--k-core)" />
                    <stop offset="100%" stopColor="var(--k-deep)" />
                </radialGradient>
            </defs>

            {/* Diffuse halo (breathes, trails the core) */}
            <ellipse className="k-halo" cx="50" cy="46" rx="42" ry="46" fill={`url(#${halo})`} />

            {/* Core body of light (breathes) */}
            <g className="k-core">
                <path
                    d="M50 8 C66 8 76 26 76 48 C76 72 64 86 50 86 C36 86 24 72 24 48 C24 26 34 8 50 8 Z"
                    fill={`url(#${core})`}
                />
                {/* implied top-light */}
                <ellipse cx="42" cy="30" rx="11" ry="7" fill="#ffffff" opacity="0.16" />
            </g>

            {/* Outfit accessory — only present in character states (parent-gated) */}
            {outfit && <g className="k-outfit">{outfit.render({ accent: outfit.accent })}</g>}

            {/* Eyes — open via CSS (.fa-mascot[data-awake=true] .k-eyes) */}
            <motion.g className="k-eyes" style={{ x: pupilX, y: pupilY }}>
                <ellipse cx="40" cy="47" rx="5.4" ry="7" fill="var(--k-ink)" />
                <ellipse cx="60" cy="47" rx="5.4" ry="7" fill="var(--k-ink)" />
                <circle cx="42" cy="43.6" r="1.9" fill="#fff" />
                <circle cx="62" cy="43.6" r="1.9" fill="#fff" />
                <circle cx="38.4" cy="48.4" r="0.9" fill="#fff" opacity="0.5" />
                <circle cx="58.4" cy="48.4" r="0.9" fill="#fff" opacity="0.5" />
            </motion.g>
        </svg>
    );
});

export default Sigil;
