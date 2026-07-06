import { type FC, memo } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell,
} from "recharts";
import ChartEmptyState from "./ChartEmptyState";

export interface HorizontalBarDatum {
    label: string;
    value: number;
}

interface TooltipPayloadItem {
    value: number;
    payload: HorizontalBarDatum;
}

const BarTooltip: FC<{ active?: boolean; payload?: TooltipPayloadItem[]; valueLabel: string }> = ({ active, payload, valueLabel }) => {
    if (!active || !payload?.length) return null;
    const { label, value } = payload[0].payload;
    return (
        <div className="rpt-tooltip">
            <p className="rpt-tooltip__label">{label}</p>
            <p className="rpt-tooltip__value">{value.toLocaleString("vi-VN")} {valueLabel}</p>
        </div>
    );
};

const BAR_COLORS = ["#E8001C", "#F0334D", "#F5677D", "#F899AB", "#FBC7D0", "#FDE1E7"];

interface Props {
    data: HorizontalBarDatum[];
    valueLabel: string;
    emptyTitle: string;
}

/** Generic horizontal bar chart — used for Top Movies (top 5) and Top F&B
 *  (top 10) so both share one implementation instead of duplicating. */
const HorizontalBarChart: FC<Props> = ({ data, valueLabel, emptyTitle }) => {
    if (data.length === 0) {
        return <ChartEmptyState title={emptyTitle} description="No data for the selected period." />;
    }

    const height = Math.max(180, data.length * 40);

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
                barCategoryGap={10}
            >
                <XAxis type="number" hide />
                <YAxis
                    type="category"
                    dataKey="label"
                    width={140}
                    tick={{ fontSize: 12, fill: "#1D1D1F" }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip content={<BarTooltip valueLabel={valueLabel} />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22} animationDuration={600}>
                    {data.map((entry, i) => (
                        <Cell key={entry.label} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default memo(HorizontalBarChart);
