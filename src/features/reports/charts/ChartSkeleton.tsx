import { type FC } from "react";

const ChartSkeleton: FC<{ height?: number }> = ({ height = 280 }) => (
    <div className="rpt-chart-skeleton" style={{ height }} aria-hidden="true" />
);

export default ChartSkeleton;
