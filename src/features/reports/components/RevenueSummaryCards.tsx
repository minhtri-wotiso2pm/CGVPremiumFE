import { type FC } from "react";
import type { RevenueSummary } from "../types/report.types";

const formatVnd = (n: number) => `${Math.round(n).toLocaleString("vi-VN")} ₫`;
const formatNum = (n: number) => n.toLocaleString("vi-VN");

interface Props {
    data?: RevenueSummary;
    loading: boolean;
}

const Card: FC<{ label: string; value: string; hint?: string; hero?: boolean }> = ({
    label, value, hint, hero,
}) => (
    <div className={`rpt-card${hero ? " rpt-card--hero" : ""}`}>
        <span className="rpt-card__label">{label}</span>
        <span className="rpt-card__value">{value}</span>
        {hint && <span className="rpt-card__hint">{hint}</span>}
    </div>
);

const RevenueSummaryCards: FC<Props> = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="rpt-cards">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={`rpt-card rpt-card--skeleton${i === 0 ? " rpt-card--hero" : ""}`}>
                        <span className="rpt-card__label">—</span>
                        <span className="rpt-card__value">—</span>
                    </div>
                ))}
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="rpt-cards">
            <Card hero label="Gross Revenue" value={formatVnd(data.grossRevenue)} hint={`${formatNum(data.bookingCount)} bookings`} />
            <Card label="Ticket Revenue" value={formatVnd(data.ticketRevenue)} />
            <Card label="F&B Revenue" value={formatVnd(data.fnbRevenue)} />
            <Card label="Discounts" value={formatVnd(data.discountAmount)} />
            <Card label="Tickets Sold" value={formatNum(data.ticketsSold)} />
            <Card label="Avg Order Value" value={formatVnd(data.averageOrderValue)} />
        </div>
    );
};

export default RevenueSummaryCards;
