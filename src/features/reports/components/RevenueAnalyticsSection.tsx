import { type FC } from "react";
import { Button, Segmented } from "antd";
import type { RevenueGroupBy, RevenuePoint, RevenueSummary } from "../types/report.types";
import { GROUP_BY_OPTIONS } from "../constants/report.constants";
import ChartCard from "../charts/ChartCard";
import ChartSkeleton from "../charts/ChartSkeleton";
import RevenueAreaChart from "../charts/RevenueAreaChart";
import RevenueDonutChart from "../charts/RevenueDonutChart";

interface Props {
    points: RevenuePoint[];
    summary?: RevenueSummary;
    groupBy: RevenueGroupBy;
    onGroupByChange: (groupBy: RevenueGroupBy) => void;
    loading: boolean;
    isError?: boolean;
    onRetry?: () => void;
}

const GROUP_BY_SUBTITLE: Record<RevenueGroupBy, string> = {
    day: "Gross revenue per day for the selected period",
    week: "Gross revenue per week for the selected period",
    month: "Gross revenue per month for the selected period",
};

/** Big trend chart (bound to GET /reports/revenue, day/week/month) + the
 *  ticket/F&B revenue split, side by side. */
const RevenueAnalyticsSection: FC<Props> = ({ points, summary, groupBy, onGroupByChange, loading, isError, onRetry }) => {
    if (isError) {
        return (
            <div className="dash-card" style={{ padding: "48px 24px", textAlign: "center" }}>
                <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "var(--dash-text-1)" }}>
                    Failed to load revenue analytics
                </p>
                {onRetry && <Button onClick={onRetry}>Retry</Button>}
            </div>
        );
    }

    return (
        <div className="rpt-analytics-grid">
            <ChartCard
                title="Revenue Over Time"
                subtitle={GROUP_BY_SUBTITLE[groupBy]}
                className="rpt-analytics-grid__main"
                actions={(
                    <Segmented
                        size="small"
                        value={groupBy}
                        onChange={(v) => onGroupByChange(v as RevenueGroupBy)}
                        options={[...GROUP_BY_OPTIONS]}
                    />
                )}
            >
                {loading ? <ChartSkeleton /> : <RevenueAreaChart data={points} />}
            </ChartCard>

            <ChartCard title="Revenue Split" subtitle="Ticket vs Food &amp; Beverage">
                {loading || !summary ? <ChartSkeleton height={220} /> : (
                    <RevenueDonutChart ticketRevenue={summary.ticketRevenue} fnbRevenue={summary.fnbRevenue} />
                )}
            </ChartCard>
        </div>
    );
};

export default RevenueAnalyticsSection;
