import { type FC, type ReactNode } from "react";
import { useCountUp } from "../hooks/useCountUp";

const ArrowUpIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
    </svg>
);
const ArrowDownIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
    </svg>
);

interface Props {
    label: string;
    value: number;
    format: (n: number) => string;
    icon: ReactNode;
    /** Real period-over-period % change, or null/undefined when there's no baseline to compare against. */
    deltaPct?: number | null;
    hint?: string;
    hero?: boolean;
}

const KpiCard: FC<Props> = ({ label, value, format, icon, deltaPct, hint, hero }) => {
    const animated = useCountUp(value);

    return (
        <div className={`rpt-kpi${hero ? " rpt-kpi--hero" : ""}`}>
            <div className="rpt-kpi__icon">{icon}</div>
            <span className="rpt-kpi__label">{label}</span>
            <span className="rpt-kpi__value">{format(animated)}</span>
            <div className="rpt-kpi__foot">
                {typeof deltaPct === "number" && (
                    <span className={`rpt-kpi__delta${deltaPct < 0 ? " rpt-kpi__delta--down" : ""}`}>
                        {deltaPct < 0 ? <ArrowDownIcon /> : <ArrowUpIcon />}
                        {Math.abs(deltaPct).toFixed(1)}%
                    </span>
                )}
                {hint && <span className="rpt-kpi__hint">{hint}</span>}
            </div>
        </div>
    );
};

export const KpiCardSkeleton: FC<{ hero?: boolean }> = ({ hero }) => (
    <div className={`rpt-kpi rpt-kpi--skeleton${hero ? " rpt-kpi--hero" : ""}`} aria-hidden="true">
        <div className="rpt-kpi__skel-icon" />
        <div className="rpt-kpi__skel-line" style={{ width: "50%" }} />
        <div className="rpt-kpi__skel-line" style={{ width: "75%", height: 24, marginTop: 6 }} />
        <div className="rpt-kpi__skel-line" style={{ width: "35%", marginTop: 10 }} />
    </div>
);

export default KpiCard;
