import { type FC, memo } from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

interface Props {
    data: number[];
    color?: string;
}

/** Tiny trend line for KPI cards. Not rendered anywhere yet — there's no
 *  per-day series to back it (see RevenueAreaChart) and we decided not to
 *  fake one. Kept ready so a KpiCard can pass real daily values in as soon
 *  as the backend exposes them, with zero rework. */
const Sparkline: FC<Props> = ({ data, color = "#E8001C" }) => {
    if (data.length < 2) return null;

    const points = data.map((value, i) => ({ i, value }));

    return (
        <ResponsiveContainer width="100%" height={32}>
            <AreaChart data={points} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="rptSparkFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={1.5}
                    fill="url(#rptSparkFill)"
                    isAnimationActive={false}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default memo(Sparkline);
