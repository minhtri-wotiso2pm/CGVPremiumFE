import { type FC, memo } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
} from "recharts";
import ChartEmptyState from "./ChartEmptyState";

export interface VerticalBarDatum {
    label: string;
    bookings: number;
    tickets: number;
}

interface TooltipPayloadItem {
    dataKey: string;
    value: number;
    color: string;
}

const SERIES_LABEL: Record<string, string> = {
    bookings: "Bookings",
    tickets: "Tickets Sold",
};

const GroupedTooltip: FC<{ active?: boolean; payload?: TooltipPayloadItem[]; label?: string }> = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rpt-tooltip">
            <p className="rpt-tooltip__label">{label}</p>
            {payload.map((p) => (
                <p key={p.dataKey} className="rpt-tooltip__row">
                    <span className="rpt-tooltip__dot" style={{ background: p.color }} />
                    {SERIES_LABEL[p.dataKey] ?? p.dataKey}: <strong>{p.value.toLocaleString("vi-VN")}</strong>
                </p>
            ))}
        </div>
    );
};

interface Props {
    data: VerticalBarDatum[];
}

/** Grouped vertical bars — Booking Count vs Tickets Sold, per cinema. */
const VerticalBarChart: FC<Props> = ({ data }) => {
    if (data.length === 0) {
        return <ChartEmptyState title="No cinema data" description="No bookings recorded for the selected period." />;
    }

    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#6E6E73" }}
                    axisLine={{ stroke: "rgba(0,0,0,0.08)" }}
                    tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: "#AEAEB2" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={<GroupedTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="bookings" name="Bookings" fill="#1D1D1F" radius={[6, 6, 0, 0]} maxBarSize={28} animationDuration={600} />
                <Bar dataKey="tickets" name="Tickets Sold" fill="#E8001C" radius={[6, 6, 0, 0]} maxBarSize={28} animationDuration={600} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default memo(VerticalBarChart);
