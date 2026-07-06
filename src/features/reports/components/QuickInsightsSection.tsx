import { type FC } from "react";
import type { Insight } from "../utils/insights";

interface Props {
    insights: Insight[];
    loading: boolean;
}

const QuickInsightsSection: FC<Props> = ({ insights, loading }) => {
    if (loading) {
        return (
            <div className="rpt-insights-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rpt-insight rpt-insight--skeleton" aria-hidden="true">
                        <div className="rpt-kpi__skel-line" style={{ width: "60%" }} />
                        <div className="rpt-kpi__skel-line" style={{ width: "80%", height: 18, marginTop: 8 }} />
                    </div>
                ))}
            </div>
        );
    }

    if (insights.length === 0) return null;

    return (
        <div className="rpt-insights-grid">
            {insights.map((insight) => (
                <div key={insight.key} className="rpt-insight">
                    <span className="rpt-insight__label">{insight.label}</span>
                    <span className="rpt-insight__value" title={insight.value}>{insight.value}</span>
                    {insight.sub && <span className="rpt-insight__sub">{insight.sub}</span>}
                </div>
            ))}
        </div>
    );
};

export default QuickInsightsSection;
