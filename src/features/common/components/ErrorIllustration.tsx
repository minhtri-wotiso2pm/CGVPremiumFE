/**
 * ErrorIllustration.tsx
 * Pure SVG illustrations — no external images needed.
 * Each illustration is thematically tied to the error type.
 */

import type { FC } from "react";

export type IllustrationVariant = "broken-film" | "locked";

interface Props {
    variant: IllustrationVariant;
    size?: number;
}

/* ── 404: Broken Film Reel ── */
const BrokenFilmReel: FC<{ size: number }> = ({ size }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Broken film reel illustration"
        role="img"
    >
        {/* Outer ring */}
        <circle cx="60" cy="60" r="52" stroke="rgba(232,0,28,0.18)" strokeWidth="2" strokeDasharray="8 5" />
        <circle cx="60" cy="60" r="44" stroke="rgba(232,0,28,0.10)" strokeWidth="1" />

        {/* Film reel spokes */}
        {[0, 60, 120, 180, 240, 300].map((angle) => (
            <line
                key={angle}
                x1="60" y1="60"
                x2={60 + 36 * Math.cos((angle * Math.PI) / 180)}
                y2={60 + 36 * Math.sin((angle * Math.PI) / 180)}
                stroke="rgba(232,0,28,0.22)"
                strokeWidth="2"
                strokeLinecap="round"
            />
        ))}

        {/* Center hub */}
        <circle cx="60" cy="60" r="14" fill="rgba(232,0,28,0.08)" stroke="rgba(232,0,28,0.3)" strokeWidth="2" />
        <circle cx="60" cy="60" r="5" fill="rgba(232,0,28,0.5)" />

        {/* Sprocket holes around edge */}
        {[30, 90, 150, 210, 270, 330].map((angle) => (
            <circle
                key={angle}
                cx={60 + 42 * Math.cos((angle * Math.PI) / 180)}
                cy={60 + 42 * Math.sin((angle * Math.PI) / 180)}
                r="4"
                fill="rgba(20,5,5,0.9)"
                stroke="rgba(232,0,28,0.2)"
                strokeWidth="1.5"
            />
        ))}

        {/* Broken film strip coming out */}
        <path
            d="M 84 36 Q 96 24 104 18 Q 110 14 108 20 Q 102 28 96 34"
            stroke="#E8001C"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
        />
        {/* Film strip frames */}
        <rect x="86" y="19" width="8" height="5" rx="1" fill="none" stroke="rgba(232,0,28,0.45)" strokeWidth="1.2" />
        <rect x="96" y="12" width="8" height="5" rx="1" fill="none" stroke="rgba(232,0,28,0.35)" strokeWidth="1.2" />

        {/* Crack / X mark */}
        <line x1="53" y1="53" x2="67" y2="67" stroke="rgba(232,0,28,0.6)" strokeWidth="2" strokeLinecap="round" />
        <line x1="67" y1="53" x2="53" y2="67" stroke="rgba(232,0,28,0.6)" strokeWidth="2" strokeLinecap="round" />

        {/* Glow dots */}
        <circle cx="22" cy="40" r="2" fill="rgba(232,0,28,0.25)" />
        <circle cx="98" cy="85" r="1.5" fill="rgba(232,0,28,0.2)" />
        <circle cx="30" cy="90" r="1" fill="rgba(232,0,28,0.15)" />
    </svg>
);

/* ── 403: Lock / VIP Shield ── */
const VIPLock: FC<{ size: number }> = ({ size }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Access denied lock illustration"
        role="img"
    >
        {/* Outer glow ring */}
        <circle cx="60" cy="60" r="52" stroke="rgba(245,158,11,0.14)" strokeWidth="2" strokeDasharray="6 6" />

        {/* Shield body */}
        <path
            d="M 60 18 L 88 30 L 88 58 C 88 76 75 88 60 94 C 45 88 32 76 32 58 L 32 30 Z"
            fill="rgba(245,158,11,0.06)"
            stroke="rgba(245,158,11,0.28)"
            strokeWidth="2"
            strokeLinejoin="round"
        />

        {/* Shield inner */}
        <path
            d="M 60 26 L 82 36 L 82 57 C 82 72 72 82 60 87 C 48 82 38 72 38 57 L 38 36 Z"
            fill="rgba(245,158,11,0.04)"
            stroke="rgba(245,158,11,0.15)"
            strokeWidth="1"
            strokeLinejoin="round"
        />

        {/* Lock body */}
        <rect x="48" y="56" width="24" height="18" rx="3"
            fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.5)" strokeWidth="2" />

        {/* Lock shackle */}
        <path d="M 52 56 L 52 49 Q 52 42 60 42 Q 68 42 68 49 L 68 56"
            stroke="rgba(245,158,11,0.6)" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Keyhole */}
        <circle cx="60" cy="63" r="3" fill="rgba(245,158,11,0.7)" />
        <rect x="58.5" y="63" width="3" height="5" rx="1" fill="rgba(245,158,11,0.7)" />

        {/* VIP text */}
        <text
            x="60" y="49"
            textAnchor="middle"
            fontSize="7"
            fontWeight="800"
            letterSpacing="0.15em"
            fill="rgba(245,158,11,0.4)"
            fontFamily="Inter, sans-serif"
        >
            VIP
        </text>

        {/* Stars */}
        {[
            { cx: 26, cy: 50, r: 2.5 },
            { cx: 94, cy: 55, r: 2 },
            { cx: 30, cy: 82, r: 1.5 },
            { cx: 96, cy: 38, r: 1.5 },
        ].map((s, i) => (
            <circle key={i} {...s} fill="rgba(245,158,11,0.2)" />
        ))}
    </svg>
);

const ErrorIllustration: FC<Props> = ({ variant, size = 100 }) => {
    if (variant === "locked") return <VIPLock size={size} />;
    return <BrokenFilmReel size={size} />;
};

export default ErrorIllustration;