import { type FC } from "react";
import { Button } from "antd";
import type { TopSelling } from "../types/report.types";
import { TOP_MOVIES_LIMIT, TOP_FNB_LIMIT } from "../constants/report.constants";
import ChartCard from "../charts/ChartCard";
import ChartSkeleton from "../charts/ChartSkeleton";
import HorizontalBarChart from "../charts/HorizontalBarChart";
import VerticalBarChart from "../charts/VerticalBarChart";

interface Props {
    data?: TopSelling;
    loading: boolean;
    isError?: boolean;
    onRetry?: () => void;
}

const TopSellingSection: FC<Props> = ({ data, loading, isError, onRetry }) => {
    if (isError) {
        return (
            <div className="dash-card" style={{ padding: "48px 24px", textAlign: "center" }}>
                <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "var(--dash-text-1)" }}>
                    Failed to load top-selling data
                </p>
                {onRetry && <Button onClick={onRetry}>Retry</Button>}
            </div>
        );
    }

    return (
        <div className="rpt-top-grid">
            <ChartCard title="Top Movies" subtitle={`Top ${TOP_MOVIES_LIMIT} by tickets sold`}>
                {loading ? <ChartSkeleton height={220} /> : (
                    <HorizontalBarChart
                        data={(data?.movies ?? []).slice(0, TOP_MOVIES_LIMIT).map((m) => ({ label: m.title, value: m.ticketsSold }))}
                        valueLabel="tickets"
                        emptyTitle="No movie sales yet"
                    />
                )}
            </ChartCard>

            <ChartCard title="Top F&B" subtitle={`Top ${TOP_FNB_LIMIT} by quantity sold`}>
                {loading ? <ChartSkeleton height={360} /> : (
                    <HorizontalBarChart
                        data={(data?.fnbProducts ?? []).slice(0, TOP_FNB_LIMIT).map((p) => ({ label: p.productName, value: p.quantitySold }))}
                        valueLabel="sold"
                        emptyTitle="No F&B sales yet"
                    />
                )}
            </ChartCard>

            <ChartCard title="Top Cinemas" subtitle="Bookings vs tickets sold">
                {loading ? <ChartSkeleton height={280} /> : (
                    <VerticalBarChart
                        data={(data?.cinemas ?? []).map((c) => ({ label: c.cinemaName, bookings: c.bookingCount, tickets: c.ticketsSold }))}
                    />
                )}
            </ChartCard>
        </div>
    );
};

export default TopSellingSection;
