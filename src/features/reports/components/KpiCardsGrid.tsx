import { type FC } from "react";
import type { RevenueSummary } from "../types/report.types";
import type { RevenueTrendDelta } from "../hooks/useReports";
import { formatVnd, formatNumber } from "../utils/formatters";
import KpiCard, { KpiCardSkeleton } from "./KpiCard";

const IconWallet = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 010-4h14v4" /><path d="M3 5v14a2 2 0 002 2h16v-5" /><path d="M18 12a2 2 0 000 4h4v-4z" />
    </svg>
);
const IconTicket = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9a3 3 0 010 6v2a2 2 0 002 2h16a2 2 0 002-2v-2a3 3 0 010-6V7a2 2 0 00-2-2H4a2 2 0 00-2 2z" />
        <line x1="13" y1="5" x2="13" y2="19" strokeDasharray="2 2" />
    </svg>
);
const IconPopcorn = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8l1.5 13h9L18 8" /><path d="M4.5 8h15L18 4.5a2 2 0 00-2-1.5H8a2 2 0 00-2 1.5z" />
        <line x1="12" y1="8" x2="12" y2="21" /><line x1="8.5" y1="8" x2="9.5" y2="21" /><line x1="15.5" y1="8" x2="14.5" y2="21" />
    </svg>
);
const IconTag = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41L11.17 22.83a2 2 0 01-2.83 0L2 16.5V4a2 2 0 012-2h12.5z" />
        <path d="M2 16.5L11.17 7.34" /><circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
);
const IconCalendarCheck = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" /><polyline points="9 15 11 17 15 13" />
    </svg>
);
const IconUsers = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16.5 3.13a4 4 0 010 7.75" />
    </svg>
);
const IconTrendUp = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
);

interface Props {
    summary?: RevenueSummary;
    deltas?: RevenueTrendDelta;
    loading: boolean;
}

const KpiCardsGrid: FC<Props> = ({ summary, deltas, loading }) => {
    if (loading || !summary) {
        return (
            <div className="rpt-kpi-grid">
                {Array.from({ length: 7 }).map((_, i) => (
                    <KpiCardSkeleton key={i} hero={i === 0} />
                ))}
            </div>
        );
    }

    return (
        <div className="rpt-kpi-grid">
            <KpiCard
                hero
                label="Gross Revenue"
                value={summary.grossRevenue}
                format={formatVnd}
                icon={<IconWallet />}
                deltaPct={deltas?.grossRevenue}
                hint={`${formatNumber(summary.bookingCount)} bookings`}
            />
            <KpiCard
                label="Ticket Revenue"
                value={summary.ticketRevenue}
                format={formatVnd}
                icon={<IconTicket />}
                deltaPct={deltas?.ticketRevenue}
            />
            <KpiCard
                label="F&B Revenue"
                value={summary.fnbRevenue}
                format={formatVnd}
                icon={<IconPopcorn />}
                deltaPct={deltas?.fnbRevenue}
            />
            <KpiCard
                label="Discount"
                value={summary.discountAmount}
                format={formatVnd}
                icon={<IconTag />}
                deltaPct={deltas?.discountAmount}
            />
            <KpiCard
                label="Bookings"
                value={summary.bookingCount}
                format={formatNumber}
                icon={<IconCalendarCheck />}
                deltaPct={deltas?.bookingCount}
            />
            <KpiCard
                label="Tickets Sold"
                value={summary.ticketsSold}
                format={formatNumber}
                icon={<IconUsers />}
                deltaPct={deltas?.ticketsSold}
            />
            <KpiCard
                label="Avg Order Value"
                value={summary.averageOrderValue}
                format={formatVnd}
                icon={<IconTrendUp />}
                deltaPct={deltas?.averageOrderValue}
            />
        </div>
    );
};

export default KpiCardsGrid;
