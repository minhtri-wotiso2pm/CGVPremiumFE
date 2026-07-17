/**
 * Apple-style line icons for the counter POS — SF Symbols vibe:
 * 24-unit grid, 1.6–1.8 stroke, round caps/joins, minimal geometry.
 * Hand-drawn (no icon library). Size via the `size` prop; colour inherits
 * `currentColor`.
 */
import type { FC } from "react";

interface IconProps {
    size?: number;
}

const base = (size: number) => ({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor" as const,
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
});

export const TicketFnbIcon: FC<IconProps> = ({ size = 24 }) => (
    <svg {...base(size)}>
        <path d="M3 8.5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2 1.5 1.5 0 0 0 0 3 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 1.5 1.5 0 0 0 0-3Z" />
        <path d="M11 6.5v9" strokeDasharray="1.4 2.2" />
        <path d="M18.5 14.5h3l-.4 5.2a1.4 1.4 0 0 1-1.4 1.3h-.4a1.4 1.4 0 0 1-1.4-1.3Z" />
        <path d="M18.7 14.5a1.3 1.3 0 0 1 2.6 0" />
    </svg>
);

export const FnbOnlyIcon: FC<IconProps> = ({ size = 24 }) => (
    <svg {...base(size)}>
        <path d="M7 9h10l-.8 9.4a2 2 0 0 1-2 1.8H9.8a2 2 0 0 1-2-1.8L7 9Z" />
        <path d="M9.5 9V7.4a2.5 2.5 0 0 1 5 0V9" />
        <path d="M10 12.5v4M14 12.5v4" strokeWidth="1.4" />
    </svg>
);

export const FilmIcon: FC<IconProps> = ({ size = 24 }) => (
    <svg {...base(size)}>
        <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
        <path d="M8 4.5v15M16 4.5v15M3.5 9.5h4.5M3.5 14.5h4.5M16 9.5h4.5M16 14.5h4.5" />
    </svg>
);

export const SeatIcon: FC<IconProps> = ({ size = 24 }) => (
    <svg {...base(size)}>
        <path d="M6 11V7.5A2.5 2.5 0 0 1 8.5 5h7A2.5 2.5 0 0 1 18 7.5V11" />
        <path d="M5 11h14a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 15.5v-3A1.5 1.5 0 0 1 5 11Z" />
        <path d="M6.5 17v2M17.5 17v2" />
    </svg>
);

export const PersonIcon: FC<IconProps> = ({ size = 24 }) => (
    <svg {...base(size)}>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
    </svg>
);

export const CardIcon: FC<IconProps> = ({ size = 24 }) => (
    <svg {...base(size)}>
        <rect x="3" y="6" width="18" height="12" rx="2.5" />
        <path d="M3 10h18M6.5 14.5h4" />
    </svg>
);

export const CashIcon: FC<IconProps> = ({ size = 24 }) => (
    <svg {...base(size)}>
        <rect x="3" y="6.5" width="18" height="11" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M6.5 9.5h.01M17.5 14.5h.01" />
    </svg>
);

export const WalletIcon: FC<IconProps> = ({ size = 24 }) => (
    <svg {...base(size)}>
        <path d="M3.5 8.5A2 2 0 0 1 5.5 6.5h11a2 2 0 0 1 2 2v0" />
        <rect x="3.5" y="8.5" width="17" height="10" rx="2" />
        <path d="M16.5 12.5h2.5v3h-2.5a1.5 1.5 0 0 1 0-3Z" />
    </svg>
);

export const QrIcon: FC<IconProps> = ({ size = 24 }) => (
    <svg {...base(size)}>
        <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.5" />
        <rect x="14" y="3.5" width="6.5" height="6.5" rx="1.5" />
        <rect x="3.5" y="14" width="6.5" height="6.5" rx="1.5" />
        <path d="M14 14h3M20.5 14v3M14 20.5h.01M17.5 17.5h.01M20.5 20.5h.01M17.5 20.5h.01M20.5 17.5h.01" />
    </svg>
);

export const BackIcon: FC<IconProps> = ({ size = 18 }) => (
    <svg {...base(size)} strokeWidth={2}>
        <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
);

export const CheckIcon: FC<IconProps> = ({ size = 24 }) => (
    <svg {...base(size)}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 12.2l2.4 2.4 4.6-4.8" />
    </svg>
);

export const PlusIcon: FC<IconProps> = ({ size = 18 }) => (
    <svg {...base(size)} strokeWidth={2}>
        <path d="M12 5v14M5 12h14" />
    </svg>
);

export const MinusIcon: FC<IconProps> = ({ size = 18 }) => (
    <svg {...base(size)} strokeWidth={2}>
        <path d="M5 12h14" />
    </svg>
);
