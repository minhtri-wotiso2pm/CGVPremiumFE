import { type FC, memo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatVnd } from "../utils/formatters";
import ChartEmptyState from "./ChartEmptyState";

interface Props {
    ticketRevenue: number;
    fnbRevenue: number;
}

interface TooltipPayloadItem {
    name: string;
    value: number;
}

const DonutTooltip: FC<{ active?: boolean; payload?: TooltipPayloadItem[] }> = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rpt-tooltip">
            <p className="rpt-tooltip__label">{payload[0].name}</p>
            <p className="rpt-tooltip__value">{formatVnd(payload[0].value)}</p>
        </div>
    );
};

const COLORS = ["#E8001C", "#1D1D1F"];

/** Ticket vs F&B revenue split, with the gross total centered inside the ring. */
const RevenueDonutChart: FC<Props> = ({ ticketRevenue, fnbRevenue }) => {
    const total = ticketRevenue + fnbRevenue;
    if (total <= 0) {
        return <ChartEmptyState title="No revenue yet" description="No revenue recorded for the selected period." height={220} />;
    }

    const data = [
        { name: "Ticket Revenue", value: ticketRevenue },
        { name: "F&B Revenue", value: fnbRevenue },
    ];

    return (
        <div className="rpt-donut">
            <div className="rpt-donut__ring">
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={62}
                            outerRadius={88}
                            paddingAngle={2}
                            animationDuration={600}
                            strokeWidth={0}
                        >
                            {data.map((entry, i) => (
                                <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<DonutTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="rpt-donut__center">
                    <span className="rpt-donut__center-value">{formatVnd(total)}</span>
                    <span className="rpt-donut__center-label">Gross Revenue</span>
                </div>
            </div>
            <div className="rpt-donut__legend">
                <span className="rpt-donut__legend-item">
                    <span className="rpt-donut__dot" style={{ background: COLORS[0] }} />
                    Ticket · {((ticketRevenue / total) * 100).toFixed(0)}%
                </span>
                <span className="rpt-donut__legend-item">
                    <span className="rpt-donut__dot" style={{ background: COLORS[1] }} />
                    F&amp;B · {((fnbRevenue / total) * 100).toFixed(0)}%
                </span>
            </div>
        </div>
    );
};

export default memo(RevenueDonutChart);
