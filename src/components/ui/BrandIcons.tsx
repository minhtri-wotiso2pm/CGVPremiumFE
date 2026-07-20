import { type FC, type SVGProps } from "react";

/* ══════════════════════════════════════════════════════════════
   Brand icon set — hand-drawn line icons (24 grid, rounded joins),
   a single cohesive family used in place of emoji across the app.
   All accept a `size` prop and forward native SVG props.
══════════════════════════════════════════════════════════════ */

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "width" | "height"> {
    size?: number;
}

const Svg: FC<IconProps & { children: React.ReactNode }> = ({ size = 24, children, ...rest }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...rest}
    >
        {children}
    </svg>
);

/** Clapperboard — movie / poster placeholder. */
export const FilmClapperIcon: FC<IconProps> = (p) => (
    <Svg {...p}>
        <path d="M3.2 8.6 20 6.1a1.4 1.4 0 0 1 1.6 1.2l.2 1.3H3l-.6-1.2Z" transform="rotate(-6 12 8)" />
        <path d="M3 9h18v9.5A1.5 1.5 0 0 1 19.5 20h-15A1.5 1.5 0 0 1 3 18.5V9Z" />
        <path d="m6.5 6-1.3 3M11 5.2 9.7 8.4M15.5 4.5l-1.3 3.2" />
    </Svg>
);

/** Photo frame with an up-arrow — "upload / choose image". */
export const UploadImageIcon: FC<IconProps> = (p) => (
    <Svg {...p}>
        <rect x="3" y="4.5" width="18" height="15" rx="2.4" />
        <path d="M3.6 16.5 8 12.4a1.5 1.5 0 0 1 2 0l3.2 3M13 14l1.6-1.5a1.5 1.5 0 0 1 2 0L21 16" />
        <path d="M12 10.5V4.5m0 0L9.8 6.6M12 4.5l2.2 2.1" />
    </Svg>
);

/** Head-and-shoulders inside a soft frame — person photo placeholder. */
export const PersonPhotoIcon: FC<IconProps> = (p) => (
    <Svg {...p}>
        <circle cx="12" cy="9.5" r="3.2" />
        <path d="M5.5 19.2a6.6 6.6 0 0 1 13 0" />
    </Svg>
);

/** Single theatre mask — Cast & Crew. */
export const TheatreMaskIcon: FC<IconProps> = (p) => (
    <Svg {...p}>
        <path d="M4.5 4.5c5-1 10-1 15 0 .4 6.2-1.6 12-4.4 14.2a5 5 0 0 1-6.2 0C6.1 16.5 4.1 10.7 4.5 4.5Z" />
        <path d="M8.5 9.5c1-.7 2.2-.7 3.2 0M12.3 9.5c1-.7 2.2-.7 3.2 0" />
        <path d="M9.5 14.2c1.6 1.3 3.4 1.3 5 0" />
    </Svg>
);

/** Popcorn box — Food & Beverage order. */
export const FnbBagIcon: FC<IconProps> = (p) => (
    <Svg {...p}>
        <path d="M6 9h12l-1 10.2a1.5 1.5 0 0 1-1.5 1.3h-7A1.5 1.5 0 0 1 7 19.2L6 9Z" />
        <path d="M6 9c0-1.4 1.1-2.3 2.3-2.1a2 2 0 0 1 3.7-1 2 2 0 0 1 3.7 1C16.9 6.7 18 7.6 18 9" />
        <path d="M10 12v6M14 12v6" />
    </Svg>
);

/** Generic image / picture — crop & empty photo states. */
export const ImageIcon: FC<IconProps> = (p) => (
    <Svg {...p}>
        <rect x="3" y="4.5" width="18" height="15" rx="2.4" />
        <circle cx="8.5" cy="9.5" r="1.6" />
        <path d="m4 17 4.5-4.3a1.5 1.5 0 0 1 2 0L15 17M13 15l1.8-1.7a1.5 1.5 0 0 1 2 0L21 16.4" />
    </Svg>
);

/** Burger — snack F&B type. */
export const BurgerIcon: FC<IconProps> = (p) => (
    <Svg {...p}>
        <path d="M4 10.5C4 7 7.6 4.8 12 4.8s8 2.2 8 5.7" />
        <path d="M4.2 13.2h15.6M5 16h14" />
        <path d="M5 18.4h14a2 2 0 0 1-2 2.1H7a2 2 0 0 1-2-2.1Z" />
    </Svg>
);

/** Plate — cooked food F&B type. */
export const MealIcon: FC<IconProps> = (p) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="3.1" />
    </Svg>
);

/** Soda cup with straw — drink F&B type. */
export const DrinkCupIcon: FC<IconProps> = (p) => (
    <Svg {...p}>
        <path d="M7 8h10l-1 11.6a1.5 1.5 0 0 1-1.5 1.4h-5A1.5 1.5 0 0 1 8 19.6L7 8Z" />
        <path d="M6.4 8h11.2" />
        <path d="M13.2 8 15 3.8" />
    </Svg>
);

/** Carton — bottled/boxed beverage F&B type. */
export const JuiceBoxIcon: FC<IconProps> = (p) => (
    <Svg {...p}>
        <path d="M7.5 8h9v11.5a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 7.5 19.5V8Z" />
        <path d="M7.5 8 9 4.8h6L16.5 8" />
        <path d="M13 4.8V8" />
    </Svg>
);

/** Eye — reveal password. */
export const EyeIcon: FC<IconProps> = (p) => (
    <Svg {...p}>
        <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
        <circle cx="12" cy="12" r="3" />
    </Svg>
);

/** Eye with a slash — hide password. */
export const EyeOffIcon: FC<IconProps> = (p) => (
    <Svg {...p}>
        <path d="M4 4l16 16" />
        <path d="M9.9 5.2A9.7 9.7 0 0 1 12 5c6 0 9.5 7 9.5 7a16.4 16.4 0 0 1-2.9 3.6" />
        <path d="M6.3 7.3A15.9 15.9 0 0 0 2.5 12S6 19 12 19c1.2 0 2.3-.2 3.3-.6" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </Svg>
);

/** Film reel — filmography / no-poster fallback. */
export const FilmReelIcon: FC<IconProps> = (p) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="6.5" r="1.1" />
        <circle cx="12" cy="17.5" r="1.1" />
        <circle cx="6.5" cy="12" r="1.1" />
        <circle cx="17.5" cy="12" r="1.1" />
    </Svg>
);

/** Ribboned gift box — voucher / redeem-with-points. */
export const GiftIcon: FC<IconProps> = (p) => (
    <Svg {...p}>
        <path d="M4 10.5h16v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-8Z" />
        <rect x="3" y="7.5" width="18" height="3.5" rx="1" />
        <path d="M12 7.5V20" />
        <path d="M12 7.5c-1.2-3.4-6-3.6-6-1 0 1.4 1.6 1 6 1Z" />
        <path d="M12 7.5c1.2-3.4 6-3.6 6-1 0 1.4-1.6 1-6 1Z" />
    </Svg>
);

/** Five-point star — loyalty points. */
export const StarPointsIcon: FC<IconProps> = (p) => (
    <Svg {...p}>
        <path d="M12 3.5l2.4 5.4 5.9.6-4.4 4 1.3 5.8L12 16.4 6.8 19.3l1.3-5.8-4.4-4 5.9-.6L12 3.5Z" />
    </Svg>
);

/** Circled checkmark — success / redeemed / applied confirmation. */
export const CheckCircleIcon: FC<IconProps> = (p) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M8.3 12.3l2.6 2.6 5-5.4" />
    </Svg>
);

/** X — close / remove / dismiss. */
export const CloseIcon: FC<IconProps> = (p) => (
    <Svg {...p}>
        <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
);

/** Right-pointing chevron — navigate into / "see more". */
export const ChevronRightIcon: FC<IconProps> = (p) => (
    <Svg {...p}>
        <path d="M9 5l7 7-7 7" />
    </Svg>
);

/** Calendar — validity dates / expiry. */
export const CalendarIcon: FC<IconProps> = (p) => (
    <Svg {...p}>
        <rect x="3.5" y="5.5" width="17" height="15" rx="2.2" />
        <path d="M3.5 10h17" />
        <path d="M8 3.5v3.5M16 3.5v3.5" />
    </Svg>
);

/** Padlock — locked / not-yet-affordable state. */
export const LockIcon: FC<IconProps> = (p) => (
    <Svg {...p}>
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    </Svg>
);

/** Overlapping squares — copy to clipboard. */
export const CopyIcon: FC<IconProps> = (p) => (
    <Svg {...p}>
        <rect x="9" y="9" width="11.5" height="11.5" rx="2" />
        <path d="M14.5 9V6.5A2 2 0 0 0 12.5 4.5h-8A2 2 0 0 0 2.5 6.5v8a2 2 0 0 0 2 2H7" />
    </Svg>
);

/** Speech bubble with a small spark — AI assistant trigger / bot avatar. */
export const ChatSparkleIcon: FC<IconProps> = (p) => (
    <Svg {...p}>
        <path d="M3.5 12.2c0-4.4 3.8-7.7 8.4-7.7s8.4 3.3 8.4 7.4-3.8 7.4-8.4 7.4c-1 0-1.9-.1-2.8-.4L4.5 20.5l1.1-3.6c-1.3-1.2-2.1-2.8-2.1-4.7Z" />
        <path d="M14.2 8.3l.7 1.7 1.7.7-1.7.7-.7 1.7-.7-1.7-1.7-.7 1.7-.7.7-1.7Z" />
    </Svg>
);

/** Paper plane — send a chat message. */
export const SendIcon: FC<IconProps> = (p) => (
    <Svg {...p}>
        <path d="M20.5 3.5 3 10.6c-.6.25-.6 1.1.02 1.32l6.2 2.2 2.2 6.2c.22.62 1.07.62 1.32.02L20.5 3.5Z" />
        <path d="M20.5 3.5 10.8 13.2" />
    </Svg>
);

/** Diagonal corner arrows — expand mini panel into the full chat page. */
export const ExpandIcon: FC<IconProps> = (p) => (
    <Svg {...p}>
        <path d="M9 4.5H4.5V9M15 4.5h4.5V9M9 19.5H4.5V15M15 19.5h4.5V15" />
    </Svg>
);
