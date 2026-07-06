import type { FC } from "react";

interface Props {
    hasVip?: boolean;
    hasCouple?: boolean;
    hasEconomy?: boolean;
    hasPoor?: boolean;
}

const SeatLegend: FC<Props> = ({ hasVip, hasCouple, hasEconomy, hasPoor }) => (
    <div className="cgv-seats-legend" aria-label="Legend">
        <div className="cgv-seats-legend-item">
            <span className="cgv-seats-legend-box cgv-seats-legend-box--available" />
            Available
        </div>
        <div className="cgv-seats-legend-item">
            <span className="cgv-seats-legend-box cgv-seats-legend-box--selected" />
            Selected
        </div>
        <div className="cgv-seats-legend-item">
            <span className="cgv-seats-legend-box cgv-seats-legend-box--unavailable" />
            Unavailable
        </div>
        {hasEconomy && (
            <div className="cgv-seats-legend-item">
                <span className="cgv-seats-legend-box cgv-seats-legend-box--economy" />
                Economy
            </div>
        )}
        {hasPoor && (
            <div className="cgv-seats-legend-item">
                <span className="cgv-seats-legend-box cgv-seats-legend-box--poor" />
                Poor
            </div>
        )}
        {hasVip && (
            <div className="cgv-seats-legend-item">
                <span className="cgv-seats-legend-box cgv-seats-legend-box--vip" />
                VIP
            </div>
        )}
        {hasCouple && (
            <div className="cgv-seats-legend-item">
                <span className="cgv-seats-legend-box cgv-seats-legend-box--couple" />
                Couple (chọn theo cặp)
            </div>
        )}
    </div>
);

export default SeatLegend;
