import { type FC, type ReactNode } from "react";

const ChartEmptyState: FC<{ title: string; description?: string; icon?: ReactNode; height?: number }> = ({
    title, description, icon, height = 280,
}) => (
    <div className="rpt-chart-empty" style={{ height }}>
        {icon && <div className="rpt-chart-empty__icon">{icon}</div>}
        <p className="rpt-chart-empty__title">{title}</p>
        {description && <p className="rpt-chart-empty__desc">{description}</p>}
    </div>
);

export default ChartEmptyState;
