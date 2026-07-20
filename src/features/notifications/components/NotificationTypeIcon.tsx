import { type FC } from "react";
import type { NotificationType } from "../types/notification.types";

interface IconProps {
    size?: number;
}

/* Thin, monochrome line icons (uses currentColor) — deliberately avoids
 * emoji, which render inconsistently across OS/browsers and read as
 * cheap/inconsistent next to the rest of this design system. */

const BookingIcon: FC<IconProps> = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9a2 2 0 002-2V6a1 1 0 011-1h12a1 1 0 011 1v1a2 2 0 000 4v1a2 2 0 000 4v1a1 1 0 01-1 1H6a1 1 0 01-1-1v-1a2 2 0 00-2-2z" />
        <line x1="12" y1="5" x2="12" y2="19" strokeDasharray="1.5 2.5" />
    </svg>
);

const PaymentIcon: FC<IconProps> = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="5" width="19" height="14" rx="2.2" />
        <line x1="2.5" y1="9.5" x2="21.5" y2="9.5" />
        <line x1="6" y1="15" x2="10" y2="15" />
    </svg>
);

const RefundIcon: FC<IconProps> = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 2.64-6.36" />
        <polyline points="3 4 3 9 8 9" />
    </svg>
);

const PromotionIcon: FC<IconProps> = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41 12.5 21.5a2 2 0 0 1-2.83 0l-7.17-7.17a2 2 0 0 1 0-2.83L10.5 3.41A2 2 0 0 1 12 2.8h6.5A2.7 2.7 0 0 1 21.2 5.5V12a2 2 0 0 1-.61 1.41z" />
        <circle cx="16.2" cy="7.8" r="1.3" fill="currentColor" stroke="none" />
    </svg>
);

const AccountIcon: FC<IconProps> = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="3.6" />
        <path d="M4.5 20.2a7.5 7.5 0 0 1 15 0" />
    </svg>
);

const SystemIcon: FC<IconProps> = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9.2" />
        <line x1="12" y1="10.6" x2="12" y2="16" />
        <circle cx="12" cy="7.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
);

const AnalyticsIcon: FC<IconProps> = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4v15a1 1 0 0 0 1 1h15" />
        <rect x="7.5" y="12" width="2.6" height="4.5" rx="0.5" />
        <rect x="12.7" y="8.5" width="2.6" height="8" rx="0.5" />
        <rect x="17.9" y="5.5" width="2.6" height="11" rx="0.5" />
    </svg>
);

const ReportIcon: FC<IconProps> = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
        <path d="M14 3v4h4" />
        <line x1="8.5" y1="12" x2="15.5" y2="12" />
        <line x1="8.5" y1="15.5" x2="15.5" y2="15.5" />
    </svg>
);

const MovieIcon: FC<IconProps> = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <line x1="7.5" y1="4" x2="7.5" y2="20" />
        <line x1="16.5" y1="4" x2="16.5" y2="20" />
        <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
);

const ShowtimeIcon: FC<IconProps> = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15.5 14" />
    </svg>
);

const ICON_MAP: Record<NotificationType, FC<IconProps>> = {
    booking: BookingIcon,
    payment: PaymentIcon,
    refund: RefundIcon,
    promotion: PromotionIcon,
    account: AccountIcon,
    system: SystemIcon,
    analytics: AnalyticsIcon,
    report: ReportIcon,
    movie: MovieIcon,
    showtime: ShowtimeIcon,
};

interface Props {
    type: NotificationType;
    size?: number;
}

const NotificationTypeIcon: FC<Props> = ({ type, size = 18 }) => {
    const Icon = ICON_MAP[type] ?? SystemIcon;
    return <Icon size={size} />;
};

export default NotificationTypeIcon;
