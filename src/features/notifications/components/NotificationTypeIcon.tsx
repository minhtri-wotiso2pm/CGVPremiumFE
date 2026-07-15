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

const ICON_MAP: Record<NotificationType, FC<IconProps>> = {
    booking: BookingIcon,
    payment: PaymentIcon,
    refund: RefundIcon,
    promotion: PromotionIcon,
    account: AccountIcon,
    system: SystemIcon,
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
