import { type FC, type ReactNode } from "react";

interface Props {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    children: ReactNode;
    className?: string;
}

/** Shared card chrome for every chart in the dashboard — keeps title,
 *  padding, and border/shadow treatment consistent across sections. */
const ChartCard: FC<Props> = ({ title, subtitle, actions, children, className }) => (
    <div className={`rpt-chart-card${className ? ` ${className}` : ""}`}>
        <div className="rpt-chart-card__head">
            <div>
                <h3 className="rpt-chart-card__title">{title}</h3>
                {subtitle && <p className="rpt-chart-card__subtitle">{subtitle}</p>}
            </div>
            {actions}
        </div>
        <div className="rpt-chart-card__body">{children}</div>
    </div>
);

export default ChartCard;
