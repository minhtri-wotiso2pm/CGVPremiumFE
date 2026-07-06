import { type FC, memo } from "react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import type { RevenuePoint } from "../types/report.types";
import { formatCompactVnd, formatVnd, formatNumber } from "../utils/formatters";
import ChartEmptyState from "./ChartEmptyState";

const CalendarIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const TicketIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9a3 3 0 010 6v2a2 2 0 002 2h16a2 2 0 002-2v-2a3 3 0 010-6V7a2 2 0 00-2-2H4a2 2 0 00-2 2z" />
    </svg>
);
const PopcornIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8l1.5 13h9L18 8" /><path d="M4.5 8h15L18 4.5a2 2 0 00-2-1.5H8a2 2 0 00-2 1.5z" />
    </svg>
);
const CalendarCheckIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><polyline points="9 15 11 17 15 13" />
    </svg>
);
const UsersIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" />
    </svg>
);

interface TooltipPayloadItem {
    payload: RevenuePoint;
}

/** Rich tooltip: gross revenue front and center, then the ticket/F&B/
 *  booking/tickets breakdown for that exact point, plus a small 2-color
 *  bar showing the ticket-vs-F&B split at a glance. */
const RevenueTooltip: FC<{ active?: boolean; payload?: TooltipPayloadItem[]; label?: string }> = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const point = payload[0].payload;
    const splitTotal = point.ticketRevenue + point.fnbRevenue;
    const ticketPct = splitTotal > 0 ? (point.ticketRevenue / splitTotal) * 100 : 0;

    return (
        <div className="rpt-tooltip rpt-tooltip--rich">
            <p className="rpt-tooltip__label">{label}</p>
            <p className="rpt-tooltip__hero">{formatVnd(point.revenue)}</p>

            <div className="rpt-tooltip__rows">
                <div className="rpt-tooltip__row">
                    <span className="rpt-tooltip__row-icon" style={{ color: "#E8001C" }}><TicketIcon /></span>
                    Ticket: <strong>{formatVnd(point.ticketRevenue)}</strong>
                </div>
                <div className="rpt-tooltip__row">
                    <span className="rpt-tooltip__row-icon" style={{ color: "#1D1D1F" }}><PopcornIcon /></span>
                    F&amp;B: <strong>{formatVnd(point.fnbRevenue)}</strong>
                </div>
                <div className="rpt-tooltip__row">
                    <span className="rpt-tooltip__row-icon"><CalendarCheckIcon /></span>
                    Bookings: <strong>{formatNumber(point.bookingCount)}</strong>
                </div>
                <div className="rpt-tooltip__row">
                    <span className="rpt-tooltip__row-icon"><UsersIcon /></span>
                    Tickets Sold: <strong>{formatNumber(point.ticketsSold)}</strong>
                </div>
            </div>

            {splitTotal > 0 && (
                <div className="rpt-tooltip__bar" title={`Ticket ${ticketPct.toFixed(0)}% · F&B ${(100 - ticketPct).toFixed(0)}%`}>
                    <div className="rpt-tooltip__bar-fill rpt-tooltip__bar-fill--ticket" style={{ width: `${ticketPct}%` }} />
                    <div className="rpt-tooltip__bar-fill rpt-tooltip__bar-fill--fnb" style={{ width: `${100 - ticketPct}%` }} />
                </div>
            )}
        </div>
    );
};

interface Props {
    /** Revenue points from GET /reports/revenue, grouped by day/week/month. */
    data: RevenuePoint[];
}

/** Revenue-over-time area chart, bound to GET /reports/revenue. */
const RevenueAreaChart: FC<Props> = ({ data }) => {
    if (data.length === 0) {
        return (
            <ChartEmptyState
                icon={<CalendarIcon />}
                title="No revenue in this period"
                description="Try a different date range or grouping."
            />
        );
    }

    return (
        <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ top: 8, right: 28, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="rptRevenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E8001C" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="#E8001C" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#AEAEB2" }}
                    axisLine={{ stroke: "rgba(0,0,0,0.08)" }}
                    tickLine={false}
                    padding={{ left: 8, right: 8 }}
                />
                <YAxis
                    tick={{ fontSize: 11, fill: "#AEAEB2" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => formatCompactVnd(v)}
                    width={64}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#E8001C"
                    strokeWidth={2.5}
                    fill="url(#rptRevenueFill)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
                    animationDuration={600}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default memo(RevenueAreaChart);
