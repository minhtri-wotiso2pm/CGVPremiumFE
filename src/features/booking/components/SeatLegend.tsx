import type { FC } from "react";
import { useTranslation } from "react-i18next";

interface Props {
    hasVip?: boolean;
    hasCouple?: boolean;
    hasEconomy?: boolean;
    hasPoor?: boolean;
}

const SeatLegend: FC<Props> = ({ hasVip, hasCouple, hasEconomy, hasPoor }) => {
    const { t } = useTranslation("booking");
    return (
        <div className="cgv-seats-legend" aria-label={t("seats.legend")}>
            <div className="cgv-seats-legend-item">
                <span className="cgv-seats-legend-box cgv-seats-legend-box--available" />
                {t("seats.available")}
            </div>
            <div className="cgv-seats-legend-item">
                <span className="cgv-seats-legend-box cgv-seats-legend-box--selected" />
                {t("seats.selected")}
            </div>
            <div className="cgv-seats-legend-item">
                <span className="cgv-seats-legend-box cgv-seats-legend-box--unavailable" />
                {t("seats.unavailable")}
            </div>
            {hasEconomy && (
                <div className="cgv-seats-legend-item">
                    <span className="cgv-seats-legend-box cgv-seats-legend-box--economy" />
                    {t("seats.typeEconomy")}
                </div>
            )}
            {hasPoor && (
                <div className="cgv-seats-legend-item">
                    <span className="cgv-seats-legend-box cgv-seats-legend-box--poor" />
                    {t("seats.typePoor")}
                </div>
            )}
            {hasVip && (
                <div className="cgv-seats-legend-item">
                    <span className="cgv-seats-legend-box cgv-seats-legend-box--vip" />
                    {t("seats.typeVip")}
                </div>
            )}
            {hasCouple && (
                <div className="cgv-seats-legend-item">
                    <span className="cgv-seats-legend-box cgv-seats-legend-box--couple" />
                    {t("seats.typeCouple")}
                </div>
            )}
        </div>
    );
};

export default SeatLegend;
